
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Brain, Clock, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const TestSection = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock questions data - replace with actual Supabase queries
  const questionsData = {
    psychometric: [
      {
        id: 1,
        type: "mcq",
        text: "When working in a team, you prefer to:",
        options: [
          "Take the lead and delegate tasks",
          "Contribute ideas and collaborate equally",
          "Support others and follow directions",
          "Work independently on specific tasks"
        ]
      },
      {
        id: 2,
        type: "mcq",
        text: "How do you typically handle stress?",
        options: [
          "Take breaks and practice relaxation",
          "Talk to others about the situation",
          "Focus on problem-solving strategies",
          "Push through and work harder"
        ]
      },
      {
        id: 3,
        type: "text",
        text: "Describe a challenging situation you faced recently and how you resolved it:"
      }
    ],
    language: [
      {
        id: 1,
        type: "mcq",
        text: "Choose the correct grammar usage:",
        options: [
          "The team have completed their project",
          "The team has completed their project",
          "The team has completed its project", 
          "The team have completed its project"
        ]
      },
      {
        id: 2,
        type: "long_text",
        text: "Write a brief professional email requesting a meeting with your supervisor to discuss a project proposal. Include all necessary components of a business email:"
      }
    ],
    interview: [
      {
        id: 1,
        type: "long_text",
        text: "Tell us about yourself and why you're interested in this position:"
      },
      {
        id: 2,
        type: "long_text",
        text: "Describe your greatest professional achievement and what made it meaningful to you:"
      }
    ]
  };

  const sectionNames = {
    psychometric: "Psychometric Assessment",
    language: "Language Skills",
    speech: "Speech Assessment",
    interview: "Interview Questions"
  };

  const questions = questionsData[sectionId as keyof typeof questionsData] || [];
  const sectionName = sectionNames[sectionId as keyof typeof sectionNames] || "Test Section";

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
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

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSave = () => {
    toast({
      title: "Progress Saved",
      description: "Your answers have been saved successfully",
    });
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
    
    // Simulate submission - replace with actual Supabase operation
    setTimeout(() => {
      toast({
        title: "Section Completed",
        description: `${sectionName} submitted successfully!`,
      });
      navigate("/candidate-dashboard");
    }, 1500);
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Section Not Available</CardTitle>
            <CardDescription>
              Questions for this section haven't been generated yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/candidate-dashboard">
              <Button className="w-full">
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/candidate-dashboard" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Parikshan AI</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span className={timeRemaining < 300 ? "text-red-600 font-bold" : ""}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSave}>
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
            <div className="text-sm text-gray-600">
              {Object.keys(answers).length} of {questions.length} answered
            </div>
          </div>
          <Progress value={progress} className="mt-4 h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">
              Question {currentQuestion + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-900 text-lg leading-relaxed">
              {currentQ.text}
            </p>

            {/* MCQ Options */}
            {currentQ.type === "mcq" && currentQ.options && (
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
                        className="text-gray-700 cursor-pointer flex-1 p-3 rounded border hover:bg-gray-50"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {/* Text Input */}
            {currentQ.type === "text" && (
              <Input
                placeholder="Type your answer here..."
                value={answers[currentQuestion] || ""}
                onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                className="w-full"
              />
            )}

            {/* Long Text Input */}
            {currentQ.type === "long_text" && (
              <Textarea
                placeholder="Type your detailed answer here..."
                value={answers[currentQuestion] || ""}
                onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                className="w-full min-h-[150px]"
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
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
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Answer Summary */}
        <Card className="mt-8">
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
                  onClick={() => setCurrentQuestion(index)}
                  className="h-8 w-8 p-0"
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
