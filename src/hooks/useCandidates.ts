
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

  const fetchCandidates = async () => {
    if (!profile || profile.roles?.name !== 'admin' || !profile.company_id) {
      setCandidates([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching candidates for company:', profile.company_id);
      
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching candidates:', error);
        throw error;
      }
      
      console.log('Fetched candidates:', data);
      setCandidates(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Candidates fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [profile]);

  // Set up real-time subscription for candidates
  useEffect(() => {
    if (!profile?.company_id) return;

    const channel = supabase
      .channel('candidates-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'candidates',
          filter: `company_id=eq.${profile.company_id}`
        },
        (payload) => {
          console.log('Candidates change detected:', payload);
          fetchCandidates(); // Refetch candidates when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.company_id]);

  return { 
    candidates, 
    loading, 
    error, 
    refetch: fetchCandidates 
  };
};
