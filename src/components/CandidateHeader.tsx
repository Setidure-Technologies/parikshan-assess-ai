
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";

interface CandidateHeaderProps {
  onLogout: () => void;
}

const CandidateHeader = ({ onLogout }: CandidateHeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/d1ba3c46-f6a5-4f1c-9b6e-e4d87e1c8a5b.png" 
              alt="Parikshan AI" 
              className="h-10 w-auto"
            />
            <span className="text-2xl font-bold text-gray-900">Parikshan AI</span>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, Candidate</span>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CandidateHeader;
