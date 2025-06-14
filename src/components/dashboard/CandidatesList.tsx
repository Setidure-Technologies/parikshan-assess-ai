
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Users, Trash2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  selectedCandidates: string[];
  setSelectedCandidates: React.Dispatch<React.SetStateAction<string[]>>;
}

const CandidatesList = ({ candidatesData, selectedCandidates, setSelectedCandidates }: CandidatesListProps) => {
  const { toast } = useToast();
  const [candidateToDelete, setCandidateToDelete] = useState<CandidateData | null>(null);

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

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedCandidates(candidatesData.map((c) => c.id));
    } else {
      setSelectedCandidates([]);
    }
  };

  const handleSelectSingle = (checked: boolean, candidateId: string) => {
    if (checked) {
      setSelectedCandidates((prev) => [...prev, candidateId]);
    } else {
      setSelectedCandidates((prev) => prev.filter((id) => id !== candidateId));
    }
  };

  const handleDelete = async (candidateId: string) => {
    const { error } = await supabase.from('candidates').delete().eq('id', candidateId);
    if (error) {
      toast({ title: "Error deleting candidate", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Candidate deleted", description: "The candidate has been successfully deleted." });
      setSelectedCandidates(prev => prev.filter(id => id !== candidateId));
    }
    setCandidateToDelete(null);
  };

  const handleBulkDelete = async () => {
    const { error } = await supabase.from('candidates').delete().in('id', selectedCandidates);
    if (error) {
      toast({ title: "Error deleting candidates", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Candidates deleted", description: `${selectedCandidates.length} candidates have been deleted.` });
      setSelectedCandidates([]);
    }
  };

  const handleExport = () => {
    const selectedData = candidatesData.filter(c => selectedCandidates.includes(c.id));
    const csvContent = [
      ["Full Name", "Email", "Phone", "Status"].join(","),
      ...selectedData.map(c => [
        `"${c.full_name.replace(/"/g, '""')}"`,
        `"${c.email.replace(/"/g, '""')}"`,
        `"${(c.phone || '').replace(/"/g, '""')}"`,
        c.test_status
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "candidates_export.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Candidates ({candidatesData.length})
          </CardTitle>
          {selectedCandidates.length > 0 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export ({selectedCandidates.length})
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete ({selectedCandidates.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      This will permanently delete {selectedCandidates.length} selected candidate(s) and all their associated data. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <DialogClose asChild><Button variant="destructive" onClick={handleBulkDelete}>Delete</Button></DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {candidatesData.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No candidates found. Upload a CSV file to add candidates.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={candidatesData.length > 0 && selectedCandidates.length === candidatesData.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Candidate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidatesData.map((candidate) => (
                <TableRow key={candidate.id} data-state={selectedCandidates.includes(candidate.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selectedCandidates.includes(candidate.id)}
                      onCheckedChange={(checked) => handleSelectSingle(checked as boolean, candidate.id)}
                      aria-label="Select row"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{candidate.full_name}</div>
                    <p className="text-sm text-gray-600">{candidate.email}</p>
                    {candidate.phone && <p className="text-sm text-gray-500">{candidate.phone}</p>}
                  </TableCell>
                  <TableCell>{getStatusBadge(candidate.test_status)}</TableCell>
                  <TableCell className="text-right">
                    <Dialog onOpenChange={(open) => !open && setCandidateToDelete(null)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setCandidateToDelete(candidate)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      {candidateToDelete?.id === candidate.id && (
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete {candidateToDelete.full_name}?</DialogTitle>
                            <DialogDescription>
                              This will permanently delete the candidate and all associated data. This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <DialogClose asChild>
                              <Button variant="destructive" onClick={() => handleDelete(candidateToDelete.id)}>Delete</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      )}
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default CandidatesList;
