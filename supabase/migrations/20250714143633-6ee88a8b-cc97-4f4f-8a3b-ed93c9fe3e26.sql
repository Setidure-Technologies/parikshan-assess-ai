-- Add new fields to question_templates table for categorized test library
ALTER TABLE public.question_templates 
ADD COLUMN test_category TEXT,
ADD COLUMN test_name TEXT,
ADD COLUMN is_template BOOLEAN DEFAULT false;

-- Create test_library table for managing pre-built test configurations
CREATE TABLE public.test_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'psychometric' or 'english'
  sub_category TEXT NOT NULL, -- specific type like 'leadership', 'grammar', etc.
  description TEXT,
  duration_minutes INTEGER DEFAULT 30,
  question_count INTEGER DEFAULT 10,
  difficulty_level difficulty_level DEFAULT 'moderate',
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on test_library
ALTER TABLE public.test_library ENABLE ROW LEVEL SECURITY;

-- Create policies for test_library
CREATE POLICY "Everyone can view active test library" 
ON public.test_library 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage test library" 
ON public.test_library 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE p.id = auth.uid() AND r.name = 'admin'
  )
);

-- Add test_configuration field to candidates table to store selected test types
ALTER TABLE public.candidates 
ADD COLUMN test_configuration JSONB DEFAULT '{}';

-- Insert sample pre-built tests
INSERT INTO public.test_library (name, category, sub_category, description, duration_minutes, question_count) VALUES
-- Psychometric Tests
('Leadership Assessment', 'psychometric', 'leadership', 'Evaluates leadership potential and management capabilities', 25, 15),
('Big 5 Personality Test', 'psychometric', 'personality', 'Comprehensive personality assessment based on the Big 5 model', 30, 20),
('Cognitive Ability Test', 'psychometric', 'cognitive', 'Measures problem-solving and analytical thinking skills', 35, 25),
('Emotional Intelligence Assessment', 'psychometric', 'emotional_intelligence', 'Evaluates emotional awareness and interpersonal skills', 20, 15),
('Team Collaboration Assessment', 'psychometric', 'teamwork', 'Assesses ability to work effectively in team environments', 15, 12),
('Decision Making Assessment', 'psychometric', 'decision_making', 'Evaluates decision-making processes and critical thinking', 25, 18),
('Stress Management Assessment', 'psychometric', 'stress_management', 'Measures ability to handle pressure and stressful situations', 20, 15),
('Communication Style Assessment', 'psychometric', 'communication', 'Evaluates communication preferences and effectiveness', 15, 12),
('Problem Solving Assessment', 'psychometric', 'problem_solving', 'Tests analytical and creative problem-solving abilities', 30, 20),
('Adaptability Assessment', 'psychometric', 'adaptability', 'Measures flexibility and ability to adapt to change', 20, 15),

-- English Communication Tests
('Grammar Fundamentals', 'english', 'grammar', 'Tests basic to advanced grammar knowledge', 20, 15),
('Vocabulary Assessment', 'english', 'vocabulary', 'Evaluates vocabulary range and usage', 15, 20),
('Reading Comprehension', 'english', 'reading', 'Tests reading understanding and interpretation skills', 25, 12),
('Business Writing Skills', 'english', 'writing', 'Assesses professional writing capabilities', 30, 10),
('Verbal Communication', 'english', 'verbal', 'Evaluates spoken communication effectiveness', 20, 15),
('Email Communication', 'english', 'email', 'Tests professional email writing skills', 15, 12),
('Presentation Skills', 'english', 'presentation', 'Assesses ability to structure and deliver presentations', 25, 10),
('Technical Writing', 'english', 'technical', 'Evaluates ability to write clear technical documentation', 30, 12),
('Listening Comprehension', 'english', 'listening', 'Tests ability to understand spoken English', 20, 15),
('Pronunciation Assessment', 'english', 'pronunciation', 'Evaluates clarity and accuracy of spoken English', 15, 10);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_test_library_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_test_library_updated_at
  BEFORE UPDATE ON public.test_library
  FOR EACH ROW
  EXECUTE FUNCTION update_test_library_updated_at();