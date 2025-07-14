import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface TestLibraryItem {
  id: string;
  name: string;
  category: string;
  sub_category: string;
  description: string | null;
  duration_minutes: number;
  question_count: number;
  difficulty_level: string;
  is_active: boolean;
  metadata: Json;
}

export interface TestConfiguration {
  selectedTests: TestLibraryItem[];
  testMode: 'pre-built' | 'ai-generated' | 'hybrid';
  customInstructions?: string;
}

export const useTestLibrary = () => {
  const [testLibrary, setTestLibrary] = useState<TestLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTestLibrary = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('test_library')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setTestLibrary(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch test library');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestLibrary();
  }, []);

  const getTestsByCategory = (category: 'psychometric' | 'english') => {
    return testLibrary.filter(test => test.category === category);
  };

  const getTestsBySubCategory = (subCategory: string) => {
    return testLibrary.filter(test => test.sub_category === subCategory);
  };

  const calculateTotalDuration = (selectedTests: TestLibraryItem[]) => {
    return selectedTests.reduce((total, test) => total + test.duration_minutes, 0);
  };

  const calculateTotalQuestions = (selectedTests: TestLibraryItem[]) => {
    return selectedTests.reduce((total, test) => total + test.question_count, 0);
  };

  return {
    testLibrary,
    loading,
    error,
    refetch: fetchTestLibrary,
    getTestsByCategory,
    getTestsBySubCategory,
    calculateTotalDuration,
    calculateTotalQuestions,
  };
};