import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { useCompany } from '@/hooks/useCompany';
import { Upload, FileText, AlertCircle } from 'lucide-react';

const CsvUploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string[]>([]);
  const { toast } = useToast();
  const { profile } = useProfile();
  const { company } = useCompany(profile);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      
      // Show preview of CSV
      const reader = new FileReader();
      reader.onload = (event) => {
        const csv = event.target?.result as string;
        const lines = csv.split('\n').slice(0, 4); // Show first 4 lines
        setPreview(lines);
      };
      reader.readAsText(selectedFile);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      setFile(null);
      setPreview([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.company_id || !company) {
      toast({
        title: "Company not found",
        description: "Please ensure you have a company associated with your profile",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create FormData for binary file upload
      const formData = new FormData();
      formData.append('csvFile', file);
      formData.append('adminUserId', profile.id);
      formData.append('companyId', profile.company_id);
      formData.append('companyName', company.name);
      formData.append('industry', company.industry);
      formData.append('filename', file.name);

      console.log('Uploading CSV with admin details:', {
        adminUserId: profile.id,
        companyId: profile.company_id,
        companyName: company.name,
        industry: company.industry,
        filename: file.name
      });

      // Use the existing API route which will handle the webhook call
      const response = await fetch('/api/n8n/csv-upload', {
        method: 'POST',
        body: formData, // Send as FormData for binary upload
      });

      const result = await response.json();
      console.log('Upload response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      toast({
        title: "Upload Started",
        description: `Processing ${result.candidates_count || 'multiple'} candidates. Questions will be generated automatically.`,
      });

      setFile(null);
      setPreview([]);
      // Reset the file input
      const fileInput = document.getElementById('csvFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Refresh the page after a short delay to show new candidates
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload CSV file",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile?.company_id) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            <p>Company setup required to upload candidates</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Candidates CSV
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="csvFile">CSV File</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-500 mt-1">
              CSV format: full_name, email, phone (optional)
            </p>
          </div>

          {profile && company && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-xs text-blue-600 font-medium">Admin ID</p>
                <p className="text-sm text-blue-800">{profile.id}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium">Company</p>
                <p className="text-sm text-blue-800">{company.name}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium">Industry</p>
                <p className="text-sm text-blue-800">{company.industry}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium">Company ID</p>
                <p className="text-sm text-blue-800">{profile.company_id}</p>
              </div>
            </div>
          )}

          {preview.length > 0 && (
            <div className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Preview:</span>
              </div>
              <div className="text-xs font-mono space-y-1">
                {preview.map((line, index) => (
                  <div key={index} className={index === 0 ? 'font-bold' : ''}>
                    {line.substring(0, 100)}{line.length > 100 ? '...' : ''}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={!file || loading}
            className="w-full bg-cyan-500 hover:bg-cyan-600"
          >
            {loading ? 'Processing...' : 'Upload & Generate Tests'}
          </Button>
        </form>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">What happens next:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>CSV file processed with admin and company details</li>
            <li>Candidates are created from your CSV</li>
            <li>AI generates personalized questions for each candidate</li>
            <li>Test credentials are automatically sent to candidates</li>
            <li>Candidates can take their assessments immediately</li>
          </ol>
          <div className="mt-2 p-2 bg-green-100 rounded text-xs text-green-800">
            <strong>Production Webhook:</strong> https://n8n.erudites.in/webhook-test/usercreation
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CsvUploadForm;