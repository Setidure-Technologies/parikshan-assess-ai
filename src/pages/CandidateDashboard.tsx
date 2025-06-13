
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, User, FileText, Mic, MessageSquare, Clock, LogOut, Play } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Section {
  id: string;
  name: string;
  description: string;
  icon: any;
  duration: string;
  questions: number;
  completed: boolean;
  available: boolean;
  time_limit_minutes: number;
}

interface CandidateData {
  full_name: string;
  email: string;
  phone: string;
  company: string;
}

const CandidateDashboard = () => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [candidateData, setCandidateData] = useState<CandidateData>({
    full_name: "",
    email: "",
    phone: "",
    company: ""
  });
  const [testSections, setTestSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Map section names to icons
  const sectionIcons: { [key: string]: any } = {
    'Psychometric Assessment': Brain,
    'Language Skills': FileText,
    'Situational Judgment': MessageSquare,
    'Technical Assessment': Mic
  };

  useEffect(() => {
    if (user) {
      fetchCandidateData();
      fetchSections();
    }
  }, [user]);

  const fetchCandidateData = async () => {
    try {
      // Get candidate record
      const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .select('*, companies(name)')
        .eq('user_id', user?.id)
        .single();

      if (candidateError) {
        console.error('Error fetching candidate data:', candidateError);
        return;
      }

      if (candidate) {
        setCandidateData({
          full_name: candidate.full_name,
          email: candidate.email,
          phone: candidate.phone || '',
          company: candidate.companies?.name || ''
        });
      }
    } catch (error) {
      console.error('Error in fetchCandidateData:', error);
    }
  };

  const fetchSections = async () => {
    try {
      setLoading(true);
      
      // Get candidate ID
      const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (candidateError) {
        console.error('Error fetching candidate ID:', candidateError);
        setLoading(false);
        return;
      }

      // Get all sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('sections')
        .select('*')
        .order('display_order');

      if (sectionsError) {
        console.error('Error fetching sections:', sectionsError);
        setLoading(false);
        return;
      }

      // For each section, check if questions exist for this candidate
      const sectionsWithAvailability = await Promise.all(sectionsData.map(async (section) => {
        // Check if questions exist for this section and candidate
        const { data: questions, error: questionsError } = await supabase
          .from('questions')
          .select('id')
          .eq('section_id', section.id)
          .eq('candidate_id', candidate?.id);

        if (questionsError) {
          console.error(`Error checking questions for section ${section.name}:`, questionsError);
        }

        // Check if answers exist for this section (to determine if completed)
        const { data: answers, error: answersError } = await supabase
          .from('answers')
          .select('id')
          .eq('section_id', section.id)
          .eq('candidate_id', candidate?.id);

        if (answersError) {
          console.error(`Error checking answers for section ${section.name}:`, answersError);
        }

        const available = questions && questions.length > 0;
        const completed = answers && answers.length > 0 && answers.length >= (questions?.length || 0);

        return {
          id: section.id,
          name: section.name,
          description: section.description || '',
          icon: sectionIcons[section.name] || FileText,
          duration: `${section.time_limit_minutes} minutes`,
          questions: questions?.length || 0,
          completed: completed,
          available: available,
          time_limit_minutes: section.time_limit_minutes
        };
      }));

      setTestSections(sectionsWithAvailability);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchSections:', error);
      setLoading(false);
    }
  };

  const completedSections = testSections.filter(s => s.completed).length;
  const totalSections = testSections.length;
  const progressPercentage = totalSections > 0 ? (completedSections / totalSections) * 100 : 0;

  const handleStartSection = async (sectionId: string) => {
    const section = testSections.find(s => s.id === sectionId);
    if (!section?.available) {
      toast({
        title: "Section Not Available",
        description: "Questions for this section haven't been generated yet.",
        variant: "destructive",
      });
      return;
    }

    // Get candidate ID
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('id')
      .eq('user_id', user?.id)
      .single();

    if (candidateError) {
      console.error('Error fetching candidate ID:', candidateError);
      toast({
        title: "Error",
        description: "Could not retrieve your candidate information",
        variant: "destructive",
      });
      return;
    }

    // Double check that questions exist for this section
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id')
      .eq('section_id', sectionId)
      .eq('candidate_id', candidate?.id);

    if (questionsError || !questions || questions.length === 0) {
      console.error('Error checking questions:', questionsError);
      toast({
        title: "No Questions Available",
        description: "There are no questions available for this section yet.",
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
      navigate("/");
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-cyan-800 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

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
