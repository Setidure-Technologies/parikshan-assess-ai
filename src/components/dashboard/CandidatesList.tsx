
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, FileText, Download, Eye, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  test_status: string;
  created_at: string;
  user_id: string | null;
}

interface Evaluation {
  id: string;
  candidate_id: string;
  total_score: number | null;
  section_scores: any;
  evaluation_data: any;
  pdf_report_url: string | null;
  evaluation_status: string;
  created_at: string;
}

interface CandidatesListProps {
  candidatesData: Candidate[];
  selectedCandidates: string[];
  setSelectedCandidates: (candidates: string[]) => void;
}

const CandidatesList = ({ candidatesData, selectedCandidates, setSelectedCandidates }: CandidatesListProps) => {
  const { toast } = useToast();
  const [evaluations, setEvaluations] = useState<{ [key: string]: Evaluation }>({});
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null);

  // Load evaluations for all candidates
  useEffect(() => {
    const loadEvaluations = async () => {
      if (candidatesData.length === 0) return;

      const candidateIds = candidatesData.map(c => c.id);
      const { data, error } = await supabase
        .from('evaluations')
        .select('*')
        .in('candidate_id', candidateIds);

      if (error) {
        console.error('Error loading evaluations:', error);
        return;
      }

      const evaluationsMap: { [key: string]: Evaluation } = {};
      data?.forEach(evaluation => {
        evaluationsMap[evaluation.candidate_id] = evaluation;
      });
      setEvaluations(evaluationsMap);
    };

    loadEvaluations();
  }, [candidatesData]);

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidates(
      selectedCandidates.includes(candidateId)
        ? selectedCandidates.filter(id => id !== candidateId)
        : [...selectedCandidates, candidateId]
    );
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    try {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', candidateId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Candidate deleted successfully",
      });

      // Refresh the page or update the local state
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setCandidateToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'outline' as const, label: 'Pending' },
      questions_generated: { variant: 'secondary' as const, label: 'Ready' },
      in_progress: { variant: 'default' as const, label: 'In Progress' },
      completed: { variant: 'default' as const, label: 'Completed' },
      submitted: { variant: 'default' as const, label: 'Submitted' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const viewEvaluation = (candidateId: string) => {
    const evaluation = evaluations[candidateId];
    if (evaluation) {
      setSelectedEvaluation(evaluation);
    }
  };

  const downloadReport = (pdfUrl: string) => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Candidates Management
        </CardTitle>
        <CardDescription>
          Manage your candidates and view their assessment results
        </CardDescription>
      </CardHeader>
      <CardContent>
        {candidatesData.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Candidates Yet</h3>
            <p className="text-gray-500">Upload a CSV file to add candidates to your assessment pipeline.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidatesData.map((candidate) => {
                    const evaluation = evaluations[candidate.id];
                    return (
                      <TableRow key={candidate.id}>
                        <TableCell className="font-medium">{candidate.full_name}</TableCell>
                        <TableCell>{candidate.email}</TableCell>
                        <TableCell>{getStatusBadge(candidate.test_status)}</TableCell>
                        <TableCell>
                          {evaluation?.total_score ? (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{evaluation.total_score}/100</span>
                              <BarChart3 className="h-4 w-4 text-cyan-600" />
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {evaluation && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => viewEvaluation(candidate.id)}
                                  className="flex items-center gap-1"
                                >
                                  <Eye className="h-4 w-4" />
                                  View Report
                                </Button>
                                {evaluation.pdf_report_url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadReport(evaluation.pdf_report_url!)}
                                    className="flex items-center gap-1"
                                  >
                                    <Download className="h-4 w-4" />
                                    PDF
                                  </Button>
                                )}
                              </>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCandidateToDelete(candidate.id);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-red-600 hover:text-red-700 flex items-center gap-1"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Evaluation Details Dialog */}
        <Dialog open={!!selectedEvaluation} onOpenChange={() => setSelectedEvaluation(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assessment Report</DialogTitle>
              <DialogDescription>
                Detailed evaluation results for the candidate
              </DialogDescription>
            </DialogHeader>
            {selectedEvaluation && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-cyan-50 rounded-lg">
                    <div className="text-3xl font-bold text-cyan-600">
                      {selectedEvaluation.total_score || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-lg font-semibold text-green-600">
                      {selectedEvaluation.evaluation_status}
                    </div>
                    <div className="text-sm text-gray-600">Status</div>
                  </div>
                </div>

                {selectedEvaluation.section_scores && Object.keys(selectedEvaluation.section_scores).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Section-wise Scores</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedEvaluation.section_scores).map(([section, score]) => (
                        <div key={section} className="flex justify-between items-center p-2 border rounded">
                          <span className="capitalize">{section.replace('_', ' ')}</span>
                          <span className="font-medium">{score as number}/100</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEvaluation.evaluation_data && (
                  <div>
                    <h4 className="font-semibold mb-3">Additional Insights</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(selectedEvaluation.evaluation_data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedEvaluation.pdf_report_url && (
                  <div className="text-center">
                    <Button 
                      onClick={() => downloadReport(selectedEvaluation.pdf_report_url!)}
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Full Report (PDF)
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this candidate? This action cannot be undone and will remove all associated test data.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-4 mt-6">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={() => candidateToDelete && handleDeleteCandidate(candidateToDelete)}
              >
                Delete Candidate
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CandidatesList;
