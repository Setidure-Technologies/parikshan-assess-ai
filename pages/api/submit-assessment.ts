import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';

// Create admin client for server-side operations
const supabaseAdmin = createClient(
  'https://xpmqzpqfeaokvugworla.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbXF6cHFmZWFva3Z1Z3dvcmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NzYzOTcsImV4cCI6MjA2NTA1MjM5N30.IVcuNri-LY1IqADDYiWZt7qSxpw92UQuqSSqJwMp64I'
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { candidate_id, user_id, submission_data } = req.body;

    if (!candidate_id || !user_id) {
      return res.status(400).json({ error: 'candidate_id and user_id are required' });
    }

    // Verify the user owns this candidate record
    const { data: candidate, error: candidateError } = await supabaseAdmin
      .from('candidates')
      .select('id, user_id, test_status, submission_count, full_name, email, company_id')
      .eq('id', candidate_id)
      .eq('user_id', user_id)
      .single();

    if (candidateError || !candidate) {
      return res.status(404).json({ error: 'Candidate not found or access denied' });
    }

    // Check submission eligibility using database function
    const { data: eligibilityResult, error: eligibilityError } = await supabaseAdmin
      .rpc('check_submission_eligibility', { candidate_uuid: candidate_id });

    if (eligibilityError) {
      console.error('Error checking eligibility:', eligibilityError);
      return res.status(500).json({ error: 'Failed to check submission eligibility' });
    }

    const eligibility = eligibilityResult[0];
    if (!eligibility.can_submit) {
      return res.status(409).json({ 
        error: eligibility.reason,
        current_status: eligibility.current_status,
        submission_count: eligibility.submission_count
      });
    }

    // Generate idempotency key for webhook
    const idempotencyKey = `${candidate_id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Prepare submission metadata
    const submissionMetadata = {
      ...submission_data,
      idempotency_key: idempotencyKey,
      submitted_via: 'web_portal',
      user_agent: req.headers['user-agent'],
      ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    };

    // Submit assessment using database function
    const { data: submissionResult, error: submissionError } = await supabaseAdmin
      .rpc('submit_assessment', {
        candidate_uuid: candidate_id,
        submission_metadata: submissionMetadata
      });

    if (submissionError) {
      console.error('Error submitting assessment:', submissionError);
      return res.status(500).json({ error: 'Failed to submit assessment' });
    }

    const result = submissionResult[0];
    if (!result.success) {
      return res.status(409).json({ error: result.message });
    }

    // Get company details for webhook
    const { data: companyData } = await supabaseAdmin
      .from('companies')
      .select('name, industry')
      .eq('id', candidate.company_id)
      .single();

    // Prepare comprehensive webhook payload
    const formData = new FormData();
    formData.append('candidate_id', candidate_id);
    formData.append('user_id', user_id);
    formData.append('full_name', candidate.full_name);
    formData.append('email', candidate.email);
    formData.append('company_name', companyData?.name || '');
    formData.append('company_industry', companyData?.industry || '');
    formData.append('submission_attempt', (candidate.submission_count + 1).toString());
    formData.append('submission_id', result.submission_id);
    formData.append('idempotency_key', idempotencyKey);
    formData.append('test_completed_at', new Date().toISOString());
    formData.append('action', 'test_evaluation');
    
    // Add submission data
    if (submission_data) {
      Object.entries(submission_data).forEach(([key, value]) => {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });
    }

    // Call webhook with retry logic
    let webhookSuccess = false;
    let webhookResponse = null;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Webhook attempt ${attempt} for candidate ${candidate_id}`);
        const webhookRes = await fetch('https://n8n.erudites.in/webhook-test/testevaluation', {
          method: 'POST',
          body: formData,
          headers: {
            'X-Idempotency-Key': idempotencyKey,
            'X-Submission-Attempt': (candidate.submission_count + 1).toString()
          }
        });

        if (webhookRes.ok) {
          webhookSuccess = true;
          webhookResponse = await webhookRes.text();
          console.log('Webhook sent successfully');
          break;
        } else {
          console.error(`Webhook attempt ${attempt} failed:`, webhookRes.status, webhookRes.statusText);
          if (attempt === maxRetries) {
            webhookResponse = `Failed after ${maxRetries} attempts`;
          }
        }
      } catch (webhookError) {
        console.error(`Webhook attempt ${attempt} error:`, webhookError);
        if (attempt === maxRetries) {
          webhookResponse = `Error: ${webhookError.message}`;
        }
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    // Update submission log with webhook status
    await supabaseAdmin
      .from('test_submission_logs')
      .update({
        webhook_status: webhookSuccess ? 'success' : 'failed',
        webhook_response: { 
          success: webhookSuccess,
          response: webhookResponse,
          attempts: maxRetries
        }
      })
      .eq('id', result.submission_id);

    res.status(200).json({
      success: true,
      message: result.message,
      submission_id: result.submission_id,
      webhook_sent: webhookSuccess
    });

  } catch (error: any) {
    console.error('Error in submit-assessment API:', error);
    res.status(500).json({ error: error.message });
  }
}