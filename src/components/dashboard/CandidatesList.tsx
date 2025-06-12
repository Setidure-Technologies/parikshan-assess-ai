
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users } from "lucide-react";

interface CandidateData {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  test_status: string;
  company_id: string;
}

interface CandidatesListProps {
  candidatesData: CandidateData[];
}

const CandidatesList = ({ candidatesData }: CandidatesListProps) => {
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

  return (
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
  );
};

export default CandidatesList;
