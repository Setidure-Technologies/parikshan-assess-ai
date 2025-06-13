
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role_id: string;
  company_id: string | null;
  phone: string | null;
  profile_data: any;
  roles: {
    name: string;
  };
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        console.log('Fetching profile for user:', user.id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            roles!inner(name)
          `)
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Profile fetch error:', error);
          throw error;
        }
        
        console.log('Profile fetched:', data);
        setProfile(data);
        setError(null);
      } catch (err: any) {
        console.error('Profile fetch exception:', err);
        setError(err.message);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const refetch = async () => {
    if (user) {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            roles!inner(name)
          `)
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
  };

  return { profile, loading, error, refetch };
};
