
-- First, let's ensure we have the companies table properly set up
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    industry TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read companies (for dropdowns)
DROP POLICY IF EXISTS "Everyone can view companies" ON public.companies;
CREATE POLICY "Everyone can view companies" ON public.companies
    FOR SELECT TO authenticated USING (true);

-- Allow admins to insert companies
DROP POLICY IF EXISTS "Admins can insert companies" ON public.companies;
CREATE POLICY "Admins can insert companies" ON public.companies
    FOR INSERT TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name = 'admin'
        )
    );

-- Update candidates table to ensure proper structure
ALTER TABLE public.candidates 
    DROP CONSTRAINT IF EXISTS candidates_company_id_fkey;

ALTER TABLE public.candidates 
    ADD CONSTRAINT candidates_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES public.companies(id);

-- Enable RLS on candidates
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all candidates
DROP POLICY IF EXISTS "Admins can view all candidates" ON public.candidates;
CREATE POLICY "Admins can view all candidates" ON public.candidates
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name = 'admin'
        )
    );

-- Allow admins to insert candidates
DROP POLICY IF EXISTS "Admins can insert candidates" ON public.candidates;
CREATE POLICY "Admins can insert candidates" ON public.candidates
    FOR INSERT TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name = 'admin'
        )
    );

-- Update profiles table to ensure company_id is properly linked
ALTER TABLE public.profiles 
    DROP CONSTRAINT IF EXISTS profiles_company_id_fkey;

ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES public.companies(id);

-- Add update trigger for companies
DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at 
    BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add update trigger for candidates
DROP TRIGGER IF EXISTS update_candidates_updated_at ON public.candidates;
CREATE TRIGGER update_candidates_updated_at 
    BEFORE UPDATE ON public.candidates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
