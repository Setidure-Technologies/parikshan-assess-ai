import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, Play, RotateCcw, FileText, BookOpen, CheckCircle, Trophy, Building, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CandidateHeader from '@/components/CandidateHeader';

interface Section {
  id: string;
  name: string;
  description: string;
  time_limit_minutes: number;
  question_count: number;
  answered_count: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface CandidateInfo {
  id: string;
  test_status: string;
  profile_data: any;
  full_name: string;
  email: string;
  phone?: string;
  company?: {
    name: string;
    industry: string;
  };
}

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [candidateInfo, setCandidateInfo] = useState<CandidateInfo | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  useEffect(() => {
    if (!user) return;

    const fetchCandidateData = async () => {
      try {
        // Get candidate info with company details
        const { data: candidate, error: candidateError } = await supabase
          .from('candidates')
          .select(`
            *,
            companies!inner(name, industry)
          `)
          .eq('user_id', user.id)
          .single();

        if (candidateError) throw candidateError;
        
        setCandidateInfo({
          id: candidate.id,
          test_status: candidate.test_status,
          profile_data: candidate.profile_data,
          full_name: candidate.full_name,
          email: candidate.email,
          phone: candidate.phone,
          company: {
            name: candidate.companies.name,
            industry: candidate.companies.industry
          }
        });

        // If already submitted, show completion message
        if (candidate.test_status === 'submitted') {
          setLoading(false);
          return;
        }

        // Get all sections
        const { data: allSections, error: sectionsError } = await supabase
          .from('sections')
          .select('*')
          .order('display_order');

        if (sectionsError) throw sectionsError;

        // For each section, get question count and answers count
        const sectionsWithProgress: Section[] = [];
        
        for (const section of allSections || []) {
          // Get questions for this section and candidate
          const { data: questions, error: questionsError } = await supabase
            .from('questions')
            .select('id')
            .eq('section_id', section.id)
            .eq('candidate_id', candidate.id);

          if (questionsError) {
            console.error('Error fetching questions for section:', section.id, questionsError);
            continue;
          }

          // Get answers for this section and candidate
          const { data: answers, error: answersError } = await supabase
            .from('answers')
            .select('id')
            .eq('section_id', section.id)
            .eq('candidate_id', candidate.id);

          if (answersError) {
            console.error('Error fetching answers for section:', section.id, answersError);
            continue;
          }

          const questionCount = questions?.length || 0;
          const answeredCount = answers?.length || 0;

          let status: 'not_started' | 'in_progress' | 'completed' = 'not_started';
          if (questionCount === 0) {
            status = 'not_started';
          } else if (answeredCount === 0) {
            status = 'not_started';
          } else if (answeredCount < questionCount) {
            status = 'in_progress';
          } else {
            status = 'completed';
          }

          sectionsWithProgress.push({
            id: section.id,
            name: section.name,
            description: section.description || '',
            time_limit_minutes: section.time_limit_minutes || 30,
            question_count: questionCount,
            answered_count: answeredCount,
            status
          });
        }

        setSections(sectionsWithProgress);

      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, [user, toast]);

  const handleStartSection = (sectionId: string) => {
    navigate(`/test-section/${sectionId}`);
  };

  const getProgressPercentage = (section: Section) => {
    if (section.question_count === 0) return 0;
    return Math.round((section.answered_count / section.question_count) * 100);
  };

  const isAllSectionsCompleted = () => {
    return sections.length > 0 && sections.every(section => section.status === 'completed');
  };

  const getTotalProgress = () => {
    if (sections.length === 0) return 0;
    const totalQuestions = sections.reduce((sum, section) => sum + section.question_count, 0);
    const totalAnswered = sections.reduce((sum, section) => sum + section.answered_count, 0);
    return totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;
  };

  const handleFinalSubmission = async () => {
    if (!candidateInfo) return;
    
    setIsSubmitting(true);
    try {
      // Update candidate test status to submitted
      const { error: updateError } = await supabase
        .from('candidates')
        .update({ test_status: 'submitted' })
        .eq('id', candidateInfo.id);

      if (updateError) throw updateError;

      // Prepare comprehensive webhook payload
      const totalQuestions = sections.reduce((sum, section) => sum + section.question_count, 0);
      const totalAnswers = sections.reduce((sum, section) => sum + section.answered_count, 0);
      const completedSections = sections.filter(s => s.status === 'completed').length;

      const webhookPayload = {
        candidate_id: candidateInfo.id,
        user_id: user?.id,
        personal_info: {
          full_name: candidateInfo.full_name,
          email: candidateInfo.email,
          phone: candidateInfo.phone || null
        },
        company_info: {
          company_name: candidateInfo.company?.name || null,
          company_industry: candidateInfo.company?.industry || null
        },
        assessment_summary: {
          total_sections: sections.length,
          completed_sections: completedSections,
          total_questions: totalQuestions,
          total_answers: totalAnswers,
          completion_rate: totalQuestions > 0 ? Math.round((totalAnswers / totalQuestions) * 100) : 0
        },
        section_details: sections.map(section => ({
          section_id: section.id,
          section_name: section.name,
          questions_count: section.question_count,
          answers_count: section.answered_count,
          completion_status: section.status
        })),
        profile_data: candidateInfo.profile_data,
        test_completed_at: new Date().toISOString()
      };

      // Trigger webhook for test evaluation
      try {
        console.log('Sending comprehensive webhook payload:', webhookPayload);
        const webhookResponse = await fetch('https://n8n.erudites.in/webhook-test/testevaluation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload)
        });

        if (!webhookResponse.ok) {
          console.error('Webhook failed:', webhookResponse.statusText);
        } else {
          console.log('Webhook sent successfully');
        }
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
        // Don't fail the submission if webhook fails
      }

      // Update local state
      setCandidateInfo(prev => prev ? { ...prev, test_status: 'submitted' } : null);

      toast({
        title: "Test Submitted Successfully!",
        description: "Your assessment has been submitted for evaluation. Results will be available soon.",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-parikshan-orange"></div>
      </div>
    );
  }

  // Show completion message if test is already submitted
  if (candidateInfo?.test_status === 'submitted') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <CandidateHeader onLogout={handleLogout} />
        <div className="flex items-center justify-center p-4 pt-20">
          <Card className="max-w-2xl w-full shadow-2xl border-0">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-parikshan-orange to-orange-400 rounded-full flex items-center justify-center mb-4">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">
                Assessment Completed!
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Thank you for completing your assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-lg mb-4">Candidate Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">{candidateInfo.full_name}</span>
                  </div>
                  {candidateInfo.company && (
                    <>
                      <div className="flex items-center justify-center gap-2">
                        <Building className="h-5 w-5 text-gray-500" />
                        <span>{candidateInfo.company.name}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Briefcase className="h-5 w-5 text-gray-500" />
                        <span>{candidateInfo.company.industry}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-100 to-orange-200 p-6 rounded-lg">
                <CheckCircle className="h-12 w-12 text-parikshan-orange mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">What's Next?</h3>
                <p className="text-gray-700">
                  Your responses are being evaluated by our AI system. The hiring team will receive your detailed assessment report and contact you with next steps.
                </p>
              </div>

              <div className="text-sm text-gray-500">
                <p>Assessment submitted successfully</p>
                <p>You may now close this window</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <CandidateHeader onLogout={handleLogout} />
      <div className="p-4 pt-20">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment Dashboard</h1>
            <p className="text-gray-600">Welcome back! Complete your assessment sections below.</p>
          </div>

          {/* Overall Progress Card */}
          <Card className="mb-8 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-parikshan-orange">
                <Trophy className="h-5 w-5" />
                Overall Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Progress</span>
                  <span className="text-sm text-gray-500">
                    {sections.reduce((sum, s) => sum + s.answered_count, 0)} of{' '}
                    {sections.reduce((sum, s) => sum + s.question_count, 0)} questions completed
                  </span>
                </div>
                <Progress value={getTotalProgress()} className="h-3" />
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {sections.filter(s => s.status === 'completed').length} of {sections.length} sections completed
                  </div>
                  {isAllSectionsCompleted() && (
                    <Badge className="bg-green-100 text-green-700">
                      Ready for Final Submission
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-parikshan-orange">
                  <User className="h-5 w-5" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{candidateInfo?.full_name}</p>
                  <p className="text-sm text-gray-600">{candidateInfo?.email}</p>
                </div>
                
                {candidateInfo?.company && (
                  <div className="pt-3 border-t">
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Company</span>
                    </div>
                    <p className="text-sm text-gray-700">{candidateInfo.company.name}</p>
                    
                    <div className="flex items-center gap-2 mt-2 mb-1">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Industry</span>
                    </div>
                    <p className="text-sm text-gray-700">{candidateInfo.company.industry}</p>
                  </div>
                )}
                
                <Button 
                  onClick={() => navigate('/candidate-profile')} 
                  variant="outline" 
                  className="w-full mt-4"
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Sections Cards */}
            {sections.map((section) => (
              <Card key={section.id} className="col-span-full lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-parikshan-orange">
                    <BookOpen className="h-5 w-5" />
                    {section.name}
                  </CardTitle>
                  <CardDescription>
                    {section.description || 'Assessment section'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-500">
                      {section.answered_count} of {section.question_count} questions
                    </span>
                  </div>
                  <Progress value={getProgressPercentage(section)} className="h-2" />
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      section.status === 'completed' ? 'default' :
                      section.status === 'in_progress' ? 'secondary' : 'outline'
                    }>
                      {section.status === 'completed' ? 'Completed' :
                       section.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {section.time_limit_minutes} minutes • {section.question_count} questions
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {section.question_count > 0 ? (
                      <Button 
                        onClick={() => handleStartSection(section.id)} 
                        className="flex-1 bg-parikshan-orange hover:bg-parikshan-orange-dark text-white"
                        disabled={candidateInfo?.test_status === 'submitted'}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {section.status === 'not_started' ? 'Start Test' : 
                         section.status === 'in_progress' ? 'Continue Test' : 'Review Test'}
                      </Button>
                    ) : (
                      <div className="text-sm text-gray-500 p-4 bg-gray-100 rounded flex-1 text-center">
                        Questions not available yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {sections.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Sections Available</h3>
                  <p className="text-gray-500">
                    Test sections haven't been set up yet. Please contact your administrator.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Final Submission Button */}
          {isAllSectionsCompleted() && candidateInfo?.test_status !== 'submitted' && (
            <Card className="shadow-xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100">
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-parikshan-orange mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Submit Your Assessment</h3>
                <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                  You have successfully completed all sections of your assessment. Click below to submit your responses for final evaluation.
                </p>
                <p className="text-sm text-gray-600 mb-6">
                  <strong>Important:</strong> Once submitted, you cannot make any changes to your responses.
                </p>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-parikshan-orange to-orange-400 hover:from-parikshan-orange-dark hover:to-orange-500 text-white px-8 py-3"
                    >
                      Submit Complete Assessment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Final Submission</DialogTitle>
                      <DialogDescription className="space-y-3">
                        <p>
                          Are you sure you want to submit your complete assessment? This action cannot be undone.
                        </p>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <p className="font-medium text-yellow-800">Before submitting, please ensure:</p>
                          <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                            <li>• You have reviewed all your responses</li>
                            <li>• All sections are marked as complete</li>
                            <li>• You are satisfied with your answers</li>
                          </ul>
                        </div>
                        <p className="text-sm text-gray-600">
                          After submission, your responses will be evaluated and the results will be sent to the hiring team.
                        </p>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-4 mt-6">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {}}
                      >
                        Cancel
                      </Button>
                      <Button 
                        className="flex-1 bg-gradient-to-r from-parikshan-orange to-orange-400 hover:from-parikshan-orange-dark hover:to-orange-500 text-white"
                        onClick={handleFinalSubmission}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Confirm Submission"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
