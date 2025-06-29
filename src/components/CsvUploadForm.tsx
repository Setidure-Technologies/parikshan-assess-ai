
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

const CsvUploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useProfile();

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

    if (!user || !profile) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload CSV files",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Starting CSV upload process...');
      
      // Create FormData for n8n webhook
      const formData = new FormData();
      
      // Add required fields for n8n
      formData.append('adminUserId', user.id);
      formData.append('companyId', profile.company_id || '');
      formData.append('companyName', ''); // Will be filled by n8n from company_id
      formData.append('industry', '');    // Will be filled by n8n from company_id
      formData.append('filename', file.name);
      formData.append('batch_id', `BATCH_${Date.now()}`);
      
      // Add the CSV file
      formData.append('csvFile', file);

      console.log('Sending to n8n webhook:', ACTIVE_WEBHOOKS.USER_CREATION);
      console.log('Form data prepared:', {
        adminUserId: user.id,
        companyId: profile.company_id,
        filename: file.name,
        fileSize: file.size
      });

      // Send directly to n8n webhook
      const response = await fetch(ACTIVE_WEBHOOKS.USER_CREATION, {
        method: 'POST',
        body: formData,
        headers: {
          'User-Agent': 'Parikshan-AI/1.0',
        },
      });

      console.log('N8N Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('N8N Error:', response.status, errorText);
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.text();
      console.log('N8N Success Response:', result);

      toast({
        title: "Upload Started",
        description: "CSV file is being processed. Candidates will appear shortly.",
      });

      setFile(null);
      // Reset the file input
      const fileInput = document.getElementById('csvFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      console.error('CSV Upload Error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload CSV file",
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
            disabled={!file || loading}
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
