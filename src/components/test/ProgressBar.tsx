
import { TestProgress } from "./TestProgress";
import { QuestionOverview } from "./QuestionOverview";

interface ProgressBarProps {
  sectionName: string;
  currentQuestion: number;
  totalQuestions: number;
  questionType: string;
  answeredCount: number;
  answers: { [key: number]: any };
  onQuestionSelect: (index: number) => void;
}

export const ProgressBar = ({
  sectionName,
  currentQuestion,
  totalQuestions,
  questionType,
  answeredCount,
  answers,
  onQuestionSelect
}: ProgressBarProps) => {
  return (
    <>
      <TestProgress
        sectionName={sectionName}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        questionType={questionType}
        answeredCount={answeredCount}
      />

      <QuestionOverview
        totalQuestions={totalQuestions}
        currentQuestion={currentQuestion}
        answers={answers}
        onQuestionSelect={onQuestionSelect}
      />
    </>
  );
};
