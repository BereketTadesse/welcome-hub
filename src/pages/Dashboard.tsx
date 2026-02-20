import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import sadiLogo from "@/assets/sadi-logo.png";

const Dashboard = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("sadi_current_user");
    if (!user) {
      navigate("/");
      return;
    }
    const parsed = JSON.parse(user);
    setUserName(parsed.name);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("sadi_current_user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src={sadiLogo} alt="Sadi Solutions" className="w-10 h-10 object-contain" />
            <span className="font-semibold text-foreground text-lg hidden sm:inline">Sadi IT Solutions</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {userName}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to Sadi IT Solutions
          </h1>
          <p className="text-lg text-muted-foreground">
            Hello, <span className="text-primary font-semibold">{userName}</span>! We're glad to have you here.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
