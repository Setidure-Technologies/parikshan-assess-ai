
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      candidate_id, 
      total_score, 
      section_scores, 
      evaluation_data, 
      pdf_report_url, 
      evaluation_status = 'completed' 
    } = req.body;

    console.log('Received evaluation result:', { candidate_id, total_score, evaluation_status });

    if (!candidate_id) {
      return res.status(400).json({ error: 'candidate_id is required' });
    }

    // Insert or update evaluation result
    const { error } = await supabase
      .from('evaluations')
      .upsert({
        candidate_id,
        total_score: parseFloat(total_score) || null,
        section_scores: section_scores || {},
        evaluation_data: evaluation_data || {},
        pdf_report_url,
        evaluation_status,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'candidate_id'
      });

    if (error) {
      console.error('Error saving evaluation result:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('Evaluation result saved successfully for candidate:', candidate_id);
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error in evaluation-result API:', error);
    res.status(500).json({ error: error.message });
  }
}
