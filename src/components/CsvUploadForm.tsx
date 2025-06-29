
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
      
      // Show preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const csv = event.target?.result as string;
        const lines = csv.split('\n').slice(0, 4);
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
      console.log('Starting CSV upload...', {
        fileName: file.name,
        fileSize: file.size,
        adminUserId: profile.id,
        companyId: profile.company_id,
        companyName: company.name
      });

      const formData = new FormData();
      formData.append('csvFile', file);
      formData.append('adminUserId', profile.id);
      formData.append('companyId', profile.company_id);
      formData.append('companyName', company.name);
      formData.append('industry', company.industry || '');
      formData.append('filename', file.name);

      console.log('Uploading to API...');

      const response = await fetch('/api/csv-upload', {
        method: 'POST',
        body: formData,
      });

      console.log('API Response Status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Success:', result);

      toast({
        title: "Upload Successful",
        description: "CSV processed and candidates will be created shortly",
      });

      // Reset form
      setFile(null);
      setPreview([]);
      const fileInput = document.getElementById('csvFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Refresh after delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to process CSV file",
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
              Format: full_name, email, phone (optional)
            </p>
          </div>

          {profile && company && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded-lg text-sm">
              <div>
                <p className="font-medium text-blue-800">Admin: {profile.id}</p>
              </div>
              <div>
                <p className="font-medium text-blue-800">Company: {company.name}</p>
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
                    {line.substring(0, 80)}{line.length > 80 ? '...' : ''}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={!file || loading}
            className="w-full"
          >
            {loading ? 'Processing...' : 'Upload & Generate Tests'}
          </Button>
        </form>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Process:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>CSV uploaded with company details</li>
            <li>Candidates created from CSV data</li>
            <li>AI generates personalized questions</li>
            <li>Test credentials sent to candidates</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default CsvUploadForm;
