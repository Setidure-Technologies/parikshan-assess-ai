
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText } from "lucide-react";

interface CandidateData {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  test_status: string;
  company_id: string;
}

interface StatsCardsProps {
  candidatesData: CandidateData[];
}

const StatsCards = ({ candidatesData }: StatsCardsProps) => {
  const completedTests = candidatesData.filter(c => c.test_status === "completed").length;
  const completionRate = candidatesData.length > 0 
    ? Math.round((completedTests / candidatesData.length) * 100)
    : 0;

  return (
    <>
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
          <div className="text-2xl font-bold">{completedTests}</div>
          <p className="text-xs text-muted-foreground">
            {completionRate}% completion rate
          </p>
        </CardContent>
      </Card>
    </>
  );
};

export default StatsCards;
