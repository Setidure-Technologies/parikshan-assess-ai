
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Users, TrendingUp, Shield, Clock, BarChart3, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [selectedPlan, setSelectedPlan] = useState<'startup' | 'enterprise'>('startup');

  const plans = [
    {
      id: 'startup',
      name: 'Startup Plan',
      price: '₹100',
      unit: 'per user',
      tests: '1,000',
      features: [
        'Up to 1,000 AI-generated test questions',
        'Basic candidate management',
        'Standard reporting dashboard',
        'CSV candidate upload',
        'Email support',
        'Basic analytics'
      ],
      popular: false
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: '₹92',
      unit: 'per user',
      tests: '5,000+',
      features: [
        '5,000+ AI-generated test questions',
        'Advanced candidate management',
        'Comprehensive reporting & analytics',
        'Bulk candidate operations',
        'Priority support & dedicated manager',
        'Custom integrations & webhooks',
        'Advanced scoring algorithms',
        'White-label options'
      ],
      popular: true
    }
  ];

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "AI-Powered Question Generation",
      description: "Automatically generate personalized assessment questions tailored to each candidate's background and role requirements."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Automated Candidate Management",
      description: "Streamline your hiring process with automated account creation, test deployment, and progress tracking."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Comprehensive Analytics",
      description: "Get detailed insights into candidate performance with section-wise scoring and downloadable PDF reports."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Enterprise Security",
      description: "Bank-grade security with role-based access control and secure data management."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "HR Director",
      company: "TechCorp Solutions",
      content: "This platform revolutionized our hiring process. We reduced time-to-hire by 60% while improving candidate quality.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Talent Acquisition Lead",
      company: "InnovateX",
      content: "The AI-generated questions are incredibly relevant. We've seen a 40% improvement in candidate assessment accuracy.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100/20">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="https://raw.githubusercontent.com/Setidure-Technologies/parikshan-assess-ai/main/Peop360_Primary%20Logo.png" 
                alt="Parikshan AI" 
                className="h-10 w-auto"
              />
              <span className="text-2xl font-bold text-gray-900">Parikshan AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#pricing" className="text-gray-600 hover:text-primary transition-colors">Pricing</a>
              <Link to="/documentation" className="text-gray-600 hover:text-primary transition-colors">Documentation</Link>
              <Link to="/contact" className="text-gray-600 hover:text-primary transition-colors">Contact</Link>
              <Link to="/login">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Sign In
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30">
            AI-Powered Assessment Platform
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Transform Your Hiring Process with AI
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Generate personalized assessment questions, automate candidate management, and make data-driven hiring decisions with our enterprise-grade AI platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-3">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Why Choose Parikshan AI?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform streamlines every aspect of your assessment process, from question generation to candidate evaluation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center text-white mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your organization's needs. All plans include our core AI features.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? 'border-2 border-primary shadow-xl' : 'border shadow-lg'}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <span className="text-4xl font-bold text-primary">{plan.price}</span>
                    <span className="text-gray-600">{plan.unit}</span>
                  </div>
                  <CardDescription className="text-lg">
                    Up to {plan.tests} test generations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/contact" className="w-full">
                    <Button 
                      className={`w-full ${plan.popular 
                        ? 'bg-primary hover:bg-primary/90' 
                        : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                    >
                      Contact Sales
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Trusted by Leading Organizations
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-gray-600">{testimonial.role}</p>
                    <p className="text-primary font-medium">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of companies using AI to make better hiring decisions faster.
          </p>
          <Link to="/contact">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 px-8 py-3">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="https://raw.githubusercontent.com/Setidure-Technologies/parikshan-assess-ai/main/Peop360_Primary%20Logo.png" 
                  alt="Parikshan AI" 
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold">Parikshan AI</span>
              </div>
              <p className="text-gray-400">
                AI-powered assessment platform for modern hiring teams.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link to="/documentation" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><a href="mailto:support@parikshan.ai" className="hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Parikshan AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
