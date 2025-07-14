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
    const { candidate_id, admin_user_id, reset_reason } = req.body;

    if (!candidate_id || !admin_user_id) {
      return res.status(400).json({ error: 'candidate_id and admin_user_id are required' });
    }

    // Verify admin access
    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        roles!inner(name)
      `)
      .eq('id', admin_user_id)
      .single();

    if (adminError || !adminProfile || adminProfile.roles.name !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Reset assessment using database function
    const { data: resetResult, error: resetError } = await supabaseAdmin
      .rpc('reset_candidate_assessment', {
        candidate_uuid: candidate_id,
        admin_user_id: admin_user_id,
        reset_reason: reset_reason || 'Admin reset for re-evaluation'
      });

    if (resetError) {
      console.error('Error resetting assessment:', resetError);
      return res.status(500).json({ error: 'Failed to reset assessment' });
    }

    const result = resetResult[0];
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    // Get candidate details for logging
    const { data: candidate } = await supabaseAdmin
      .from('candidates')
      .select('full_name, email')
      .eq('id', candidate_id)
      .single();

    console.log(`Assessment reset by admin ${admin_user_id} for candidate ${candidate?.full_name} (${candidate?.email})`);

    res.status(200).json({
      success: true,
      message: result.message,
      candidate_id: candidate_id,
      reset_by: admin_user_id,
      reset_reason: reset_reason
    });

  } catch (error: any) {
    console.error('Error in reset-candidate-assessment API:', error);
    res.status(500).json({ error: error.message });
  }
}