
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface TestProgressProps {
  sectionName: string;
  currentQuestion: number;
  totalQuestions: number;
  questionType: string;
  answeredCount: number;
}

export const TestProgress = ({ 
  sectionName, 
  currentQuestion, 
  totalQuestions, 
  questionType, 
  answeredCount 
}: TestProgressProps) => {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{sectionName}</h1>
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Question {currentQuestion + 1} of {totalQuestions}
        </p>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="border-cyan-200">
            {questionType.replace('_', ' ').toUpperCase()}
          </Badge>
          <div className="text-sm text-gray-600">
            {answeredCount} of {totalQuestions} answered
          </div>
        </div>
      </div>
      <Progress value={progress} className="mt-4 h-2" />
    </div>
  );
};
