
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  question_type: string;
  options: any;
  time_limit_seconds: number;
  section_id: string;
  metadata: any;
}

export const useQuestions = (candidateId: string | null) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!candidateId) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    const fetchQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('candidate_id', candidateId)
          .order('question_number');

        if (error) throw error;
        setQuestions(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [candidateId]);

  return { questions, loading, error };
};
