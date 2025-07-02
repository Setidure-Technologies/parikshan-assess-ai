
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardHeaderProps {
  onLogout: () => void;
}

const DashboardHeader = ({ onLogout }: DashboardHeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="https://raw.githubusercontent.com/Setidure-Technologies/parikshan-assess-ai/main/Peop360_Primary%20Logo.png" 
              alt="Parikshan AI" 
              className="h-10 w-auto"
            />
            <span className="text-2xl font-bold text-gray-900">Parikshan AI</span>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, Administrator</span>
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

export default DashboardHeader;
