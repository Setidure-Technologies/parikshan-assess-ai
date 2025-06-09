
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Users, FileText, BarChart3, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && userRole) {
      if (userRole === 'admin') {
        navigate("/admin-dashboard");
      } else {
        navigate("/candidate-dashboard");
      }
    }
  }, [user, userRole, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur shadow-sm border-b border-cyan-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-cyan-600" />
              <span className="text-2xl font-bold text-gray-900">Parikshan AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline" className="border-cyan-200 hover:bg-cyan-50">
                  Sign In
                </Button>
              </Link>
              <Link to="/login">
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Test Automation Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your recruitment process with intelligent assessments, 
            automated candidate evaluation, and comprehensive analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-lg px-8 py-3">
                Start Testing Today
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-cyan-200 hover:bg-cyan-50 text-lg px-8 py-3">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Powerful Features for Modern Recruitment
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-cyan-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-cyan-600 mb-4" />
                <CardTitle>Role-Based Access</CardTitle>
                <CardDescription>
                  Separate dashboards for admins and candidates with tailored experiences
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-cyan-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-12 w-12 text-cyan-600 mb-4" />
                <CardTitle>CSV Upload & Auto-Generation</CardTitle>
                <CardDescription>
                  Upload candidate lists and automatically generate login credentials
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-cyan-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Brain className="h-12 w-12 text-cyan-600 mb-4" />
                <CardTitle>Dynamic Test Generation</CardTitle>
                <CardDescription>
                  AI-powered question generation with multiple assessment types
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-cyan-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-cyan-600 mb-4" />
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>
                  Comprehensive reporting and insights on candidate performance
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-cyan-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-cyan-600 mb-4" />
                <CardTitle>Secure & Compliant</CardTitle>
                <CardDescription>
                  Enterprise-grade security with data protection compliance
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-cyan-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="h-12 w-12 text-cyan-600 mb-4" />
                <CardTitle>Real-time Monitoring</CardTitle>
                <CardDescription>
                  Live test monitoring with anti-cheating measures
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Assessment Types */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Comprehensive Assessment Suite
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center border-cyan-200">
              <CardHeader>
                <CardTitle className="text-cyan-700">Psychometric Assessment</CardTitle>
                <CardDescription>
                  Personality traits, behavioral patterns, and cognitive abilities
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-cyan-200">
              <CardHeader>
                <CardTitle className="text-cyan-700">Language Skills</CardTitle>
                <CardDescription>
                  Communication proficiency and written expression evaluation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-cyan-200">
              <CardHeader>
                <CardTitle className="text-cyan-700">Situational Judgment</CardTitle>
                <CardDescription>
                  Problem-solving scenarios and decision-making assessment
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-cyan-200">
              <CardHeader>
                <CardTitle className="text-cyan-700">Technical Assessment</CardTitle>
                <CardDescription>
                  Role-specific technical skills and domain expertise
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-600 to-cyan-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Recruitment Process?
          </h2>
          <p className="text-xl text-cyan-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of companies using Parikshan AI to make smarter hiring decisions.
          </p>
          <Link to="/login">
            <Button size="lg" variant="secondary" className="bg-white text-cyan-700 hover:bg-gray-50 text-lg px-8 py-3">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Brain className="h-8 w-8 text-cyan-400" />
            <span className="text-2xl font-bold">Parikshan AI</span>
          </div>
          <div className="text-center text-gray-400">
            <p>&copy; 2024 Parikshan AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
