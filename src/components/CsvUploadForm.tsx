
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useCompany } from '@/hooks/useCompany';
import { ACTIVE_WEBHOOKS } from '@/config/webhooks';

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
      console.log('=== CSV UPLOAD PROCESS STARTING ===');
      console.log('Using n8n webhook:', ACTIVE_WEBHOOKS.USER_CREATION);
      console.log('Company details:', {
        companyId: company.id,
        companyName: company.name,
        industry: company.industry,
        adminUserId: user.id
      });
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Create FormData with all required fields
      const formData = new FormData();
      
      // Add metadata fields
      formData.append('adminUserId', user.id);
      formData.append('companyId', company.id);
      formData.append('companyName', company.name);
      formData.append('industry', company.industry);
      formData.append('filename', file.name);
      formData.append('batch_id', `BATCH_${Date.now()}`);
      formData.append('timestamp', new Date().toISOString());
      formData.append('action', 'csv_upload');
      
      // Add the binary CSV file
      formData.append('csvFile', file, file.name);
      
      console.log('FormData entries:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      console.log('=== SENDING REQUEST TO N8N WEBHOOK ===');
      
      // Send directly to n8n webhook
      const response = await fetch(ACTIVE_WEBHOOKS.USER_CREATION, {
        method: 'POST',
        body: formData,
        headers: {
          'User-Agent': 'Parikshan-AI/1.0',
        },
        mode: 'cors',
      });

      console.log('N8N webhook response status:', response.status);
      console.log('N8N webhook response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('N8N webhook error:', errorText);
        throw new Error(`N8N webhook failed: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log('N8N webhook raw response:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('N8N webhook response body:', responseData);
      } catch (e) {
        console.log('Response is not JSON, treating as success');
        responseData = { message: responseText, success: true };
      }

      console.log('=== UPLOAD SUCCESSFUL ===');
      
      toast({
        title: "Upload Started",
        description: "CSV file is being processed. Candidates will appear shortly.",
      });

      // Reset form state
      setFile(null);
      const fileInput = document.getElementById('csvFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      console.error('=== CSV UPLOAD ERROR ===');
      console.error('Error details:', error);
      
      let errorMessage = "Failed to upload CSV file";
      if (error.message.includes('Network error')) {
        errorMessage = "Network error - please check your connection and try again";
      } else if (error.message.includes('timeout')) {
        errorMessage = "Request timeout - the server may be busy, please try again";
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
