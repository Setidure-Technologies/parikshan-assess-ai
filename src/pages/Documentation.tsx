
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, BookOpen, Users, BarChart3, Settings, Upload, Download, Webhook, Shield } from "lucide-react";

const Documentation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "Platform Overview", icon: <BookOpen className="h-4 w-4" /> },
    { id: "getting-started", title: "Getting Started", icon: <Users className="h-4 w-4" /> },
    { id: "admin-dashboard", title: "Admin Dashboard", icon: <Settings className="h-4 w-4" /> },
    { id: "candidate-management", title: "Candidate Management", icon: <Users className="h-4 w-4" /> },
    { id: "test-creation", title: "Test Creation & AI", icon: <BookOpen className="h-4 w-4" /> },
    { id: "reporting", title: "Reporting & Analytics", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "integrations", title: "Integrations", icon: <Webhook className="h-4 w-4" /> },
    { id: "security", title: "Security & Compliance", icon: <Shield className="h-4 w-4" /> }
  ];

  const content = {
    overview: {
      title: "Platform Overview",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-gray-700">
            Parikshan AI is an AI-powered assessment platform designed to streamline your hiring process through intelligent question generation, automated candidate management, and comprehensive analytics.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-cyan-600" />
                  For HR Teams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Reduce time-to-hire by 60%</li>
                  <li>• Improve candidate quality by 40%</li>
                  <li>• Automate repetitive tasks</li>
                  <li>• Get actionable insights</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-cyan-600" />
                  Key Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• AI-generated personalized questions</li>
                  <li>• Automated candidate onboarding</li>
                  <li>• Real-time progress tracking</li>
                  <li>• Comprehensive reporting</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    "getting-started": {
      title: "Getting Started",
      content: (
        <div className="space-y-6">
          <div className="bg-cyan-50 p-4 rounded-lg">
            <h3 className="font-semibold text-cyan-900 mb-2">Quick Setup Guide</h3>
            <p className="text-cyan-800">Follow these steps to get your assessment platform up and running in minutes.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Badge className="bg-cyan-100 text-cyan-700 px-3 py-1">1</Badge>
              <div>
                <h4 className="font-semibold">Account Setup</h4>
                <p className="text-gray-600">Contact our sales team to create your organization account and set up billing.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Badge className="bg-cyan-100 text-cyan-700 px-3 py-1">2</Badge>
              <div>
                <h4 className="font-semibold">Company Profile</h4>
                <p className="text-gray-600">Complete your company profile with industry information and hiring requirements.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Badge className="bg-cyan-100 text-cyan-700 px-3 py-1">3</Badge>
              <div>
                <h4 className="font-semibold">Upload Candidates</h4>
                <p className="text-gray-600">Use our CSV upload feature to bulk import candidate data and profiles.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Badge className="bg-cyan-100 text-cyan-700 px-3 py-1">4</Badge>
              <div>
                <h4 className="font-semibold">Generate Tests</h4>
                <p className="text-gray-600">Our AI automatically creates personalized assessment questions for each candidate.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Badge className="bg-cyan-100 text-cyan-700 px-3 py-1">5</Badge>
              <div>
                <h4 className="font-semibold">Deploy Assessments</h4>
                <p className="text-gray-600">Candidates receive login credentials and can access their personalized tests.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    "admin-dashboard": {
      title: "Admin Dashboard Guide",
      content: (
        <div className="space-y-6">
          <p className="text-gray-700">
            The admin dashboard is your central control panel for managing candidates, monitoring progress, and accessing reports.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Dashboard Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Automation Pipeline Status</h4>
                <p className="text-gray-600 mb-3">Track the progress of your hiring automation:</p>
                <ul className="space-y-1 text-gray-600 ml-4">
                  <li>• CSV Upload - Bulk candidate data import</li>
                  <li>• Question Generation - AI creates personalized tests</li>
                  <li>• Credential Creation - Automatic account setup</li>
                  <li>• Test Deployment - Candidates can access tests</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Company Statistics</h4>
                <p className="text-gray-600">View real-time metrics including total candidates, active tests, completion rates, and pending evaluations.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <Upload className="h-6 w-6 text-cyan-600 mb-2" />
                  <h4 className="font-semibold">CSV Upload</h4>
                  <p className="text-sm text-gray-600">Bulk import candidate data with our template</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Users className="h-6 w-6 text-cyan-600 mb-2" />
                  <h4 className="font-semibold">Manage Candidates</h4>
                  <p className="text-sm text-gray-600">View, edit, and track candidate progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    "candidate-management": {
      title: "Candidate Management",
      content: (
        <div className="space-y-6">
          <p className="text-gray-700">
            Efficiently manage your candidate pipeline with automated tools and comprehensive tracking.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>CSV Upload Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Required Fields</h4>
                <ul className="space-y-1 text-gray-600 ml-4">
                  <li>• Full Name (required)</li>
                  <li>• Email Address (required)</li>
                  <li>• Phone Number (optional)</li>
                  <li>• Position/Role (optional)</li>
                  <li>• Experience Level (optional)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Automated Processing</h4>
                <p className="text-gray-600">Once uploaded, our system automatically:</p>
                <ul className="space-y-1 text-gray-600 ml-4">
                  <li>• Creates user accounts for each candidate</li>
                  <li>• Generates personalized assessment questions</li>
                  <li>• Sends login credentials via email</li>
                  <li>• Sets up progress tracking</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Candidate Status Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Pending</Badge>
                  <span className="text-gray-600">Account created, questions not generated yet</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-100 text-blue-700">Questions Generated</Badge>
                  <span className="text-gray-600">Personalized test ready, credentials sent</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-yellow-100 text-yellow-700">In Progress</Badge>
                  <span className="text-gray-600">Candidate has started the assessment</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-100 text-green-700">Completed</Badge>
                  <span className="text-gray-600">All sections finished, ready for evaluation</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-purple-100 text-purple-700">Submitted</Badge>
                  <span className="text-gray-600">Final evaluation completed, report available</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    "test-creation": {
      title: "Test Creation & AI Features",
      content: (
        <div className="space-y-6">
          <p className="text-gray-700">
            Our AI engine creates personalized assessment questions tailored to each candidate's background and the specific role requirements.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>AI Question Generation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Question Types</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-1 text-gray-600">
                    <li>• Multiple Choice Questions (MCQ)</li>
                    <li>• True/False Questions</li>
                    <li>• Likert Scale Assessments</li>
                  </ul>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Situational Judgment Tests (SJT)</li>
                    <li>• Open-ended Questions</li>
                    <li>• Forced Choice Questions</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Personalization Factors</h4>
                <p className="text-gray-600">Questions are customized based on:</p>
                <ul className="space-y-1 text-gray-600 ml-4">
                  <li>• Candidate's experience level and background</li>
                  <li>• Industry-specific requirements</li>
                  <li>• Role and position requirements</li>
                  <li>• Company culture and values</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assessment Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Tests are organized into multiple sections, each focusing on different competencies:</p>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold">Technical Skills</h4>
                  <p className="text-sm text-gray-600">Role-specific technical competencies and knowledge</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold">Behavioral Assessment</h4>
                  <p className="text-sm text-gray-600">Personality traits and work style preferences</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold">Cognitive Abilities</h4>
                  <p className="text-sm text-gray-600">Problem-solving and analytical thinking skills</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    "reporting": {
      title: "Reporting & Analytics",
      content: (
        <div className="space-y-6">
          <p className="text-gray-700">
            Get comprehensive insights into candidate performance with detailed reports and analytics.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Evaluation Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Automated Scoring</h4>
                <p className="text-gray-600">Our AI evaluates responses and provides:</p>
                <ul className="space-y-1 text-gray-600 ml-4">
                  <li>• Overall competency score (0-100)</li>
                  <li>• Section-wise performance breakdown</li>
                  <li>• Strengths and improvement areas</li>
                  <li>• Comparative ranking against other candidates</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">PDF Reports</h4>
                <p className="text-gray-600">Downloadable comprehensive reports include:</p>
                <ul className="space-y-1 text-gray-600 ml-4">
                  <li>• Executive summary with key insights</li>
                  <li>• Detailed section analysis</li>
                  <li>• Response patterns and trends</li>
                  <li>• Hiring recommendations</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <BarChart3 className="h-6 w-6 text-cyan-600 mb-2" />
                  <h4 className="font-semibold">Performance Metrics</h4>
                  <p className="text-sm text-gray-600">Track completion rates, average scores, and time-to-complete</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Download className="h-6 w-6 text-cyan-600 mb-2" />
                  <h4 className="font-semibold">Export Options</h4>
                  <p className="text-sm text-gray-600">Download reports in PDF, Excel, or CSV formats</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    "integrations": {
      title: "Integrations & Webhooks",
      content: (
        <div className="space-y-6">
          <p className="text-gray-700">
            Connect TestGen Pro with your existing HR tools and systems for seamless workflow integration.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Webhook Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Available Webhooks</h4>
                <ul className="space-y-1 text-gray-600 ml-4">
                  <li>• Test completion notifications</li>
                  <li>• Candidate progress updates</li>
                  <li>• Evaluation results delivery</li>
                  <li>• Score threshold alerts</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Configuration</h4>
                <p className="text-gray-600">Set up webhooks in your admin dashboard:</p>
                <ul className="space-y-1 text-gray-600 ml-4">
                  <li>• Configure endpoint URLs</li>
                  <li>• Set authentication headers</li>
                  <li>• Choose event triggers</li>
                  <li>• Test webhook delivery</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Enterprise plans include REST API access for custom integrations:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">API Endpoints</h4>
                <ul className="space-y-1 text-gray-600 text-sm">
                  <li>• GET /api/candidates - List all candidates</li>
                  <li>• POST /api/candidates - Create new candidate</li>
                  <li>• GET /api/evaluations/[candidateId] - Get evaluation results</li>
                  <li>• GET /api/reports/[candidateId] - Download PDF report</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    "security": {
      title: "Security & Compliance",
      content: (
        <div className="space-y-6">
          <p className="text-gray-700">
            TestGen Pro implements enterprise-grade security measures to protect your data and ensure compliance.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Data Protection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Encryption</h4>
                <ul className="space-y-1 text-gray-600 ml-4">
                  <li>• End-to-end encryption for all data transmission</li>
                  <li>• AES-256 encryption for data at rest</li>
                  <li>• Secure key management practices</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Access Control</h4>
                <ul className="space-y-1 text-gray-600 ml-4">
                  <li>• Role-based access control (RBAC)</li>
                  <li>• Multi-factor authentication (MFA)</li>
                  <li>• Session management and timeout</li>
                  <li>• Audit logging for all actions</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Standards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <Shield className="h-6 w-6 text-cyan-600 mb-2" />
                  <h4 className="font-semibold">GDPR Compliant</h4>
                  <p className="text-sm text-gray-600">Full compliance with European data protection regulations</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Shield className="h-6 w-6 text-cyan-600 mb-2" />
                  <h4 className="font-semibold">SOC 2 Type II</h4>
                  <p className="text-sm text-gray-600">Certified security controls and procedures</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="https://raw.githubusercontent.com/Setidure-Technologies/parikshan-assess-ai/main/Peop360_Primary%20Logo.png" 
                alt="Parikshan AI" 
                className="h-10 w-auto"
              />
              <span className="text-2xl font-bold text-gray-900">Parikshan AI</span>
            </Link>
            <Link to="/">
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Documentation
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Complete guide to using Parikshan AI for your hiring needs
            </p>
            
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Contents</CardTitle>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-2">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-2 ${
                          activeSection === section.id
                            ? 'bg-cyan-100 text-cyan-700 font-medium'
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        {section.icon}
                        <span className="text-sm">{section.title}</span>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-2xl">{content[activeSection as keyof typeof content].title}</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-gray max-w-none">
                  {content[activeSection as keyof typeof content].content}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
