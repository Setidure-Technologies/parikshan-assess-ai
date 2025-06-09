
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, User, FileText, Mic, MessageSquare, Clock, LogOut, Play } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const CandidateDashboard = () => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock data - replace with actual Supabase queries
  const candidateData = {
    full_name: "John Doe",
    email: "john@test.com",
    phone: "+1234567890",
    company: "TechCorp Solutions"
  };

  const testSections = [
    {
      id: "psychometric",
      name: "Psychometric Assessment",
      description: "Personality and cognitive ability tests",
      icon: Brain,
      duration: "30 minutes",
      questions: 25,
      completed: false,
      available: true
    },
    {
      id: "language",
      name: "Language Skills",
      description: "English proficiency and communication skills",
      icon: FileText,
      duration: "20 minutes",
      questions: 15,
      completed: false,
      available: true
    },
    {
      id: "speech",
      name: "Speech Assessment",
      description: "Verbal communication and pronunciation",
      icon: Mic,
      duration: "15 minutes",
      questions: 5,
      completed: false,
      available: false // No questions generated yet
    },
    {
      id: "interview",
      name: "Interview Questions",
      description: "Technical and behavioral interview questions",
      icon: MessageSquare,
      duration: "45 minutes",
      questions: 10,
      completed: false,
      available: true
    }
  ];

  const completedSections = testSections.filter(s => s.completed).length;
  const totalSections = testSections.length;
  const progressPercentage = (completedSections / totalSections) * 100;

  const handleStartSection = (sectionId: string) => {
    const section = testSections.find(s => s.id === sectionId);
    if (!section?.available) {
      toast({
        title: "Section Not Available",
        description: "Questions for this section haven't been generated yet.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Starting Test Section",
      description: `Beginning ${section.name}...`,
    });

    setTimeout(() => {
      navigate(`/test/${sectionId}`);
    }, 1000);
  };

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Parikshan AI</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {candidateData.full_name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidate Dashboard</h1>
          <p className="text-gray-600">Complete your assessment sections at your own pace</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Profile</CardTitle>
              <User className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium">{candidateData.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{candidateData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{candidateData.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-medium">{candidateData.company}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Card */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Test Progress</CardTitle>
              <FileText className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold">{completedSections}/{totalSections}</div>
                <p className="text-sm text-gray-600">Sections Completed</p>
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {progressPercentage.toFixed(0)}% Complete
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Instructions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Test Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  • Complete all available sections
                </p>
                <p className="text-gray-600">
                  • Take your time, but be mindful of time limits
                </p>
                <p className="text-gray-600">
                  • Save your progress regularly
                </p>
                <p className="text-gray-600">
                  • Contact support if you face issues
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Sections */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessment Sections</h2>
            <p className="text-gray-600 mb-6">
              Click on any available section to begin your assessment
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {testSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.id} className={`transition-all duration-200 ${section.available ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${section.available ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <Icon className={`h-6 w-6 ${section.available ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{section.name}</CardTitle>
                          <CardDescription>{section.description}</CardDescription>
                        </div>
                      </div>
                      {section.completed && (
                        <Badge variant="default" className="bg-green-600">
                          Completed
                        </Badge>
                      )}
                      {!section.available && (
                        <Badge variant="secondary">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{section.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="h-4 w-4" />
                          <span>{section.questions} questions</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleStartSection(section.id)}
                      disabled={!section.available || section.completed}
                      className="w-full"
                      variant={section.completed ? "outline" : "default"}
                    >
                      {section.completed ? (
                        "Review Answers"
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          {section.available ? "Start Section" : "Not Available"}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Final Submit */}
          {completedSections === totalSections && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Assessment Complete</CardTitle>
                <CardDescription className="text-green-700">
                  You have completed all sections. Submit your final assessment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Submit Final Assessment
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
