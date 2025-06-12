
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import CompanyDetailsCard from "./CompanyDetailsCard";
import StatsCards from "./StatsCards";
import CandidatesList from "./CandidatesList";
import CsvUploadForm from "@/components/CsvUploadForm";

interface CompanyData {
  id: string;
  name: string;
  industry: string;
  email: string;
}

interface CandidateData {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  test_status: string;
  company_id: string;
}

const DashboardContent = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [candidatesData, setCandidatesData] = useState<CandidateData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      // Fetch user's company information
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          company_id,
          companies!inner(
            id,
            name,
            industry,
            email
          )
        `)
        .eq('id', user?.id)
        .single();

      if (profile?.companies) {
        setCompanyData(profile.companies);
        
        // Fetch candidates for this company
        const { data: candidates } = await supabase
          .from('candidates')
          .select('*')
          .eq('company_id', profile.companies.id)
          .order('created_at', { ascending: false });

        setCandidatesData(candidates || []);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage candidates and monitor test progress</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <CompanyDetailsCard companyData={companyData} />
        <StatsCards candidatesData={candidatesData} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <CsvUploadForm />
        <CandidatesList candidatesData={candidatesData} />
      </div>
    </div>
  );
};

export default DashboardContent;
