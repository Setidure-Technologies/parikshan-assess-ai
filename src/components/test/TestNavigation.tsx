
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TestNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  isSubmitting: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export const TestNavigation = ({ 
  currentQuestion, 
  totalQuestions, 
  isSubmitting, 
  onPrevious, 
  onNext, 
  onSubmit 
}: TestNavigationProps) => {
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentQuestion === 0}
        className="border-cyan-200 hover:bg-cyan-50"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>

      <div className="flex space-x-3">
        {currentQuestion === totalQuestions - 1 ? (
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? "Submitting..." : "Submit Section"}
          </Button>
        ) : (
          <Button onClick={onNext} className="bg-cyan-600 hover:bg-cyan-700">
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};
