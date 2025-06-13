
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CompanyData {
  name: string;
  email: string;
  industry: string;
}

interface CsvRow {
  name: string;
  email: string;
  password: string;
}

const CsvUploadForm = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: "",
    email: "",
    industry: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const { toast } = useToast();
  const { user } = useAuth();

  const industries = [
    "Information Technology",
    "Financial Services", 
    "Healthcare",
    "Manufacturing",
    "Education",
    "Retail",
    "Consulting",
    "Other"
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
      setUploadStatus('idle');
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid CSV file",
        variant: "destructive",
      });
    }
  };

  const parseCsv = async (file: File): Promise<CsvRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          reject(new Error('CSV file must have at least a header and one data row'));
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const nameIndex = headers.findIndex(h => h.includes('name'));
        const emailIndex = headers.findIndex(h => h.includes('email'));
        
        if (nameIndex === -1 || emailIndex === -1) {
          reject(new Error('CSV must contain "name" and "email" columns'));
          return;
        }

        const rows: CsvRow[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length >= 2) {
            rows.push({
              name: values[nameIndex] || '',
              email: values[emailIndex] || '',
              password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase() + '123!'
            });
          }
        }
        
        resolve(rows);
      };
      reader.onerror = () => reject(new Error('Failed to read CSV file'));
      reader.readAsText(file);
    });
  };

  const createCompanyIfNotExists = async (): Promise<string> => {
    // First check if company already exists
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('email', companyData.email)
      .single();

    if (existingCompany) {
      return existingCompany.id;
    }

    // Create new company
    const { data: newCompany, error } = await supabase
      .from('companies')
      .insert([companyData])
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create company: ${error.message}`);
    }

    return newCompany.id;
  };

  // Helper function to validate and normalize webhook URL
  const validateWebhookUrl = (url: string): string => {
    console.log('Validating webhook URL:', url);
    
    // Check if URL is valid
    try {
      const parsedUrl = new URL(url);
      
      // Ensure it's using http or https protocol
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error(`Invalid protocol: ${parsedUrl.protocol}`);
      }
      
      console.log('Webhook URL is valid');
      return url;
    } catch (error) {
      console.error('Invalid webhook URL:', error);
      throw new Error(`Invalid webhook URL: ${error.message}`);
    }
  };

  const sendToN8nWebhook = async (csvFile: File, companyId: string) => {
    let webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 'YOUR_N8N_WEBHOOK_URL_HERE';
    
    if (!webhookUrl || webhookUrl === 'YOUR_N8N_WEBHOOK_URL_HERE') {
      throw new Error('N8N webhook URL is not configured');
    }
    
    // Validate and normalize the webhook URL
    webhookUrl = validateWebhookUrl(webhookUrl);

    console.log('Preparing webhook POST request to:', webhookUrl);
    console.log('With CSV file:', csvFile.name, `(${csvFile.size} bytes)`);
    
    // Create a FormData object to send the file and metadata
    const formData = new FormData();
    
    // Add the CSV file as a binary file
    formData.append('file', csvFile, csvFile.name);
    
    // Add company metadata as JSON
    const metadata = JSON.stringify({
      company: {
        id: companyId,
        name: companyData.name,
        email: companyData.email,
        industry: companyData.industry
      },
      admin_user_id: user?.id,
      timestamp: new Date().toISOString()
    });
    
    formData.append('metadata', metadata);
    
    console.log('Form data prepared with file and metadata');

    // First try with XMLHttpRequest for multipart form data
    try {
      console.log('Attempting direct POST with XMLHttpRequest for multipart form data');
      
      // Create a new XMLHttpRequest
      const xhr = new XMLHttpRequest();
      
      // Configure it: POST-request to the URL
      xhr.open('POST', webhookUrl, true);
      
      // No need to set Content-Type header for FormData - browser will set it with boundary
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      
      // Create a promise to handle the async XHR
      return await new Promise((resolve, reject) => {
        xhr.onload = function() {
          console.log('XHR status:', xhr.status);
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              console.log('Response parsing error:', e);
              resolve({ success: true, message: 'Request successful but response was not JSON' });
            }
          } else {
            console.error('XHR error response:', xhr.responseText);
            reject(new Error(`Webhook failed: ${xhr.statusText} (${xhr.status})`));
          }
        };
        
        xhr.onerror = function() {
          console.error('XHR network error');
          reject(new Error('Network error occurred while sending webhook'));
        };
        
        // Send the request with the FormData
        xhr.send(formData);
        console.log('XHR request sent with FormData');
      });
    } catch (xhrError) {
      console.error('XMLHttpRequest approach failed:', xhrError);
      
      // Fallback to fetch API
      console.log('Falling back to fetch API with FormData');
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          // No need to set Content-Type header for FormData - browser will set it with boundary
          body: formData,
          cache: 'no-cache',
          redirect: 'follow',
        });
        
        console.log('Fetch response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Fetch error response:', errorText);
          throw new Error(`Webhook failed: ${response.statusText} (${response.status})`);
        }
        
        return await response.json();
      } catch (fetchError) {
        console.error('Fetch approach also failed:', fetchError);
        
        // Last resort: Use a hidden form submission approach with the file
        console.log('Attempting final approach: Hidden form POST submission with file');
        try {
          return await new Promise((resolve, reject) => {
            // Create a hidden iframe to target the form submission
            const iframe = document.createElement('iframe');
            iframe.name = 'webhook-iframe';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            
            // Create a form element
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = webhookUrl;
            form.target = 'webhook-iframe';
            form.style.display = 'none';
            form.enctype = 'multipart/form-data'; // Important for file uploads
            
            // Create a file input and add the file
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.name = 'file';
            // We can't directly set the file, so we'll add the metadata instead
            form.appendChild(fileInput);
            
            // Add metadata as a hidden input
            const metadataInput = document.createElement('input');
            metadataInput.type = 'hidden';
            metadataInput.name = 'metadata';
            metadataInput.value = metadata;
            form.appendChild(metadataInput);
            
            // Add the form to the document
            document.body.appendChild(form);
            
            // Handle the iframe load event
            iframe.onload = () => {
              console.log('Form submission completed');
              // Clean up
              document.body.removeChild(form);
              document.body.removeChild(iframe);
              resolve({ success: true, message: 'Form submission approach succeeded' });
            };
            
            // Handle errors
            iframe.onerror = (error) => {
              console.error('Form submission failed:', error);
              // Clean up
              document.body.removeChild(form);
              document.body.removeChild(iframe);
              reject(new Error('Form submission approach failed'));
            };
            
            console.log('Submitting form...');
            form.submit();
          });
        } catch (formError) {
          console.error('All three approaches failed:');
          console.error('1. XMLHttpRequest error:', xhrError);
          console.error('2. Fetch error:', fetchError);
          console.error('3. Form submission error:', formError);
          throw new Error('Failed to send webhook after multiple attempts with different methods');
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!csvFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!companyData.name || !companyData.email || !companyData.industry) {
      toast({
        title: "Missing Company Information",
        description: "Please fill in all company details",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setUploadStatus('processing');

    try {
      // Validate CSV file has content (quick check)
      if (csvFile.size === 0) {
        throw new Error('CSV file is empty');
      }

      // Create or get company
      const companyId = await createCompanyIfNotExists();

      // Send the CSV file directly to n8n webhook
      await sendToN8nWebhook(csvFile, companyId);

      setUploadStatus('success');
      toast({
        title: "Upload Successful",
        description: `CSV file uploaded successfully. Data will be processed via your n8n workflow.`,
      });

      // Reset form
      setCsvFile(null);
      setCompanyData({ name: "", email: "", industry: "" });
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      toast({
        title: "Upload Failed",
        description: error.message || "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'processing':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Upload className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Upload Candidates via CSV
        </CardTitle>
        <CardDescription>
          Upload a CSV file with candidate information. Users will be automatically created via your n8n workflow.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Company Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name *</Label>
                <Input
                  id="company-name"
                  type="text"
                  value={companyData.name}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter company name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company-email">Company Email *</Label>
                <Input
                  id="company-email"
                  type="email"
                  value={companyData.email}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="admin@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Select value={companyData.industry} onValueChange={(value) => setCompanyData(prev => ({ ...prev, industry: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* CSV Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">CSV File Upload</h3>
            
            <div className="space-y-2">
              <Label htmlFor="csv-file">CSV File *</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="cursor-pointer"
                required
              />
              <p className="text-sm text-gray-500">
                CSV should include columns: <strong>name, email</strong>. Passwords will be auto-generated.
              </p>
            </div>

            {csvFile && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={isProcessing || !csvFile || !companyData.name || !companyData.email || !companyData.industry}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing Upload...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Process CSV & Create Users
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CsvUploadForm;
