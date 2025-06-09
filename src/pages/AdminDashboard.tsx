
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Brain, Upload, Users, Building, FileText, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock data - replace with actual Supabase queries
  const companyData = {
    name: "TechCorp Solutions",
    industry: "Information Technology",
    email: "admin@techcorp.com"
  };

  const candidatesData = [
    { id: 1, name: "John Doe", email: "john@test.com", phone: "+1234567890", status: "Questions Generated" },
    { id: 2, name: "Jane Smith", email: "jane@test.com", phone: "+1234567891", status: "Test Completed" },
    { id: 3, name: "Mike Johnson", email: "mike@test.com", phone: "+1234567892", status: "Pending" },
    { id: 4, name: "Sarah Wilson", email: "sarah@test.com", phone: "+1234567893", status: "Questions Generated" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid CSV file",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    // Simulate upload process - replace with actual CSV processing
    setTimeout(() => {
      toast({
        title: "Upload Successful",
        description: "Candidates uploaded successfully. Credentials are being generated...",
      });
      setCsvFile(null);
      setIsUploading(false);
    }, 2000);
  };

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge variant="secondary">{status}</Badge>;
      case "Questions Generated":
        return <Badge variant="default" className="bg-blue-600">{status}</Badge>;
      case "Test Completed":
        return <Badge variant="default" className="bg-green-600">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Parikshan AI</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, Administrator</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage candidates and monitor test progress</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Company Details */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Company Details</CardTitle>
              <Building className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Company Name</p>
                  <p className="font-medium">{companyData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Industry</p>
                  <p className="font-medium">{companyData.industry}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{companyData.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
              <Users className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{candidatesData.length}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tests Completed</CardTitle>
              <FileText className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {candidatesData.filter(c => c.status === "Test Completed").length}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round((candidatesData.filter(c => c.status === "Test Completed").length / candidatesData.length) * 100)}% completion rate
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* CSV Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Candidates</CardTitle>
              <CardDescription>
                Upload a CSV file with candidate information to automatically generate accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csv-file">CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-gray-500">
                    CSV should include: full_name, email, phone columns
                  </p>
                </div>
                {csvFile && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Selected: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                    </p>
                  </div>
                )}
                <Button type="submit" disabled={isUploading || !csvFile} className="w-full">
                  {isUploading ? (
                    "Uploading..."
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Candidates
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Candidate List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Candidates</CardTitle>
              <CardDescription>
                Overview of candidate status and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidatesData.slice(0, 4).map((candidate) => (
                      <TableRow key={candidate.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{candidate.name}</p>
                            <p className="text-sm text-gray-500">{candidate.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(candidate.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button variant="outline" className="w-full">
                  View All Candidates
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
