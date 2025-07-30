import MainDashboard from "@/components/MainDashboard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
const Index = () => {
  return <div className="min-h-screen bg-background">
      <MainDashboard />
      
      {/* Navigation Links for Testing */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2">
        <Link to="/session-workspace">
          
        </Link>
        <Link to="/my-account">
          
        </Link>
      </div>
    </div>;
};
export default Index;