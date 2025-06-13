
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles = [] }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (authLoading || profileLoading) return;

    console.log('ProtectedRoute check:', { user: !!user, profile, allowedRoles });

    if (!user) {
      console.log('No user, redirecting to login');
      navigate('/login');
      return;
    }

    if (!profile) {
      console.log('No profile found');
      setHasChecked(true);
      return;
    }

    // Check if admin needs company onboarding
    if (profile.roles?.name === 'admin' && !profile.company_id) {
      console.log('Admin needs company onboarding');
      navigate('/onboard-company');
      return;
    }

    // Check role permissions
    if (allowedRoles.length > 0 && profile.roles?.name) {
      if (!allowedRoles.includes(profile.roles.name)) {
        console.log('Role not allowed, redirecting based on role');
        // Redirect to appropriate dashboard based on role
        if (profile.roles.name === 'admin') {
          navigate('/admin-dashboard');
        } else if (profile.roles.name === 'candidate') {
          navigate('/candidate-dashboard');
        } else {
          navigate('/');
        }
        return;
      }
    }

    setHasChecked(true);
  }, [user, profile, authLoading, profileLoading, navigate, allowedRoles]);

  if (authLoading || profileLoading || !hasChecked) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
