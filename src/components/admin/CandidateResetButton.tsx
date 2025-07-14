import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface CandidateResetButtonProps {
  candidateId: string;
  candidateName: string;
  currentStatus: string;
  onResetComplete?: () => void;
}

export const CandidateResetButton = ({ 
  candidateId, 
  candidateName, 
  currentStatus, 
  onResetComplete 
}: CandidateResetButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetReason, setResetReason] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const handleReset = async () => {
    if (!user || !resetReason.trim()) return;

    setIsResetting(true);
    try {
      const response = await fetch('/api/reset-candidate-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidate_id: candidateId,
          admin_user_id: user.id,
          reset_reason: resetReason.trim()
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Reset failed');
      }

      toast({
        title: "Assessment Reset Successfully",
        description: `${candidateName}'s assessment has been reset for re-evaluation.`,
      });

      setIsOpen(false);
      setResetReason('');
      onResetComplete?.();

    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  if (currentStatus !== 'submitted') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Assessment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Assessment for {candidateName}</DialogTitle>
          <DialogDescription>
            This will allow the candidate to retake their assessment. Use this feature carefully.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This will unlock the assessment and allow the candidate to submit again. 
              Any existing evaluation data will remain but the candidate can create a new submission.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="reset-reason">Reason for Reset *</Label>
            <Input
              id="reset-reason"
              placeholder="e.g., Technical issues, Request for re-evaluation..."
              value={resetReason}
              onChange={(e) => setResetReason(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReset}
              disabled={isResetting || !resetReason.trim()}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {isResetting ? 'Resetting...' : 'Confirm Reset'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};