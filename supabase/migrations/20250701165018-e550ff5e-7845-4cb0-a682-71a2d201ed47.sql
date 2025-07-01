
-- Drop the existing broken function and trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the updated handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role_id UUID;
    user_role TEXT;
    company_data JSONB DEFAULT '{}';
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
    
    -- If we still don't have a role_id, something is wrong
    IF default_role_id IS NULL THEN
        RAISE EXCEPTION 'No default candidate role found in roles table';
    END IF;
    
    -- Prepare company data for profile_data JSONB field
    IF NEW.raw_user_meta_data->>'company_name' IS NOT NULL THEN
        company_data := jsonb_build_object(
            'company_name', NEW.raw_user_meta_data->>'company_name',
            'company_industry', NEW.raw_user_meta_data->>'company_industry'
        );
    END IF;
    
    -- Insert into profiles with proper schema
    INSERT INTO public.profiles (id, email, full_name, role_id, company_id, profile_data)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        default_role_id,
        NULL, -- company_id will be set later when admin assigns to company
        company_data
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
