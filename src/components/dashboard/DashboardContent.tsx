
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

const DashboardContent = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { company, loading: companyLoading } = useCompany(profile);
  const { candidates, loading: candidatesLoading } = useCandidates(profile);

  const loading = profileLoading || companyLoading || candidatesLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
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
