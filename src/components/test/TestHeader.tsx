
import { Button } from "@/components/ui/button";
import { Clock, Save, Timer } from "lucide-react";
import { Link } from "react-router-dom";

interface TestHeaderProps {
  questionTimeRemaining: number;
  totalTimeRemaining: number;
  onSave: () => void;
}

export const TestHeader = ({ questionTimeRemaining, totalTimeRemaining, onSave }: TestHeaderProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="bg-white/80 backdrop-blur shadow-sm border-b border-primary/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/candidate-dashboard" className="flex items-center space-x-3">
            <img 
              src="https://raw.githubusercontent.com/Setidure-Technologies/parikshan-assess-ai/main/Peop360_Primary%20Logo.png" 
              alt="Parikshan AI" 
              className="h-10 w-auto"
            />
            <span className="text-2xl font-bold text-gray-900">Parikshan AI</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Timer className="h-4 w-4" />
              <span>Question: {formatTime(questionTimeRemaining)}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span className={totalTimeRemaining < 300 ? "text-red-600 font-bold" : ""}>
                Total: {formatTime(totalTimeRemaining)}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={onSave} className="border-primary/20 hover:bg-primary/5">
              <Save className="w-4 h-4 mr-2" />
              Save Progress
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
