
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { User, Play, RotateCcw, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuestions } from '@/hooks/useQuestions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [testSessions, setTestSessions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { questions } = useQuestions(candidateId);

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

        // Get test sessions
        const { data: sessions, error: sessionsError } = await supabase
          .from('test_sessions')
          .select('*')
          .eq('candidate_id', candidate.id);

        if (sessionsError) throw sessionsError;
        setTestSessions(sessions || []);

        // Get answers
        const { data: answersData, error: answersError } = await supabase
          .from('answers')
          .select('*')
          .eq('candidate_id', candidate.id);

        if (answersError) throw answersError;
        setAnswers(answersData || []);

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

  const getTestProgress = () => {
    if (questions.length === 0) return 0;
    return Math.round((answers.length / questions.length) * 100);
  };

  const getTestStatus = () => {
    if (questions.length === 0) return 'pending';
    if (answers.length === 0) return 'not_started';
    if (answers.length < questions.length) return 'in_progress';
    return 'completed';
  };

  const canRetry = () => {
    const completedSessions = testSessions.filter(s => s.status === 'completed');
    return completedSessions.length > 0 && completedSessions.length < 2;
  };

  const handleStartTest = () => {
    if (candidateId) {
      navigate(`/test-section?candidateId=${candidateId}`);
    }
  };

  const handleRetryTest = async () => {
    if (!candidateId) return;

    try {
      // Clear previous answers
      await supabase
        .from('answers')
        .delete()
        .eq('candidate_id', candidateId);

      // Create new test session
      await supabase
        .from('test_sessions')
        .insert({
          candidate_id: candidateId,
          section_id: questions[0]?.section_id,
          attempt: testSessions.length + 1,
        });

      navigate(`/test-section?candidateId=${candidateId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const testStatus = getTestStatus();
  const progress = getTestProgress();

  return (
    <div className="min-h-screen bg-stone-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidate Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your test progress.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Test Progress Card */}
          <Card className="col-span-full lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-600">
                <Play className="h-5 w-5" />
                Test Progress
              </CardTitle>
              <CardDescription>
                Your current progress through the assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-gray-500">{answers.length} of {questions.length} questions</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex items-center gap-2">
                <Badge variant={
                  testStatus === 'completed' ? 'default' :
                  testStatus === 'in_progress' ? 'secondary' :
                  testStatus === 'not_started' ? 'outline' : 'destructive'
                }>
                  {testStatus === 'completed' ? 'Completed' :
                   testStatus === 'in_progress' ? 'In Progress' :
                   testStatus === 'not_started' ? 'Not Started' : 'Pending'}
                </Badge>
                {questions.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {questions.length} questions available
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {testStatus === 'completed' && canRetry() && (
                  <Button onClick={handleRetryTest} variant="outline" className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retry Test
                  </Button>
                )}
                {(testStatus === 'not_started' || testStatus === 'in_progress') && questions.length > 0 && (
                  <Button onClick={handleStartTest} className="flex-1 bg-cyan-500 hover:bg-cyan-600">
                    <Play className="h-4 w-4 mr-2" />
                    {testStatus === 'not_started' ? 'Start Test' : 'Continue Test'}
                  </Button>
                )}
                {questions.length === 0 && (
                  <div className="text-sm text-gray-500 p-4 bg-gray-100 rounded">
                    No questions available yet. Please wait for your test to be generated.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

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

          {/* Results Card */}
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
                  {testSessions.map((session, index) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">Attempt {session.attempt || index + 1}</span>
                        <p className="text-sm text-gray-500">
                          {session.started_at ? new Date(session.started_at).toLocaleDateString() : 'Not started'}
                        </p>
                      </div>
                      <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                        {session.status || 'In Progress'}
                      </Badge>
                    </div>
                  ))}
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
