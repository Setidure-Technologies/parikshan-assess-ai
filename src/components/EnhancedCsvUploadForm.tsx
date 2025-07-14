import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { TestSelectionWizard } from './TestSelectionWizard';
import { TestConfiguration } from '@/hooks/useTestLibrary';

export const EnhancedCsvUploadForm = () => {
  const { toast } = useToast();
  const { profile } = useProfile();
  const [file, setFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'configure' | 'upload' | 'review'>('configure');
  const [testConfiguration, setTestConfiguration] = useState<TestConfiguration>({
    selectedTests: [],
    testMode: 'pre-built',
    customInstructions: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      setCsvPreview([]);
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);

    // Generate preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').slice(0, 5); // Show first 5 lines
      setCsvPreview(lines);
    };
    reader.readAsText(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.company_id) {
      toast({
        title: "Company required",
        description: "Please ensure your profile is associated with a company.",
        variant: "destructive",
      });
      return;
    }

    if (testConfiguration.selectedTests.length === 0 && testConfiguration.testMode !== 'ai-generated') {
      toast({
        title: "No tests selected",
        description: "Please select at least one test or choose AI-generated mode.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('adminUserId', profile.id);
      formData.append('companyId', profile.company_id);
      formData.append('companyName', profile.profile_data?.company_name || 'Unknown Company');
      formData.append('industry', profile.profile_data?.company_industry || 'Unknown Industry');
      formData.append('filename', file.name);
      
      // Add test configuration
      formData.append('testConfiguration', JSON.stringify(testConfiguration));

      const response = await fetch('/api/n8n/csv-upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Upload successful",
          description: `Successfully processed ${result.candidatesProcessed || 'unknown'} candidates with custom test configuration.`,
        });
        
        // Reset form
        setFile(null);
        setCsvPreview([]);
        setTestConfiguration({
          selectedTests: [],
          testMode: 'pre-built',
          customInstructions: '',
        });
        setCurrentStep('configure');
        
        // Reload page after short delay to show updated candidates
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('CSV upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred during upload.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const canProceedToUpload = () => {
    return testConfiguration.selectedTests.length > 0 || testConfiguration.testMode === 'ai-generated';
  };

  const canProceedToReview = () => {
    return file && canProceedToUpload();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Enhanced Candidate Upload
          </CardTitle>
          <CardDescription>
            Configure tests and upload candidate data with advanced test selection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="configure" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configure Tests
              </TabsTrigger>
              <TabsTrigger value="upload" disabled={!canProceedToUpload()} className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload CSV
              </TabsTrigger>
              <TabsTrigger value="review" disabled={!canProceedToReview()} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Review & Submit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="configure" className="space-y-4">
              <TestSelectionWizard
                configuration={testConfiguration}
                onConfigurationChange={setTestConfiguration}
              />
              
              {canProceedToUpload() && (
                <div className="flex justify-end">
                  <Button onClick={() => setCurrentStep('upload')}>
                    Next: Upload CSV
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="csvFile">Select CSV File</Label>
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="mt-1"
                  />
                </div>

                {csvPreview.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">CSV Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-3 rounded text-sm font-mono overflow-x-auto">
                        {csvPreview.map((line, index) => (
                          <div key={index} className="whitespace-nowrap">
                            {line}
                          </div>
                        ))}
                        {csvPreview.length >= 5 && <div className="text-muted-foreground">...</div>}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    CSV should contain columns: full_name, email, phone (optional). 
                    The system will create test sessions based on your configured test selection.
                  </AlertDescription>
                </Alert>

                {file && (
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep('configure')}>
                      Back: Configure Tests
                    </Button>
                    <Button onClick={() => setCurrentStep('review')}>
                      Next: Review & Submit
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="review" className="space-y-4">
              <div className="space-y-6">
                {/* Test Configuration Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Test Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Generation Mode</Label>
                        <Badge variant="outline" className="ml-2">
                          {testConfiguration.testMode}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Selected Tests</Label>
                        <div className="text-sm text-muted-foreground">
                          {testConfiguration.selectedTests.length} tests selected
                        </div>
                      </div>
                    </div>
                    
                    {testConfiguration.selectedTests.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Test Details</Label>
                        <div className="mt-2 space-y-2">
                          {testConfiguration.selectedTests.map((test) => (
                            <div key={test.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                              <span>{test.name}</span>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{test.duration_minutes}min</span>
                                <span>{test.question_count} questions</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {testConfiguration.customInstructions && (
                      <div>
                        <Label className="text-sm font-medium">Custom Instructions</Label>
                        <div className="mt-1 text-sm text-muted-foreground bg-muted p-2 rounded">
                          {testConfiguration.customInstructions}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* File Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>File Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Filename:</span>
                        <span className="text-sm">{file?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Size:</span>
                        <span className="text-sm">{file ? (file.size / 1024).toFixed(1) : 0} KB</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {!profile?.company_id ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your profile is not associated with a company. Please contact support to link your account to a company before uploading candidates.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setCurrentStep('upload')}>
                        Back: Upload CSV
                      </Button>
                      <Button type="submit" disabled={uploading} className="min-w-[120px]">
                        {uploading ? "Processing..." : "Submit & Process"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};