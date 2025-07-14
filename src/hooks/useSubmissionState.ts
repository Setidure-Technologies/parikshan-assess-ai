import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubmissionState {
  canSubmit: boolean;
  reason: string;
  currentStatus: string;
  submissionCount: number;
  lastSubmittedAt?: string;
  isLocked: boolean;
}

interface SubmissionResult {
  success: boolean;
  message: string;
  submissionId?: string;
  webhookSent?: boolean;
}

export const useSubmissionState = (candidateId: string | null) => {
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    canSubmit: false,
    reason: 'Loading...',
    currentStatus: 'pending',
    submissionCount: 0,
    isLocked: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const checkSubmissionEligibility = async () => {
    if (!candidateId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('check_submission_eligibility', { candidate_uuid: candidateId });

      if (error) throw error;

      if (data && data.length > 0) {
        const result = data[0];
        
        // Get additional candidate details
        const { data: candidateData } = await supabase
          .from('candidates')
          .select('last_submitted_at, locked_by, lock_reason')
          .eq('id', candidateId)
          .single();

        setSubmissionState({
          canSubmit: result.can_submit,
          reason: result.reason,
          currentStatus: result.current_status,
          submissionCount: result.submission_count,
          lastSubmittedAt: candidateData?.last_submitted_at,
          isLocked: result.current_status === 'submitted' && !result.can_submit
        });
      }
    } catch (error: any) {
      console.error('Error checking submission eligibility:', error);
      toast({
        title: "Error",
        description: "Failed to check submission status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitAssessment = async (submissionData: any): Promise<SubmissionResult> => {
    if (!candidateId) {
      return { success: false, message: 'No candidate ID provided' };
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/submit-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidate_id: candidateId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          submission_data: submissionData
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Submission failed');
      }

      // Refresh submission state
      await checkSubmissionEligibility();

      toast({
        title: "Assessment Submitted!",
        description: result.message,
      });

      return {
        success: true,
        message: result.message,
        submissionId: result.submission_id,
        webhookSent: result.webhook_sent
      };

    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });

      return {
        success: false,
        message: error.message
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set up real-time listener for submission state changes
  useEffect(() => {
    if (!candidateId) return;

    const channel = supabase
      .channel('candidate-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'candidates',
          filter: `id=eq.${candidateId}`
        },
        () => {
          // Refresh submission state when candidate record changes
          checkSubmissionEligibility();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [candidateId]);

  // Initial load
  useEffect(() => {
    checkSubmissionEligibility();
  }, [candidateId]);

  return {
    submissionState,
    isLoading,
    isSubmitting,
    submitAssessment,
    refreshState: checkSubmissionEligibility
  };
};