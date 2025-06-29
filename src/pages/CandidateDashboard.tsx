import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { User, Play, RotateCcw, FileText, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ACTIVE_WEBHOOKS } from '@/config/webhooks';
import { Tables } from '@/integrations/supabase/types';

// Use the actual database type and extend it with our computed properties
interface Section extends Tables<'sections'> {
  question_count: number;
  completed_answers: number;
}

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [testSessions, setTestSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchCandidateData = async () => {
      try {
        // Get candidate info
        const { data: candidate, error: candidateError } = await supabase
          .from('candidates')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (candidateError) throw candidateError;
        setCandidateId(candidate.id);
        console.log('Found candidate ID:', candidate.id);

        // Get all sections
        const { data: allSections, error: sectionsError } = await supabase
          .from('sections')
          .select('*')
          .order('display_order');

        if (sectionsError) throw sectionsError;

        // For each section, check if questions exist for this candidate
        const sectionsWithData = await Promise.all(
          (allSections || []).map(async (section) => {
            // Get question count for this section and candidate
            const { data: questions, error: questionsError } = await supabase
              .from('questions')
              .select('id')
              .eq('section_id', section.id)
              .eq('candidate_id', candidate.id);

            if (questionsError) {
              console.error('Error fetching questions for section:', section.name, questionsError);
              return null;
            }

            // Get completed answers count for this section and candidate
            const { data: answers, error: answersError } = await supabase
              .from('answers')
              .select('id')
              .eq('section_id', section.id)
              .eq('candidate_id', candidate.id);

            if (answersError) {
              console.error('Error fetching answers for section:', section.name, answersError);
            }

            const questionCount = questions?.length || 0;
            const answersCount = answers?.length || 0;

            console.log(`Section ${section.name}: ${questionCount} questions, ${answersCount} answers`);

            return {
              ...section,
              question_count: questionCount,
              completed_answers: answersCount
            };
          })
        );

        // Filter out null results and sections without questions
        const availableSections = sectionsWithData
          .filter((section): section is Section => 
            section !== null && section.question_count > 0
          );

        console.log('Available sections:', availableSections.map(s => s.name));
        setSections(availableSections);

        // Get test sessions
        const { data: sessions, error: sessionsError } = await supabase
          .from('test_sessions')
          .select('*')
          .eq('candidate_id', candidate.id);

        if (sessionsError) throw sessionsError;
        setTestSessions(sessions || []);

      } catch (error: any) {
        console.error('Error fetching candidate data:', error);
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

  const getSectionProgress = (section: Section) => {
    if (section.question_count === 0) return 0;
    return Math.round((section.completed_answers / section.question_count) * 100);
  };

  const getSectionStatus = (section: Section) => {
    if (section.question_count === 0) return 'not_available';
    if (section.completed_answers === 0) return 'not_started';
    if (section.completed_answers < section.question_count) return 'in_progress';
    return 'completed';
  };

  const canRetrySection = (sectionId: string) => {
    const completedSessions = testSessions.filter(s => 
      s.section_id === sectionId && s.status === 'completed'
    );
    return completedSessions.length > 0 && completedSessions.length < 2;
  };

  const areAllSectionsCompleted = () => {
    return sections.length > 0 && sections.every(section => getSectionStatus(section) === 'completed');
  };

  const handleStartTest = (sectionId: string) => {
    if (candidateId) {
      navigate(`/test-section/${sectionId}?candidateId=${candidateId}`);
    }
  };

  const handleRetryTest = async (sectionId: string) => {
    if (!candidateId) return;

    try {
      // Clear previous answers for this section
      await supabase
        .from('answers')
        .delete()
        .eq('candidate_id', candidateId)
        .eq('section_id', sectionId);

      // Create new test session
      await supabase
        .from('test_sessions')
        .insert({
          candidate_id: candidateId,
          section_id: sectionId,
          attempt: testSessions.filter(s => s.section_id === sectionId).length + 1,
        });

      navigate(`/test-section/${sectionId}?candidateId=${candidateId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFinalSubmission = async () => {
    if (!candidateId || !user) return;

    setIsSubmittingFinal(true);

    try {
      // Get comprehensive candidate and test data
      const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .select(`
          *,
          companies (
            id,
            name,
            email,
            industry
          )
        `)
        .eq('id', candidateId)
        .single();

      if (candidateError) throw candidateError;

      // Get all answers with section details
      const { data: allAnswers, error: answersError } = await supabase
        .from('answers')
        .select(`
          *,
          sections (
            id,
            name,
            description
          ),
          questions (
            id,
            question_text,
            question_type,
            options
          )
        `)
        .eq('candidate_id', candidateId);

      if (answersError) throw answersError;

      // Get all test sessions
      const { data: allSessions, error: sessionsError } = await supabase
        .from('test_sessions')
        .select('*')
        .eq('candidate_id', candidateId);

      if (sessionsError) throw sessionsError;

      // Calculate total time taken across all sessions
      const totalTimeSpent = allSessions?.reduce((total, session) => {
        return total + (session.total_time_seconds || 0);
      }, 0) || 0;

      // Prepare comprehensive submission data
      const submissionData = {
        candidate_id: candidateId,
        candidate_email: candidate.email,
        candidate_name: candidate.full_name,
        candidate_phone: candidate.phone,
        candidate_profile_data: candidate.profile_data,
        user_id: user.id,
        company_id: candidate.company_id,
        company_name: candidate.companies?.name,
        company_email: candidate.companies?.email,
        company_industry: candidate.companies?.industry,
        sections_completed: sections.length,
        total_questions: sections.reduce((sum, section) => sum + section.question_count, 0),
        total_answers: sections.reduce((sum, section) => sum + section.completed_answers, 0),
        total_time_spent_seconds: totalTimeSpent,
        answers: allAnswers,
        test_sessions: allSessions,
        sections_data: sections,
        submission_timestamp: new Date().toISOString(),
        test_status: 'completed',
        submitted_from: window.location.origin,
        section_breakdown: sections.map(section => ({
          section_id: section.id,
          section_name: section.name,
          questions_count: section.question_count,
          answers_count: section.completed_answers,
          completion_percentage: getSectionProgress(section),
          status: getSectionStatus(section)
        }))
      };

      console.log('Submitting comprehensive test data to n8n:', submissionData);

      // Send to n8n webhook with proper headers
      const webhookResponse = await fetch(ACTIVE_WEBHOOKS.TEST_EVALUATION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Candidate-ID': candidateId,
          'X-Company-ID': candidate.company_id,
          'X-User-ID': user.id,
          'X-Submission-Time': new Date().toISOString(),
        },
        body: JSON.stringify(submissionData),
      });

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        console.error('Webhook response error:', errorText);
        throw new Error(`Failed to submit test for evaluation: ${webhookResponse.status} ${webhookResponse.statusText}`);
      }

      // Update candidate status in database
      await supabase
        .from('candidates')
        .update({ 
          test_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', candidateId);

      toast({
        title: "Test Submitted Successfully!",
        description: "Your test has been submitted for evaluation. You will be notified of the results.",
      });

      // Refresh the page to show updated status
      window.location.reload();

    } catch (error: any) {
      console.error('Error submitting final test:', error);
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidate Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here are your available assessments.</p>
        </div>

        {/* Final Submission Button */}
        {areAllSectionsCompleted() && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                All Sections Completed!
              </CardTitle>
              <CardDescription>
                You have completed all test sections. Click below to submit your final test for evaluation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleFinalSubmission}
                disabled={isSubmittingFinal}
                className="bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isSubmittingFinal ? "Submitting..." : "Submit Final Test"}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-600">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/candidate-profile')} 
                variant="outline" 
                className="w-full"
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Assessment Sections */}
          {sections.map((section) => {
            const progress = getSectionProgress(section);
            const status = getSectionStatus(section);
            
            return (
              <Card key={section.id} className="col-span-full lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-cyan-600">
                    <Play className="h-5 w-5" />
                    {section.name}
                  </CardTitle>
                  <CardDescription>
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {section.time_limit_minutes} minutes
                    </span>
                    <span>{section.completed_answers} of {section.question_count} questions</span>
                  </div>
                  
                  <Progress value={progress} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <Badge variant={
                      status === 'completed' ? 'default' :
                      status === 'in_progress' ? 'secondary' :
                      status === 'not_started' ? 'outline' : 'destructive'
                    }>
                      {status === 'completed' ? 'Completed' :
                       status === 'in_progress' ? 'In Progress' :
                       status === 'not_started' ? 'Not Started' : 'Not Available'}
                    </Badge>
                    
                    <div className="flex gap-2">
                      {status === 'completed' && canRetrySection(section.id) && (
                        <Button 
                          onClick={() => handleRetryTest(section.id)} 
                          variant="outline" 
                          size="sm"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Retry
                        </Button>
                      )}
                      {(status === 'not_started' || status === 'in_progress') && (
                        <Button 
                          onClick={() => handleStartTest(section.id)} 
                          className="bg-cyan-500 hover:bg-cyan-600"
                          size="sm"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {status === 'not_started' ? 'Start' : 'Continue'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {sections.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No assessments are available yet. Please wait for your tests to be generated.</p>
              </CardContent>
            </Card>
          )}

          {/* Test History */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-600">
                <FileText className="h-5 w-5" />
                Test History
              </CardTitle>
              <CardDescription>
                Your previous test attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testSessions.length > 0 ? (
                <div className="space-y-2">
                  {testSessions.map((session, index) => {
                    const section = sections.find(s => s.id === session.section_id);
                    return (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{section?.name || 'Unknown Section'} - Attempt {session.attempt || index + 1}</span>
                          <p className="text-sm text-gray-500">
                            {session.started_at ? new Date(session.started_at).toLocaleDateString() : 'Not started'}
                          </p>
                        </div>
                        <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                          {session.status || 'In Progress'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No test sessions yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
