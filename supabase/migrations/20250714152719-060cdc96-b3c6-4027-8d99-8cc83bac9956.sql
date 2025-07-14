-- Phase 1: Database Schema Enhancements

-- Add submission tracking fields to candidates table
ALTER TABLE public.candidates 
ADD COLUMN IF NOT EXISTS submission_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_submitted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS locked_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS lock_reason text,
ADD COLUMN IF NOT EXISTS can_resubmit boolean DEFAULT false;

-- Create test submission logs table
CREATE TABLE IF NOT EXISTS public.test_submission_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  submission_attempt integer NOT NULL,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  webhook_status text,
  webhook_response jsonb,
  submission_metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on test_submission_logs
ALTER TABLE public.test_submission_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for test_submission_logs
CREATE POLICY "Admins can view all submission logs" ON public.test_submission_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE p.id = auth.uid() AND r.name = 'admin'
  )
);

CREATE POLICY "Candidates can view own submission logs" ON public.test_submission_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM candidates c 
    WHERE c.id = test_submission_logs.candidate_id AND c.user_id = auth.uid()
  )
);

CREATE POLICY "System can insert submission logs" ON public.test_submission_logs
FOR INSERT WITH CHECK (true);

-- Create function to check submission eligibility
CREATE OR REPLACE FUNCTION public.check_submission_eligibility(candidate_uuid uuid)
RETURNS TABLE(
  can_submit boolean,
  reason text,
  current_status text,
  submission_count integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN c.test_status = 'submitted' AND NOT COALESCE(c.can_resubmit, false) THEN false
      WHEN c.test_status = 'submitted' AND c.submission_count >= 3 THEN false
      ELSE true
    END as can_submit,
    CASE 
      WHEN c.test_status = 'submitted' AND NOT COALESCE(c.can_resubmit, false) THEN 'Assessment already submitted and locked'
      WHEN c.test_status = 'submitted' AND c.submission_count >= 3 THEN 'Maximum submission attempts reached'
      ELSE 'Eligible for submission'
    END as reason,
    c.test_status::text as current_status,
    COALESCE(c.submission_count, 0) as submission_count
  FROM candidates c
  WHERE c.id = candidate_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to safely submit assessment
CREATE OR REPLACE FUNCTION public.submit_assessment(
  candidate_uuid uuid,
  submission_metadata jsonb DEFAULT '{}'
)
RETURNS TABLE(
  success boolean,
  message text,
  submission_id uuid
) AS $$
DECLARE
  eligibility_check record;
  new_submission_count integer;
  log_id uuid;
BEGIN
  -- Check eligibility
  SELECT * INTO eligibility_check 
  FROM public.check_submission_eligibility(candidate_uuid);
  
  IF NOT eligibility_check.can_submit THEN
    RETURN QUERY SELECT false, eligibility_check.reason, null::uuid;
    RETURN;
  END IF;
  
  -- Calculate new submission count
  new_submission_count := COALESCE(eligibility_check.submission_count, 0) + 1;
  
  -- Update candidate status atomically
  UPDATE public.candidates 
  SET 
    test_status = 'submitted'::test_status,
    submission_count = new_submission_count,
    last_submitted_at = now(),
    can_resubmit = false,
    updated_at = now()
  WHERE id = candidate_uuid;
  
  -- Log the submission
  INSERT INTO public.test_submission_logs (
    candidate_id, 
    submission_attempt, 
    submission_metadata
  ) VALUES (
    candidate_uuid, 
    new_submission_count, 
    submission_metadata
  ) RETURNING id INTO log_id;
  
  RETURN QUERY SELECT true, 'Assessment submitted successfully', log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for admin to reset candidate assessment
CREATE OR REPLACE FUNCTION public.reset_candidate_assessment(
  candidate_uuid uuid,
  admin_user_id uuid,
  reset_reason text DEFAULT 'Admin reset'
)
RETURNS TABLE(
  success boolean,
  message text
) AS $$
DECLARE
  is_admin_user boolean;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE p.id = admin_user_id AND r.name = 'admin'
  ) INTO is_admin_user;
  
  IF NOT is_admin_user THEN
    RETURN QUERY SELECT false, 'Only admins can reset assessments';
    RETURN;
  END IF;
  
  -- Reset candidate status
  UPDATE public.candidates 
  SET 
    test_status = 'in_progress'::test_status,
    can_resubmit = true,
    locked_by = admin_user_id,
    lock_reason = reset_reason,
    updated_at = now()
  WHERE id = candidate_uuid;
  
  -- Log the reset action
  INSERT INTO public.test_submission_logs (
    candidate_id, 
    submission_attempt, 
    submission_metadata,
    webhook_status
  ) VALUES (
    candidate_uuid, 
    0, 
    jsonb_build_object('action', 'admin_reset', 'reason', reset_reason, 'reset_by', admin_user_id),
    'admin_reset'
  );
  
  RETURN QUERY SELECT true, 'Assessment reset successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_test_submission_logs_candidate_id ON public.test_submission_logs(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidates_submission_tracking ON public.candidates(test_status, submission_count, last_submitted_at);