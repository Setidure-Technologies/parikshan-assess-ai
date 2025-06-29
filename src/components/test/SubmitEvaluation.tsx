
import { useToast } from "@/hooks/use-toast";
import { ACTIVE_WEBHOOKS } from "@/config/webhooks";

interface SubmitEvaluationProps {
  candidateId: string;
  sectionId: string;
  answers: { [key: number]: any };
  questions: any[];
  onComplete: () => void;
}

export const SubmitEvaluation = ({
  candidateId,
  sectionId,
  answers,
  questions,
  onComplete
}: SubmitEvaluationProps) => {
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      const submissionData = {
        candidate_id: candidateId,
        section_id: sectionId,
        answers: answers,
        questions: questions,
        total_questions: questions.length,
        answered_questions: Object.keys(answers).length,
        submission_timestamp: new Date().toISOString(),
      };

      console.log('Submitting test evaluation:', submissionData);

      const response = await fetch(ACTIVE_WEBHOOKS.TEST_EVALUATION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Candidate-ID': candidateId,
          'X-Section-ID': sectionId,
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error(`Evaluation submission failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Evaluation response:', result);

      toast({
        title: "Section Submitted Successfully",
        description: "Your test section has been submitted for evaluation.",
      });

      onComplete();
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      toast({
        title: "Submission Error",
        description: "Failed to submit test section. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { handleSubmit };
};
