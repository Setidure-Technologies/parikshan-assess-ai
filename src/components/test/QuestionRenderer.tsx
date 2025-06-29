
import { useState, useEffect } from "react";
import { QuestionCard } from "./QuestionCard";
import { QuestionInput } from "./QuestionInput";
import { TestNavigation } from "./TestNavigation";

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  question_type: 'forced_choice' | 'sjt' | 'likert_scale' | 'true_false' | 'open_ended' | 'mcq';
  options: string[];
  time_limit_seconds: number;
  metadata: any;
}

interface QuestionRendererProps {
  questions: Question[];
  currentQuestion: number;
  answers: { [key: number]: any };
  questionTimeRemaining: number;
  isSubmitting: boolean;
  onAnswerChange: (questionIndex: number, answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  onQuestionSelect: (index: number) => void;
}

export const QuestionRenderer = ({
  questions,
  currentQuestion,
  answers,
  questionTimeRemaining,
  isSubmitting,
  onAnswerChange,
  onNext,
  onPrevious,
  onSubmit,
  onQuestionSelect
}: QuestionRendererProps) => {
  const currentQ = questions[currentQuestion];

  if (!currentQ) {
    return <div>No question available</div>;
  }

  return (
    <>
      <QuestionCard
        question={currentQ}
        questionNumber={currentQuestion + 1}
        timeRemaining={questionTimeRemaining}
      >
        <QuestionInput
          question={currentQ}
          answer={answers[currentQuestion]}
          onAnswerChange={(answer) => onAnswerChange(currentQuestion, answer)}
        />
      </QuestionCard>

      <TestNavigation
        currentQuestion={currentQuestion}
        totalQuestions={questions.length}
        isSubmitting={isSubmitting}
        onPrevious={onPrevious}
        onNext={onNext}
        onSubmit={onSubmit}
      />
    </>
  );
};
