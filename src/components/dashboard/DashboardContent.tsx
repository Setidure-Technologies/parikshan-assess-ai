
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useCompany } from "@/hooks/useCompany";
import { useCandidates } from "@/hooks/useCandidates";
import CompanyDetailsCard from "./CompanyDetailsCard";
import StatsCards from "./StatsCards";
import CandidatesList from "./CandidatesList";
import CsvUploadForm from "@/components/CsvUploadForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Zap, Users, CheckCircle } from "lucide-react";

const DashboardContent = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { company, loading: companyLoading } = useCompany(profile);
  const { candidates, loading: candidatesLoading, refetch } = useCandidates(profile);

  const loading = profileLoading || companyLoading || candidatesLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const automationSteps = [
    {
      icon: <Users className="h-5 w-5" />,
      title: "CSV Upload",
      description: "Upload candidate data via CSV file",
      status: candidates.length > 0 ? "completed" : "pending"
    },
    {
      icon: <Bot className="h-5 w-5" />,
      title: "Question Generation",
      description: "AI creates personalized questions for each candidate",
      status: candidates.some(c => c.test_status === 'questions_generated') ? "completed" : "pending"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Credential Creation",
      description: "Authentication accounts created automatically",
      status: candidates.some(c => c.user_id) ? "completed" : "pending"
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      title: "Test Deployment",
      description: "Candidates can access their personalized tests",
      status: candidates.some(c => c.test_status === 'in_progress') ? "completed" : "pending"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Automated candidate management and assessment generation</p>
      </div>

      {/* Automation Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Automation Pipeline Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {automationSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className={`p-2 rounded-full ${
                  step.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step.icon}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{step.title}</h4>
                  <p className="text-xs text-gray-500">{step.description}</p>
                  <span className={`text-xs font-medium ${
                    step.status === 'completed' ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.status === 'completed' ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <CompanyDetailsCard companyData={company} />
        <StatsCards candidatesData={candidates} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <CsvUploadForm />
        <CandidatesList candidatesData={candidates} />
      </div>
    </div>
  );
};

export default DashboardContent;
