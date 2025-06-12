
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building } from "lucide-react";

interface CompanyData {
  id: string;
  name: string;
  industry: string;
  email: string;
}

interface CompanyDetailsCardProps {
  companyData: CompanyData | null;
}

const CompanyDetailsCard = ({ companyData }: CompanyDetailsCardProps) => {
  return (
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
  );
};

export default CompanyDetailsCard;
