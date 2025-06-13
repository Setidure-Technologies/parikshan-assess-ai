
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { candidate_id, question_id, section_id, answer_data, time_taken_seconds } = req.body;

    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    // Upsert the answer
    const { error } = await supabase
      .from('answers')
      .upsert({
        candidate_id,
        question_id,
        section_id,
        answer_data,
        time_taken_seconds,
        submitted_at: new Date().toISOString()
      }, {
        onConflict: 'candidate_id,question_id'
      });

    if (error) {
      console.error('Error saving answer:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error in save-answer API:', error);
    res.status(500).json({ error: error.message });
  }
}
