import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, FileText, Brain, MessageSquare } from 'lucide-react';
import { useTestLibrary, TestLibraryItem, TestConfiguration } from '@/hooks/useTestLibrary';
import { Separator } from '@/components/ui/separator';

interface TestSelectionWizardProps {
  onConfigurationChange: (config: TestConfiguration) => void;
  configuration: TestConfiguration;
}

export const TestSelectionWizard: React.FC<TestSelectionWizardProps> = ({
  onConfigurationChange,
  configuration
}) => {
  const { testLibrary, loading, getTestsByCategory, calculateTotalDuration, calculateTotalQuestions } = useTestLibrary();
  const [customInstructions, setCustomInstructions] = useState(configuration.customInstructions || '');

  const psychometricTests = getTestsByCategory('psychometric');
  const englishTests = getTestsByCategory('english');

  const handleTestSelection = (test: TestLibraryItem, checked: boolean) => {
    const updatedTests = checked
      ? [...configuration.selectedTests, test]
      : configuration.selectedTests.filter(t => t.id !== test.id);

    onConfigurationChange({
      ...configuration,
      selectedTests: updatedTests,
    });
  };

  const handleModeChange = (mode: 'pre-built' | 'ai-generated' | 'hybrid') => {
    onConfigurationChange({
      ...configuration,
      testMode: mode,
    });
  };

  const handleCustomInstructionsChange = (instructions: string) => {
    setCustomInstructions(instructions);
    onConfigurationChange({
      ...configuration,
      customInstructions: instructions,
    });
  };

  const isTestSelected = (testId: string) => {
    return configuration.selectedTests.some(test => test.id === testId);
  };

  if (loading) {
    return <div className="animate-pulse">Loading test library...</div>;
  }

  const totalDuration = calculateTotalDuration(configuration.selectedTests);
  const totalQuestions = calculateTotalQuestions(configuration.selectedTests);

  return (
    <div className="space-y-6">
      {/* Test Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Test Generation Mode
          </CardTitle>
          <CardDescription>
            Choose how you want to generate tests for candidates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={configuration.testMode}
            onValueChange={handleModeChange}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
              <RadioGroupItem value="pre-built" id="pre-built" />
              <Label htmlFor="pre-built" className="cursor-pointer flex-1">
                <div className="font-medium">Pre-built Tests</div>
                <div className="text-sm text-muted-foreground">Use standardized test templates</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
              <RadioGroupItem value="ai-generated" id="ai-generated" />
              <Label htmlFor="ai-generated" className="cursor-pointer flex-1">
                <div className="font-medium">AI Generated</div>
                <div className="text-sm text-muted-foreground">Custom tests based on candidate profile</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
              <RadioGroupItem value="hybrid" id="hybrid" />
              <Label htmlFor="hybrid" className="cursor-pointer flex-1">
                <div className="font-medium">Hybrid</div>
                <div className="text-sm text-muted-foreground">Combine pre-built with AI customization</div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Test Selection */}
      {(configuration.testMode === 'pre-built' || configuration.testMode === 'hybrid') && (
        <>
          {/* Psychometric Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Psychometric Assessments
              </CardTitle>
              <CardDescription>
                Select psychological and behavioral assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {psychometricTests.map((test) => (
                  <div
                    key={test.id}
                    className={`flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                      isTestSelected(test.id) ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <Checkbox
                      id={test.id}
                      checked={isTestSelected(test.id)}
                      onCheckedChange={(checked) => handleTestSelection(test, checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={test.id} className="cursor-pointer font-medium">
                        {test.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">{test.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {test.duration_minutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {test.question_count} questions
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {test.sub_category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* English Communication Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                English Communication Tests
              </CardTitle>
              <CardDescription>
                Select language and communication assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {englishTests.map((test) => (
                  <div
                    key={test.id}
                    className={`flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                      isTestSelected(test.id) ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <Checkbox
                      id={test.id}
                      checked={isTestSelected(test.id)}
                      onCheckedChange={(checked) => handleTestSelection(test, checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={test.id} className="cursor-pointer font-medium">
                        {test.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">{test.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {test.duration_minutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {test.question_count} questions
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {test.sub_category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Custom Instructions for AI */}
      {(configuration.testMode === 'ai-generated' || configuration.testMode === 'hybrid') && (
        <Card>
          <CardHeader>
            <CardTitle>Custom Instructions (Optional)</CardTitle>
            <CardDescription>
              Provide specific instructions for AI test generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., Focus on leadership skills for management roles, include industry-specific scenarios..."
              value={customInstructions}
              onChange={(e) => handleCustomInstructionsChange(e.target.value)}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {configuration.selectedTests.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">Test Configuration Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{configuration.selectedTests.length}</div>
                <div className="text-sm text-muted-foreground">Selected Tests</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{totalDuration}</div>
                <div className="text-sm text-muted-foreground">Total Minutes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Total Questions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{configuration.testMode}</div>
                <div className="text-sm text-muted-foreground">Generation Mode</div>
              </div>
            </div>
            
            {configuration.selectedTests.length > 0 && (
              <>
                <Separator className="my-4" />
                <div>
                  <h4 className="font-medium mb-2">Selected Tests:</h4>
                  <div className="flex flex-wrap gap-2">
                    {configuration.selectedTests.map((test) => (
                      <Badge key={test.id} variant="outline">
                        {test.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};