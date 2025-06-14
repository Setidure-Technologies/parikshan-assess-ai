
-- First, let's add the missing unique constraints and fix the foreign key issues

-- Add unique constraint for sections name if it doesn't exist
ALTER TABLE public.sections ADD CONSTRAINT sections_name_unique UNIQUE (name);

-- Add unique constraint for question templates
ALTER TABLE public.question_templates 
ADD CONSTRAINT question_templates_section_question_unique 
UNIQUE (section_id, question_number);

-- Add proper foreign key constraints that were missing
ALTER TABLE public.candidates 
DROP CONSTRAINT IF EXISTS candidates_company_id_fkey;

ALTER TABLE public.candidates 
ADD CONSTRAINT candidates_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

-- Add proper foreign key constraints for questions
ALTER TABLE public.questions
DROP CONSTRAINT IF EXISTS questions_candidate_id_fkey,
DROP CONSTRAINT IF EXISTS questions_section_id_fkey,
DROP CONSTRAINT IF EXISTS questions_template_id_fkey,
DROP CONSTRAINT IF EXISTS questions_company_id_fkey;

ALTER TABLE public.questions
ADD CONSTRAINT questions_candidate_id_fkey 
FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE,
ADD CONSTRAINT questions_section_id_fkey 
FOREIGN KEY (section_id) REFERENCES public.sections(id) ON DELETE CASCADE,
ADD CONSTRAINT questions_template_id_fkey 
FOREIGN KEY (template_id) REFERENCES public.question_templates(id) ON DELETE SET NULL,
ADD CONSTRAINT questions_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

-- Add proper foreign key constraints for other tables
ALTER TABLE public.question_templates
DROP CONSTRAINT IF EXISTS question_templates_section_id_fkey;

ALTER TABLE public.question_templates
ADD CONSTRAINT question_templates_section_id_fkey 
FOREIGN KEY (section_id) REFERENCES public.sections(id) ON DELETE CASCADE;

ALTER TABLE public.answers
DROP CONSTRAINT IF EXISTS answers_candidate_id_fkey,
DROP CONSTRAINT IF EXISTS answers_question_id_fkey,
DROP CONSTRAINT IF EXISTS answers_section_id_fkey;

ALTER TABLE public.answers
ADD CONSTRAINT answers_candidate_id_fkey 
FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE,
ADD CONSTRAINT answers_question_id_fkey 
FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE,
ADD CONSTRAINT answers_section_id_fkey 
FOREIGN KEY (section_id) REFERENCES public.sections(id) ON DELETE CASCADE;

ALTER TABLE public.test_sessions
DROP CONSTRAINT IF EXISTS test_sessions_candidate_id_fkey,
DROP CONSTRAINT IF EXISTS test_sessions_section_id_fkey;

ALTER TABLE public.test_sessions
ADD CONSTRAINT test_sessions_candidate_id_fkey 
FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE,
ADD CONSTRAINT test_sessions_section_id_fkey 
FOREIGN KEY (section_id) REFERENCES public.sections(id) ON DELETE CASCADE;

-- Insert sample sections if they don't exist
INSERT INTO public.sections (name, description, display_order, time_limit_minutes) VALUES
('Cognitive Assessment', 'Tests logical reasoning and problem-solving abilities', 1, 30),
('Personality Assessment', 'Evaluates personality traits and behavioral tendencies', 2, 25),
('Technical Skills', 'Assesses job-specific technical knowledge', 3, 45),
('Situational Judgment', 'Tests decision-making in workplace scenarios', 4, 20)
ON CONFLICT (name) DO NOTHING;

-- Insert sample question templates
INSERT INTO public.question_templates (
  section_id, question_number, scale_dimension, question_type, question_text,
  time_to_answer_seconds, options, metadata
) VALUES
-- Cognitive Assessment MCQ questions
(
  (SELECT id FROM sections WHERE name = 'Cognitive Assessment'),
  1, 'logical_reasoning', 'mcq',
  'If all roses are flowers and some flowers are red, which statement is definitely true?',
  120, '["All roses are red", "Some roses are red", "Some roses might be red", "No roses are red"]',
  '{"correct_answer": 2, "difficulty": "medium"}'
),
(
  (SELECT id FROM sections WHERE name = 'Cognitive Assessment'),
  2, 'numerical_ability', 'mcq',
  'What is 15% of 200?',
  60, '["25", "30", "35", "40"]',
  '{"correct_answer": 1, "difficulty": "easy"}'
),
-- Personality Assessment Likert Scale questions
(
  (SELECT id FROM sections WHERE name = 'Personality Assessment'),
  1, 'leadership', 'likert_scale',
  'I enjoy taking charge of projects and leading teams',
  30, '["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]',
  '{"trait": "leadership", "reverse_scored": false}'
),
(
  (SELECT id FROM sections WHERE name = 'Personality Assessment'),
  2, 'teamwork', 'likert_scale',
  'I prefer working alone rather than in groups',
  30, '["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]',
  '{"trait": "teamwork", "reverse_scored": true}'
),
-- Technical Skills MCQ questions
(
  (SELECT id FROM sections WHERE name = 'Technical Skills'),
  1, 'programming', 'mcq',
  'Which of the following is NOT a programming language?',
  90, '["Python", "JavaScript", "HTML", "Java"]',
  '{"correct_answer": 2, "difficulty": "easy", "domain": "programming"}'
),
-- Situational Judgment questions
(
  (SELECT id FROM sections WHERE name = 'Situational Judgment'),
  1, 'problem_solving', 'mcq',
  'A team member consistently misses deadlines. What is your best approach?',
  180, '["Report to manager immediately", "Have a private conversation first", "Ignore and work around it", "Criticize publicly in meetings"]',
  '{"correct_answer": 1, "difficulty": "medium", "scenario": "team_management"}'
)
ON CONFLICT (section_id, question_number) DO NOTHING;

-- Enable Row Level Security on candidates table
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Enable proper RLS policies for candidates (admins can see company candidates)
DROP POLICY IF EXISTS "Admins can view company candidates" ON public.candidates;
CREATE POLICY "Admins can view company candidates" ON public.candidates
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() 
            AND r.name = 'admin'
            AND p.company_id = candidates.company_id
        )
    );

-- Allow candidates to view their own record
DROP POLICY IF EXISTS "Candidates can view own record" ON public.candidates;
CREATE POLICY "Candidates can view own record" ON public.candidates
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Allow admins to insert candidates for their company
DROP POLICY IF EXISTS "Admins can insert company candidates" ON public.candidates;
CREATE POLICY "Admins can insert company candidates" ON public.candidates
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() 
            AND r.name = 'admin'
            AND p.company_id = candidates.company_id
        )
    );

-- Allow admins to update candidates for their company
DROP POLICY IF EXISTS "Admins can update company candidates" ON public.candidates;
CREATE POLICY "Admins can update company candidates" ON public.candidates
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() 
            AND r.name = 'admin'
            AND p.company_id = candidates.company_id
        )
    );
