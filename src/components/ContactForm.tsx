
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ContactForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    company_size: "",
    industry: "",
    preferred_plan: "",
    additional_notes: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_requests')
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Request Submitted Successfully!",
        description: "Thank you for your interest. Our sales team will contact you within 24 hours.",
      });

      // Reset form
      setFormData({
        company_name: "",
        contact_person: "",
        email: "",
        phone: "",
        company_size: "",
        industry: "",
        preferred_plan: "",
        additional_notes: ""
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-xl border-0">
      <CardHeader>
        <CardTitle className="text-2xl">Request a Quote</CardTitle>
        <CardDescription>
          Fill out the form below and our sales team will get back to you within 24 hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                required
                placeholder="Your Company Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person *</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => handleInputChange('contact_person', e.target.value)}
                required
                placeholder="Your Full Name"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                placeholder="contact@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+91 12345 67890"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_size">Company Size</Label>
              <Select value={formData.company_size} onValueChange={(value) => handleInputChange('company_size', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-1000">201-1000 employees</SelectItem>
                  <SelectItem value="1000+">1000+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                placeholder="e.g., Technology, Healthcare, Finance"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferred_plan">Preferred Plan</Label>
            <Select value={formData.preferred_plan} onValueChange={(value) => handleInputChange('preferred_plan', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select preferred plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="startup">Startup Plan (₹100/user - 1,000 tests)</SelectItem>
                <SelectItem value="enterprise">Enterprise Plan (₹92/user - 5,000+ tests)</SelectItem>
                <SelectItem value="custom">Custom Enterprise Solution</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional_notes">Additional Requirements</Label>
            <Textarea
              id="additional_notes"
              value={formData.additional_notes}
              onChange={(e) => handleInputChange('additional_notes', e.target.value)}
              placeholder="Tell us about your specific requirements, expected number of users, timeline, or any other details..."
              rows={4}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3"
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;
