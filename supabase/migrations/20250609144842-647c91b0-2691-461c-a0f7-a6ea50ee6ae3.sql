
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for better data consistency
CREATE TYPE user_role AS ENUM ('admin', 'candidate');
CREATE TYPE question_type AS ENUM ('forced_choice', 'sjt', 'likert_scale', 'true_false', 'open_ended');
CREATE TYPE difficulty_level AS ENUM ('easy', 'moderate', 'hard');
CREATE TYPE test_status AS ENUM ('pending', 'questions_generated', 'in_progress', 'completed');

-- Companies table
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    industry TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table (linked to auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    user_role user_role NOT NULL DEFAULT 'candidate',
    company_id UUID REFERENCES public.companies(id),
    phone TEXT,
    profile_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidates table (extends profiles for candidate-specific data)
CREATE TABLE public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    test_status test_status DEFAULT 'pending',
    profile_data JSONB DEFAULT '{}',
    credentials_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test sections
CREATE TABLE public.sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER DEFAULT 1,
    time_limit_minutes INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question templates/bank
CREATE TABLE public.question_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES public.sections(id),
    question_number INTEGER NOT NULL,
    scale_dimension TEXT NOT NULL,
    question_type question_type NOT NULL,
    question_text TEXT NOT NULL,
    industry_context TEXT,
    relevance_tag TEXT,
    difficulty_level difficulty_level DEFAULT 'moderate',
    time_to_answer_seconds INTEGER DEFAULT 60,
    scoring_logic JSONB DEFAULT '{}',
    options JSONB DEFAULT '[]', -- For MCQ, Likert scale options
    correct_answer TEXT, -- For True/False, MCQ
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated questions for specific candidates
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES public.question_templates(id),
    section_id UUID REFERENCES public.sections(id) NOT NULL,
    candidate_id UUID REFERENCES public.candidates(id) NOT NULL,
    company_id UUID REFERENCES public.companies(id) NOT NULL,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL,
    options JSONB DEFAULT '[]',
    time_limit_seconds INTEGER DEFAULT 60,
    metadata JSONB DEFAULT '{}',
    created_by_flow BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidate answers
CREATE TABLE public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES public.candidates(id) NOT NULL,
    question_id UUID REFERENCES public.questions(id) NOT NULL,
    section_id UUID REFERENCES public.sections(id) NOT NULL,
    answer_data JSONB NOT NULL, -- Stores answer value, time taken, etc.
    time_taken_seconds INTEGER,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test sessions for tracking
CREATE TABLE public.test_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES public.candidates(id) NOT NULL,
    section_id UUID REFERENCES public.sections(id) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    total_time_seconds INTEGER,
    status TEXT DEFAULT 'in_progress'
);

-- Insert default sections
INSERT INTO public.sections (name, description, display_order, time_limit_minutes) VALUES
('Psychometric Assessment', 'Personality and behavioral assessment', 1, 30),
('Language Skills', 'Communication and language proficiency', 2, 25),
('Situational Judgment', 'Problem-solving and decision-making scenarios', 3, 20),
('Technical Assessment', 'Role-specific technical evaluation', 4, 45);

-- Insert sample question templates
INSERT INTO public.question_templates (
    section_id, question_number, scale_dimension, question_type, question_text, 
    industry_context, relevance_tag, difficulty_level, time_to_answer_seconds, 
    scoring_logic, options
) VALUES
(
    (SELECT id FROM public.sections WHERE name = 'Psychometric Assessment' LIMIT 1),
    1, 'Leadership', 'likert_scale', 
    'I prefer to take charge in group situations',
    'General', 'Leadership pipeline', 'easy', 30,
    '{"scale": "1-5", "reverse": false}',
    '["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]'
),
(
    (SELECT id FROM public.sections WHERE name = 'Situational Judgment' LIMIT 1),
    1, 'Problem Solving', 'sjt',
    'Your team is facing a tight deadline, but the quality of work is below standards. What would you do?',
    'IT', 'High-stress roles', 'moderate', 120,
    '{"scoring": "best_practice"}',
    '["Extend the deadline to maintain quality", "Submit current work and improve later", "Reallocate resources to critical tasks", "Escalate to management immediately"]'
);

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for companies (admins can see their company)
CREATE POLICY "Admins can view their company" ON public.companies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND user_role = 'admin' 
            AND company_id = public.companies.id
        )
    );

-- RLS Policies for candidates
CREATE POLICY "Admins can view company candidates" ON public.candidates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND user_role = 'admin' 
            AND company_id = public.candidates.company_id
        )
    );

CREATE POLICY "Candidates can view own record" ON public.candidates
    FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for sections (public read)
CREATE POLICY "Everyone can view sections" ON public.sections
    FOR SELECT TO authenticated USING (true);

-- RLS Policies for questions
CREATE POLICY "Candidates can view own questions" ON public.questions
    FOR SELECT USING (
        candidate_id = (
            SELECT id FROM public.candidates WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view company questions" ON public.questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND user_role = 'admin' 
            AND company_id = public.questions.company_id
        )
    );

-- RLS Policies for answers
CREATE POLICY "Candidates can manage own answers" ON public.answers
    FOR ALL USING (
        candidate_id = (
            SELECT id FROM public.candidates WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view company answers" ON public.answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.candidates c ON p.company_id = c.company_id
            WHERE p.id = auth.uid() 
            AND p.user_role = 'admin' 
            AND c.id = public.answers.candidate_id
        )
    );

-- RLS Policies for test sessions
CREATE POLICY "Candidates can manage own sessions" ON public.test_sessions
    FOR ALL USING (
        candidate_id = (
            SELECT id FROM public.candidates WHERE user_id = auth.uid()
        )
    );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, user_role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'user_role', 'candidate')::user_role
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON public.candidates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
