export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const submissionData = req.body;

    console.log('Test submission API called with data:', {
      candidate_id: submissionData.candidate_id,
      candidate_email: submissionData.candidate_email,
      company_name: submissionData.company_name,
      sections_completed: submissionData.sections_completed,
      total_questions: submissionData.total_questions,
      total_answers: submissionData.total_answers
    });

    // Production webhook URL for test evaluation
    const webhookUrl = 'https://n8n.erudites.in/webhook-test/testevaluation';

    // Send to production n8n webhook for test evaluation
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Candidate-ID': submissionData.candidate_id,
        'X-Company-ID': submissionData.company_id,
        'X-User-ID': submissionData.user_id,
        'X-Submission-Time': submissionData.submission_timestamp,
        'X-Test-Status': 'completed',
      },
      body: JSON.stringify(submissionData),
    });

    console.log('Production webhook response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Production webhook response error:', errorText);
      throw new Error(`Production webhook failed: ${response.status} - ${errorText}`);
    }

    const webhookResult = await response.json();
    console.log('Production webhook response:', webhookResult);

    res.status(200).json({ 
      success: true, 
      message: 'Test submitted successfully for evaluation',
      webhook_response: webhookResult,
      webhook_url: webhookUrl
    });

  } catch (error: any) {
    console.error('Error in submit-test API:', error);
    res.status(500).json({ error: error.message });
  }
}