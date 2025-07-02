import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TestHeader } from "@/components/test/TestHeader";
import { TestProgress } from "@/components/test/TestProgress";
import { QuestionCard } from "@/components/test/QuestionCard";
import { QuestionInput } from "@/components/test/QuestionInput";
import { TestNavigation } from "@/components/test/TestNavigation";
import { QuestionOverview } from "@/components/test/QuestionOverview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  question_type: 'forced_choice' | 'sjt' | 'likert_scale' | 'true_false' | 'open_ended' | 'mcq';
  options: string[];
  time_limit_seconds: number;
  metadata: any;
}

const TestSection = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: any }>({});
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(0);
  const [totalTimeRemaining, setTotalTimeRemaining] = useState(30 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sectionName, setSectionName] = useState('');

  // Load questions from database
  useEffect(() => {
    const loadQuestions = async () => {
      if (!user || !sectionId) return;
      
      try {
        console.log('Loading questions for section:', sectionId);
        
        // Get candidate record
        const { data: candidate, error: candidateError } = await supabase
          .from('candidates')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (candidateError) {
          console.error('Error fetching candidate:', candidateError);
          toast({
            title: "Error",
            description: "Candidate record not found",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (!candidate) {
          console.error('No candidate found for user:', user.id);
          toast({
            title: "Error",
            description: "Candidate record not found",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        console.log('Found candidate ID:', candidate.id);

        // Get section info
        const { data: section, error: sectionError } = await supabase
          .from('sections')
          .select('name, time_limit_minutes')
          .eq('id', sectionId)
          .single();

        if (sectionError) {
          console.error('Error fetching section:', sectionError);
          toast({
            title: "Error",
            description: "Section not found",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (section) {
          console.log('Found section:', section.name);
          setSectionName(section.name);
          setTotalTimeRemaining(section.time_limit_minutes * 60);
        }

        // Get questions for this section and candidate
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('section_id', sectionId)
          .eq('candidate_id', candidate.id)
          .order('question_number');

        if (questionsError) {
          console.error('Error fetching questions:', questionsError);
          toast({
            title: "Error",
            description: "Failed to load questions",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        console.log('Found questions:', questionsData?.length || 0);

        if (questionsData && questionsData.length > 0) {
          const formattedQuestions: Question[] = questionsData.map(q => ({
            id: q.id,
            question_number: q.question_number,
            question_text: q.question_text,
            question_type: q.question_type,
            options: Array.isArray(q.options) ? q.options.map(option => String(option)) : [],
            time_limit_seconds: q.time_limit_seconds || 60,
            metadata: q.metadata || {}
          }));
          
          setQuestions(formattedQuestions);
          setQuestionTimeRemaining(formattedQuestions[0]?.time_limit_seconds || 60);
          
          // Load existing answers
          const { data: answersData, error: answersError } = await supabase
            .from('answers')
            .select('*')
            .eq('section_id', sectionId)
            .eq('candidate_id', candidate.id);
            
          if (!answersError && answersData && answersData.length > 0) {
            console.log('Found existing answers:', answersData.length);
            const answersMap: { [key: number]: any } = {};
            
            answersData.forEach(answer => {
              const questionIndex = formattedQuestions.findIndex(q => q.id === answer.question_id);
              if (questionIndex !== -1) {
                // Handle different answer_data structures
                let answerValue = answer.answer_data;
                if (typeof answerValue === 'object' && answerValue !== null && 'value' in answerValue) {
                  answerValue = (answerValue as any).value;
                }
                answersMap[questionIndex] = answerValue;
              }
            });
            
            setAnswers(answersMap);
          }
        } else {
          console.log('No questions found for this section and candidate');
        }
      } catch (error) {
        console.error('Error loading questions:', error);
        toast({
          title: "Error",
          description: "Failed to load questions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [sectionId, user, toast]);

  // Question timer
  useEffect(() => {
    if (questionTimeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setQuestionTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-move to next question when time runs out
          if (currentQuestion < questions.length - 1) {
            handleNext();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [questionTimeRemaining, currentQuestion, questions.length]);

  // Total timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTotalTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswerChange = (questionIndex: number, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      const nextIndex = currentQuestion + 1;
      setCurrentQuestion(nextIndex);
      setQuestionTimeRemaining(questions[nextIndex]?.time_limit_seconds || 60);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      const prevIndex = currentQuestion - 1;
      setCurrentQuestion(prevIndex);
      setQuestionTimeRemaining(questions[prevIndex]?.time_limit_seconds || 60);
    }
  };

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestion(index);
    setQuestionTimeRemaining(questions[index]?.time_limit_seconds || 60);
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      const { data: candidate } = await supabase
        .from('candidates')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!candidate) return;

      // Save current answers
      const answersToSave = Object.entries(answers).map(([qIndex, answer]) => ({
        candidate_id: candidate.id,
        question_id: questions[parseInt(qIndex)]?.id,
        section_id: sectionId,
        answer_data: { value: answer, question_index: parseInt(qIndex) }
      }));

      await supabase.from('answers').upsert(answersToSave);
      
      toast({
        title: "Progress Saved",
        description: "Your answers have been saved successfully",
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleAutoSubmit = () => {
    toast({
      title: "Time's Up!",
      description: "Your test has been automatically submitted",
      variant: "destructive",
    });
    handleSubmit();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await handleSave();
    
    setTimeout(() => {
      toast({
        title: "Section Completed",
        description: `${sectionName} submitted successfully!`,
      });
      navigate("/candidate-dashboard");
    }, 1500);
  };

  // Question timer
  useEffect(() => {
    if (questionTimeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setQuestionTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-move to next question when time runs out
          if (currentQuestion < questions.length - 1) {
            handleNext();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [questionTimeRemaining, currentQuestion, questions.length]);

  // Total timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTotalTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Section Not Available</CardTitle>
            <CardDescription>
              Questions for this section haven't been generated yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/candidate-dashboard">
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white">
      <TestHeader
        questionTimeRemaining={questionTimeRemaining}
        totalTimeRemaining={totalTimeRemaining}
        onSave={handleSave}
      />

      <div className="container mx-auto px-4 py-8">
        <TestProgress
          sectionName={sectionName}
          currentQuestion={currentQuestion}
          totalQuestions={questions.length}
          questionType={currentQ.question_type}
          answeredCount={Object.keys(answers).length}
        />

        <QuestionCard
          question={currentQ}
          questionNumber={currentQuestion + 1}
          timeRemaining={questionTimeRemaining}
        >
          <QuestionInput
            question={currentQ}
            answer={answers[currentQuestion]}
            onAnswerChange={(answer) => handleAnswerChange(currentQuestion, answer)}
          />
        </QuestionCard>

        <TestNavigation
          currentQuestion={currentQuestion}
          totalQuestions={questions.length}
          isSubmitting={isSubmitting}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSubmit={handleSubmit}
        />

        <QuestionOverview
          totalQuestions={questions.length}
          currentQuestion={currentQuestion}
          answers={answers}
          onQuestionSelect={handleQuestionSelect}
        />
      </div>
    </div>
  );
};

export default TestSection;
