
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
      // Read CSV content as text
      const reader = new FileReader();
      reader.onload = async (event) => {
        const csvContent = event.target?.result as string;
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast({
            title: "Invalid CSV",
            description: "CSV must contain at least a header and one data row",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Parse CSV header to find column indices
        const header = lines[0].split(',').map(col => col.trim().toLowerCase());
        const nameIndex = header.findIndex(col => col.includes('name'));
        const emailIndex = header.findIndex(col => col.includes('email'));
        const phoneIndex = header.findIndex(col => col.includes('phone'));

        if (nameIndex === -1 || emailIndex === -1) {
          toast({
            title: "Invalid CSV format",
            description: "CSV must contain 'name' and 'email' columns",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        console.log('Processing CSV with columns:', { nameIndex, emailIndex, phoneIndex });

        let successCount = 0;
        let errorCount = 0;

        // Process each candidate row
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map(cell => cell.trim());
          
          if (row.length <= Math.max(nameIndex, emailIndex)) {
            console.warn(`Skipping row ${i}: insufficient columns`);
            continue;
          }

          const candidateData = {
            full_name: row[nameIndex] || '',
            email: row[emailIndex] || '',
            phone: phoneIndex >= 0 && row[phoneIndex] ? row[phoneIndex] : null,
            user_id: profile.id,
            company_id: profile.company_id
          };

          if (!candidateData.full_name || !candidateData.email) {
            console.warn(`Skipping row ${i}: missing required data`);
            continue;
          }

          try {
            console.log(`Creating candidate ${i}:`, candidateData);
            
            const response = await fetch('/api/n8n/create-candidate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${profile.id}`,
              },
              body: JSON.stringify(candidateData),
            });

            if (response.ok) {
              successCount++;
              console.log(`Successfully created candidate: ${candidateData.email}`);
            } else {
              errorCount++;
              console.error(`Failed to create candidate: ${candidateData.email}`);
            }
          } catch (error) {
            errorCount++;
            console.error(`Error creating candidate ${candidateData.email}:`, error);
          }
        }

        toast({
          title: "Upload Complete",
          description: `Successfully processed ${successCount} candidates. ${errorCount > 0 ? `${errorCount} failed.` : ''}`,
          variant: successCount > 0 ? "default" : "destructive",
        });

        setFile(null);
        setPreview([]);
        // Reset the file input
        const fileInput = document.getElementById('csvFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        // Refresh after processing
        if (successCount > 0) {
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      };
      
      reader.readAsText(file);
    } catch (error: any) {
      console.error('Upload error:', error);
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
            <li>CSV parsed and each candidate processed individually</li>
            <li>Candidates are created using existing API endpoint</li>
            <li>AI generates personalized questions for each candidate</li>
            <li>Test credentials are automatically sent to candidates</li>
            <li>Candidates can take their assessments immediately</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default CsvUploadForm;
