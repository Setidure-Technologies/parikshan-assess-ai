
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Brain, Users, Building, FileText, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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

const AdminDashboard = () => {
  const { signOut, user } = useAuth();
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

  const handleLogout = async () => {
    await signOut();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">{status}</Badge>;
      case "questions_generated":
        return <Badge variant="default" className="bg-blue-600">Questions Generated</Badge>;
      case "in_progress":
        return <Badge variant="default" className="bg-yellow-600">In Progress</Badge>;
      case "completed":
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Parikshan AI</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, Administrator</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage candidates and monitor test progress</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Company Details */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Company Details</CardTitle>
              <Building className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {companyData ? (
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Company Name</p>
                    <p className="font-medium">{companyData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Industry</p>
                    <p className="font-medium">{companyData.industry}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{companyData.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No company data available</p>
              )}
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
              <Users className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{candidatesData.length}</div>
              <p className="text-xs text-muted-foreground">
                Registered candidates
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tests Completed</CardTitle>
              <FileText className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {candidatesData.filter(c => c.test_status === "completed").length}
              </div>
              <p className="text-xs text-muted-foreground">
                {candidatesData.length > 0 
                  ? Math.round((candidatesData.filter(c => c.test_status === "completed").length / candidatesData.length) * 100)
                  : 0}% completion rate
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* CSV Upload Form */}
          <CsvUploadForm />

          {/* Candidate List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Candidates</CardTitle>
              <CardDescription>
                Overview of candidate status and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {candidatesData.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {candidatesData.slice(0, 6).map((candidate) => (
                        <TableRow key={candidate.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{candidate.full_name}</p>
                              <p className="text-sm text-gray-500">{candidate.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(candidate.test_status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates yet</h3>
                    <p className="text-gray-500">Upload a CSV file to add candidates</p>
                  </div>
                )}
                
                {candidatesData.length > 6 && (
                  <Button variant="outline" className="w-full">
                    View All {candidatesData.length} Candidates
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
