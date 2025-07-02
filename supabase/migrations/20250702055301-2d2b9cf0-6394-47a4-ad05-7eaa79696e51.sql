
-- Add new test status for submitted tests
ALTER TYPE test_status ADD VALUE 'submitted';

-- Create evaluations table to store test results and reports
CREATE TABLE public.evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  total_score DECIMAL(5,2),
  section_scores JSONB DEFAULT '{}'::jsonb,
  evaluation_data JSONB DEFAULT '{}'::jsonb,
  pdf_report_url TEXT,
  evaluation_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create contact requests table for managing sales inquiries
CREATE TABLE public.contact_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_size TEXT,
  industry TEXT,
  preferred_plan TEXT,
  additional_notes TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for evaluations table
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Candidates can view their own evaluations
CREATE POLICY "Candidates can view own evaluations" 
  ON public.evaluations 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM candidates c 
    WHERE c.id = evaluations.candidate_id 
    AND c.user_id = auth.uid()
  ));

-- Admins can view company evaluations
CREATE POLICY "Admins can view company evaluations" 
  ON public.evaluations 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    JOIN candidates c ON c.company_id = p.company_id 
    WHERE p.id = auth.uid() 
    AND r.name = 'admin' 
    AND c.id = evaluations.candidate_id
  ));

-- System can insert evaluations (for webhook)
CREATE POLICY "System can insert evaluations" 
  ON public.evaluations 
  FOR INSERT 
  WITH CHECK (true);

-- Add RLS policies for contact requests
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Admins can view all contact requests
CREATE POLICY "Admins can view contact requests" 
  ON public.contact_requests 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE p.id = auth.uid() 
    AND r.name = 'admin'
  ));

-- Anyone can insert contact requests (public form)
CREATE POLICY "Anyone can create contact requests" 
  ON public.contact_requests 
  FOR INSERT 
  WITH CHECK (true);
