import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, ChevronLeft, ChevronRight, Save, Timer } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  question_type: 'forced_choice' | 'sjt' | 'likert_scale' | 'true_false' | 'open_ended';
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
      if (!user) return;
      
      try {
        // Get candidate record
        const { data: candidate } = await supabase
          .from('candidates')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!candidate) {
          toast({
            title: "Error",
            description: "Candidate record not found",
            variant: "destructive",
          });
          return;
        }

        // Get section info
        const { data: section } = await supabase
          .from('sections')
          .select('name, time_limit_minutes')
          .eq('id', sectionId)
          .single();

        if (section) {
          setSectionName(section.name);
          setTotalTimeRemaining(section.time_limit_minutes * 60);
        }

        // Get questions for this section and candidate
        const { data: questionsData } = await supabase
          .from('questions')
          .select('*')
          .eq('section_id', sectionId)
          .eq('candidate_id', candidate.id)
          .order('question_number');

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const renderQuestionInput = () => {
    switch (currentQ.question_type) {
      case 'likert_scale':
        return (
          <RadioGroup
            value={answers[currentQuestion] || ""}
            onValueChange={(value) => handleAnswerChange(currentQuestion, value)}
          >
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
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

      case 'forced_choice':
      case 'sjt':
        return (
          <RadioGroup
            value={answers[currentQuestion] || ""}
            onValueChange={(value) => handleAnswerChange(currentQuestion, value)}
          >
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
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
            value={answers[currentQuestion] || ""}
            onValueChange={(value) => handleAnswerChange(currentQuestion, value)}
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
            value={answers[currentQuestion] || ""}
            onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
            className="w-full min-h-[150px] border-cyan-200 focus:border-cyan-500"
          />
        );

      default:
        return (
          <Input
            placeholder="Type your answer here..."
            value={answers[currentQuestion] || ""}
            onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
            className="w-full border-cyan-200 focus:border-cyan-500"
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur shadow-sm border-b border-cyan-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/candidate-dashboard" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-cyan-600" />
              <span className="text-2xl font-bold text-gray-900">Parikshan AI</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Timer className="h-4 w-4" />
                <span>Question: {formatTime(questionTimeRemaining)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span className={totalTimeRemaining < 300 ? "text-red-600 font-bold" : ""}>
                  Total: {formatTime(totalTimeRemaining)}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSave} className="border-cyan-200 hover:bg-cyan-50">
                <Save className="w-4 h-4 mr-2" />
                Save Progress
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Section Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{sectionName}</h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </p>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-cyan-200">
                {currentQ.question_type.replace('_', ' ').toUpperCase()}
              </Badge>
              <div className="text-sm text-gray-600">
                {Object.keys(answers).length} of {questions.length} answered
              </div>
            </div>
          </div>
          <Progress value={progress} className="mt-4 h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-8 border-cyan-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Question {currentQuestion + 1}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Timer className="h-4 w-4 text-cyan-600" />
                <span className={`text-sm font-mono ${questionTimeRemaining < 10 ? 'text-red-600' : 'text-cyan-600'}`}>
                  {formatTime(questionTimeRemaining)}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-900 text-lg leading-relaxed">
              {currentQ.question_text}
            </p>

            {renderQuestionInput()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="border-cyan-200 hover:bg-cyan-50"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-3">
            {currentQuestion === questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Submitting..." : "Submit Section"}
              </Button>
            ) : (
              <Button onClick={handleNext} className="bg-cyan-600 hover:bg-cyan-700">
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Answer Summary */}
        <Card className="mt-8 border-cyan-200">
          <CardHeader>
            <CardTitle className="text-sm">Question Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2">
              {questions.map((_, index) => (
                <Button
                  key={index}
                  variant={currentQuestion === index ? "default" : answers[index] ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => {
                    setCurrentQuestion(index);
                    setQuestionTimeRemaining(questions[index]?.time_limit_seconds || 60);
                  }}
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
      </div>
    </div>
  );
};

export default TestSection;
