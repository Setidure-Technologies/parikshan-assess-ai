
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  test_status: string;
  company_id: string;
  created_at: string;
  user_id: string | null;
}

export const useCandidates = (profile: any) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile || profile.roles?.name !== 'admin' || !profile.company_id) {
      setCandidates([]);
      setLoading(false);
      return;
    }

    const fetchCandidates = async () => {
      try {
        const { data, error } = await supabase
          .from('candidates')
          .select('*')
          .eq('company_id', profile.company_id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCandidates(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [profile]);

  return { candidates, loading, error, refetch: () => {
    if (profile?.company_id) {
      setLoading(true);
      // Re-trigger the effect
    }
  }};
};
