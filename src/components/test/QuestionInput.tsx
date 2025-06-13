
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  question_type: 'forced_choice' | 'sjt' | 'likert_scale' | 'true_false' | 'open_ended' | 'mcq';
  options: string[];
  time_limit_seconds: number;
  metadata: any;
}

interface QuestionInputProps {
  question: Question;
  answer: any;
  onAnswerChange: (answer: any) => void;
}

export const QuestionInput = ({ question, answer, onAnswerChange }: QuestionInputProps) => {
  switch (question.question_type) {
    case 'mcq':
    case 'likert_scale':
    case 'forced_choice':
    case 'sjt':
      return (
        <RadioGroup
          value={answer || ""}
          onValueChange={(value) => onAnswerChange(value)}
        >
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label 
                  htmlFor={`option-${index}`} 
                  className="text-gray-700 cursor-pointer flex-1 p-3 rounded border hover:bg-cyan-50 border-cyan-200"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      );

    case 'true_false':
      return (
        <RadioGroup
          value={answer || ""}
          onValueChange={(value) => onAnswerChange(value)}
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="true" />
              <Label htmlFor="true" className="text-gray-700 cursor-pointer flex-1 p-3 rounded border hover:bg-cyan-50 border-cyan-200">
                True
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="false" />
              <Label htmlFor="false" className="text-gray-700 cursor-pointer flex-1 p-3 rounded border hover:bg-cyan-50 border-cyan-200">
                False
              </Label>
            </div>
          </div>
        </RadioGroup>
      );

    case 'open_ended':
      return (
        <Textarea
          placeholder="Type your detailed answer here..."
          value={answer || ""}
          onChange={(e) => onAnswerChange(e.target.value)}
          className="w-full min-h-[150px] border-cyan-200 focus:border-cyan-500"
        />
      );

    default:
      return (
        <Input
          placeholder="Type your answer here..."
          value={answer || ""}
          onChange={(e) => onAnswerChange(e.target.value)}
          className="w-full border-cyan-200 focus:border-cyan-500"
        />
      );
  }
};
