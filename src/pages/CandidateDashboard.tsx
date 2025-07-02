
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { User, Play, RotateCcw, FileText, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Section {
  id: string;
  name: string;
  description: string;
  time_limit_minutes: number;
  question_count: number;
  answered_count: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidate Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your test progress.</p>
        </div>

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

          {/* Sections Cards */}
          {sections.map((section) => (
            <Card key={section.id} className="col-span-full lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-600">
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
                      className="flex-1 bg-cyan-500 hover:bg-cyan-600"
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
      </div>
    </div>
  );
};

export default CandidateDashboard;
