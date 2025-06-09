
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer } from "lucide-react";

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  question_type: 'forced_choice' | 'sjt' | 'likert_scale' | 'true_false' | 'open_ended';
  options: string[];
  time_limit_seconds: number;
  metadata: any;
}

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  timeRemaining: number;
  children: React.ReactNode;
}

export const QuestionCard = ({ question, questionNumber, timeRemaining, children }: QuestionCardProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="mb-8 border-cyan-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Question {questionNumber}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Timer className="h-4 w-4 text-cyan-600" />
            <span className={`text-sm font-mono ${timeRemaining < 10 ? 'text-red-600' : 'text-cyan-600'}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-gray-900 text-lg leading-relaxed">
          {question.question_text}
        </p>
        {children}
      </CardContent>
    </Card>
  );
};
