
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

  const sendToN8nWebhook = async (csvData: CsvRow[], companyId: string) => {
    const webhookUrl = process.env.VITE_N8N_WEBHOOK_URL || 'YOUR_N8N_WEBHOOK_URL_HERE';
    
    if (!webhookUrl || webhookUrl === 'YOUR_N8N_WEBHOOK_URL_HERE') {
      throw new Error('N8N webhook URL is not configured');
    }

    const payload = {
      company: {
        id: companyId,
        name: companyData.name,
        email: companyData.email,
        industry: companyData.industry
      },
      candidates: csvData,
      admin_user_id: user?.id
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`);
    }

    return response.json();
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
      // Parse CSV file
      const csvData = await parseCsv(csvFile);
      
      if (csvData.length === 0) {
        throw new Error('No valid candidate data found in CSV');
      }

      // Create or get company
      const companyId = await createCompanyIfNotExists();

      // Send to n8n webhook
      await sendToN8nWebhook(csvData, companyId);

      setUploadStatus('success');
      toast({
        title: "Upload Successful",
        description: `Processing ${csvData.length} candidates. Users will be created automatically via your n8n workflow.`,
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
