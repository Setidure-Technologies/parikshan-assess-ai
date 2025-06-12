
-- First, let's create a proper roles table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the predefined roles
INSERT INTO public.roles (name, description) VALUES
('admin', 'Administrator with full access'),
('candidate', 'Test candidate with limited access')
ON CONFLICT (name) DO NOTHING;

-- Now let's recreate the profiles table with proper role reference
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role_id UUID REFERENCES public.roles(id) NOT NULL,
    company_id UUID REFERENCES public.companies(id),
    phone TEXT,
    profile_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for roles (everyone can read roles for dropdown)
CREATE POLICY "Everyone can view roles" ON public.roles
    FOR SELECT TO authenticated USING (true);

-- Update the handle_new_user function to work with role_id
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role_id UUID;
    user_role TEXT;
BEGIN
    -- Get the role from metadata, default to 'candidate'
    user_role := COALESCE(NEW.raw_user_meta_data->>'user_role', 'candidate');
    
    -- Get the role_id for the specified role
    SELECT id INTO default_role_id 
    FROM public.roles 
    WHERE name = user_role;
    
    -- If role not found, use candidate as default
    IF default_role_id IS NULL THEN
        SELECT id INTO default_role_id 
        FROM public.roles 
        WHERE name = 'candidate';
    END IF;
    
    -- Insert into profiles with proper role_id
    INSERT INTO public.profiles (id, email, full_name, role_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        default_role_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add update trigger for profiles
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
