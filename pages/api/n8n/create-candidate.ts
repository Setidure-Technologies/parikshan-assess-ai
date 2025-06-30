
import { supabase } from '@/integrations/supabase/client';
import { ACTIVE_WEBHOOKS, makeWebhookRequest } from '@/config/webhooks';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, full_name, user_id, company_id } = req.body;

    // Verify the request has proper authentication
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    // Create candidate record if it doesn't exist
    const { data: existingCandidate } = await supabase
      .from('candidates')
      .select('id')
      .eq('email', email)
      .single();

    if (!existingCandidate) {
      const { error: candidateError } = await supabase
        .from('candidates')
        .insert({
          email,
          full_name,
          user_id,
          company_id: company_id || null,
          test_status: 'pending'
        });

      if (candidateError) {
        console.error('Error creating candidate:', candidateError);
        return res.status(500).json({ error: candidateError.message });
      }
    }

    // Call n8n webhook using the proper webhook configuration
    try {
      const webhookData = {
        email,
        full_name,
        user_id,
        company_id,
        action: 'create_candidate'
      };

      console.log('Calling n8n webhook with data:', webhookData);
      const response = await makeWebhookRequest(ACTIVE_WEBHOOKS.USER_CREATION, webhookData);
      
      if (response.ok) {
        console.log('Successfully called n8n webhook');
      } else {
        console.error('n8n webhook returned non-ok status:', response.status);
      }
    } catch (webhookError) {
      console.error('Error calling n8n webhook:', webhookError);
      // Don't fail the request if webhook fails
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error in create-candidate API:', error);
    res.status(500).json({ error: error.message });
  }
}
