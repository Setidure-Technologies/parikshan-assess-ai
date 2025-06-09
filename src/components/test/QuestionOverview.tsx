
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuestionOverviewProps {
  totalQuestions: number;
  currentQuestion: number;
  answers: { [key: number]: any };
  onQuestionSelect: (index: number) => void;
}

export const QuestionOverview = ({ 
  totalQuestions, 
  currentQuestion, 
  answers, 
  onQuestionSelect 
}: QuestionOverviewProps) => {
  return (
    <Card className="mt-8 border-cyan-200">
      <CardHeader>
        <CardTitle className="text-sm">Question Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-10 gap-2">
          {Array.from({ length: totalQuestions }, (_, index) => (
            <Button
              key={index}
              variant={currentQuestion === index ? "default" : answers[index] ? "secondary" : "outline"}
              size="sm"
              onClick={() => onQuestionSelect(index)}
              className={`h-8 w-8 p-0 ${
                currentQuestion === index 
                  ? 'bg-cyan-600 hover:bg-cyan-700' 
                  : answers[index] 
                    ? 'bg-cyan-100 text-cyan-800 border-cyan-200' 
                    : 'border-cyan-200 hover:bg-cyan-50'
              }`}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
