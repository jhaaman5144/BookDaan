import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Login() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">BookDaan</h1>
              <p className="text-sm text-slate-500">Share Books, Spread Knowledge</p>
            </div>
          </div>
          <CardTitle className="text-xl">Welcome to BookDaan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-slate-600">
            Join our community of book lovers and start sharing knowledge today.
          </p>
          
          <Button 
            onClick={handleLogin}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3"
            size="lg"
          >
            Sign in with Replit
          </Button>
          
          <div className="text-center text-sm text-slate-500">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
