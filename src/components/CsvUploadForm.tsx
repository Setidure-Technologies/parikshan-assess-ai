
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';
import { ACTIVE_WEBHOOKS } from '@/config/webhooks';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useCompany } from '@/hooks/useCompany';

const CsvUploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { company } = useCompany(profile);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a CSV file",
        variant: "destructive",
      });
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

    if (!user || !profile || !company) {
      toast({
        title: "Authentication required",
        description: "Please log in and ensure company details are available",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Starting CSV upload process...');
      console.log('Company details:', {
        companyId: company.id,
        companyName: company.name,
        industry: company.industry,
        adminUserId: user.id
      });
      
      // Create FormData for n8n webhook with binary file
      const formData = new FormData();
      
      // Add all required fields for n8n workflow
      formData.append('adminUserId', user.id);
      formData.append('companyId', company.id);
      formData.append('companyName', company.name);
      formData.append('industry', company.industry);
      formData.append('filename', file.name);
      formData.append('batch_id', `BATCH_${Date.now()}`);
      formData.append('action', 'csv_upload');
      
      // Add the CSV file as binary data - this is crucial for n8n to receive it properly
      formData.append('file', file, file.name);

      console.log('FormData prepared with binary file:', {
        adminUserId: user.id,
        companyId: company.id,
        companyName: company.name,
        industry: company.industry,
        filename: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // Send POST request directly to n8n webhook
      console.log('Sending POST request to:', ACTIVE_WEBHOOKS.USER_CREATION);
      
      const response = await fetch(ACTIVE_WEBHOOKS.USER_CREATION, {
        method: 'POST', // Explicitly ensure POST method
        body: formData, // Send FormData with binary file
        headers: {
          'User-Agent': 'Parikshan-AI/1.0',
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
        mode: 'cors',
      });

      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('N8N webhook error:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // Handle successful response
      const result = await response.text();
      console.log('N8N webhook success:', result);

      toast({
        title: "Upload Started",
        description: "CSV file is being processed. Candidates will appear shortly.",
      });

      // Reset form state
      setFile(null);
      const fileInput = document.getElementById('csvFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      console.error('CSV Upload Error:', error);
      
      let errorMessage = "Failed to upload CSV file";
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = "Network error - please check your connection and try again";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Candidates CSV
        </CardTitle>
      </CardHeader>
      <CardContent>
        {company && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Company:</strong> {company.name} ({company.industry})
            </p>
          </div>
        )}
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
              CSV should contain: full_name, email, phone (optional)
            </p>
          </div>
          <Button 
            type="submit" 
            disabled={!file || loading || !company}
            className="w-full bg-cyan-500 hover:bg-cyan-600"
          >
            {loading ? 'Uploading...' : 'Upload CSV'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CsvUploadForm;
