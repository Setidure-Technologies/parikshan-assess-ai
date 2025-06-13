
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface CandidateData {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  test_status: string;
  company_id: string;
  created_at: string;
}

interface CandidatesListProps {
  candidatesData: CandidateData[];
}

const CandidatesList = ({ candidatesData }: CandidatesListProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-amber-100 text-amber-800">In Progress</Badge>;
      case 'questions_generated':
        return <Badge className="bg-cyan-100 text-cyan-800">Ready</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Candidates ({candidatesData.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {candidatesData.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No candidates found. Upload a CSV file to add candidates.
          </p>
        ) : (
          <div className="space-y-3">
            {candidatesData.map((candidate) => (
              <div
                key={candidate.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{candidate.full_name}</h4>
                  <p className="text-sm text-gray-600">{candidate.email}</p>
                  {candidate.phone && (
                    <p className="text-sm text-gray-500">{candidate.phone}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(candidate.test_status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CandidatesList;
