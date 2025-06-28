
-- Add attempt column to test_sessions
ALTER TABLE public.test_sessions 
ADD COLUMN IF NOT EXISTS attempt INTEGER DEFAULT 1;

-- Add MCQ to question_type enum if not exists
DO $$ BEGIN
  -- First check if the enum exists and what values it has
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type') THEN
    -- Add MCQ if it doesn't exist
    BEGIN
      ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'mcq';
    EXCEPTION WHEN duplicate_object THEN
      -- Value already exists, ignore
      NULL;
    END;
  ELSE
    -- Create the enum with all values including MCQ
    CREATE TYPE question_type AS ENUM ('mcq','forced_choice','sjt','likert_scale','true_false','open_ended');
  END IF;
END $$;

-- Ensure all foreign key constraints are properly set up
ALTER TABLE public.candidates 
DROP CONSTRAINT IF EXISTS candidates_company_id_fkey;

ALTER TABLE public.candidates 
ADD CONSTRAINT candidates_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

-- Add user_id foreign key to candidates if not exists
ALTER TABLE public.candidates 
DROP CONSTRAINT IF EXISTS candidates_user_id_fkey;

ALTER TABLE public.candidates 
ADD CONSTRAINT candidates_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure profiles have proper constraints
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_company_id_fkey;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;

-- Add RLS policies for test_sessions
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;

-- Allow candidates to view their own test sessions
DROP POLICY IF EXISTS "Candidates can view own test sessions" ON public.test_sessions;
CREATE POLICY "Candidates can view own test sessions" ON public.test_sessions
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.candidates c
            WHERE c.id = test_sessions.candidate_id 
            AND c.user_id = auth.uid()
        )
    );

-- Allow candidates to insert their own test sessions
DROP POLICY IF EXISTS "Candidates can create own test sessions" ON public.test_sessions;
CREATE POLICY "Candidates can create own test sessions" ON public.test_sessions
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.candidates c
            WHERE c.id = test_sessions.candidate_id 
            AND c.user_id = auth.uid()
        )
    );

-- Allow candidates to update their own test sessions
DROP POLICY IF EXISTS "Candidates can update own test sessions" ON public.test_sessions;
CREATE POLICY "Candidates can update own test sessions" ON public.test_sessions
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.candidates c
            WHERE c.id = test_sessions.candidate_id 
            AND c.user_id = auth.uid()
        )
    );

-- Allow admins to view all test sessions for their company
DROP POLICY IF EXISTS "Admins can view company test sessions" ON public.test_sessions;
CREATE POLICY "Admins can view company test sessions" ON public.test_sessions
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            JOIN public.candidates c ON c.company_id = p.company_id
            WHERE p.id = auth.uid() 
            AND r.name = 'admin'
            AND c.id = test_sessions.candidate_id
        )
    );

-- Add RLS policies for answers table
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- Allow candidates to view their own answers
DROP POLICY IF EXISTS "Candidates can view own answers" ON public.answers;
CREATE POLICY "Candidates can view own answers" ON public.answers
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.candidates c
            WHERE c.id = answers.candidate_id 
            AND c.user_id = auth.uid()
        )
    );

-- Allow candidates to insert their own answers
DROP POLICY IF EXISTS "Candidates can create own answers" ON public.answers;
CREATE POLICY "Candidates can create own answers" ON public.answers
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.candidates c
            WHERE c.id = answers.candidate_id 
            AND c.user_id = auth.uid()
        )
    );

-- Allow candidates to update their own answers
DROP POLICY IF EXISTS "Candidates can update own answers" ON public.answers;
CREATE POLICY "Candidates can update own answers" ON public.answers
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.candidates c
            WHERE c.id = answers.candidate_id 
            AND c.user_id = auth.uid()
        )
    );

-- Allow admins to view all answers for their company candidates
DROP POLICY IF EXISTS "Admins can view company answers" ON public.answers;
CREATE POLICY "Admins can view company answers" ON public.answers
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            JOIN public.candidates c ON c.company_id = p.company_id
            WHERE p.id = auth.uid() 
            AND r.name = 'admin'
            AND c.id = answers.candidate_id
        )
    );

-- Add RLS policies for questions table
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Allow candidates to view their own questions
DROP POLICY IF EXISTS "Candidates can view own questions" ON public.questions;
CREATE POLICY "Candidates can view own questions" ON public.questions
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.candidates c
            WHERE c.id = questions.candidate_id 
            AND c.user_id = auth.uid()
        )
    );

-- Allow admins to view all questions for their company candidates
DROP POLICY IF EXISTS "Admins can view company questions" ON public.questions;
CREATE POLICY "Admins can view company questions" ON public.questions
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            JOIN public.candidates c ON c.company_id = p.company_id
            WHERE p.id = auth.uid() 
            AND r.name = 'admin'
            AND c.id = questions.candidate_id
        )
    );

-- Allow system to insert questions (for n8n)
DROP POLICY IF EXISTS "System can insert questions" ON public.questions;
CREATE POLICY "System can insert questions" ON public.questions
    FOR INSERT TO authenticated WITH CHECK (true);
