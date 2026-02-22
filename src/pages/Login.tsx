import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import sadiLogo from "@/assets/sadi-logo.png";

type LoginResponse = {
  token?: string;
  jwt?: string;
  accessToken?: string;
  data?: {
    token?: string;
    jwt?: string;
    accessToken?: string;
    user?: {
      name?: string;
      email?: string;
    };
  };
  user?: {
    name?: string;
    email?: string;
  };
  message?: string;
};

const isJwtLike = (value: string) => /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(value);
const isEmailLike = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const findJwtInObject = (input: unknown): string | undefined => {
  if (!input) return undefined;
  if (typeof input === "string") {
    return isJwtLike(input) ? input : undefined;
  }
  if (Array.isArray(input)) {
    for (const item of input) {
      const found = findJwtInObject(item);
      if (found) return found;
    }
    return undefined;
  }
  if (typeof input === "object") {
    for (const value of Object.values(input as Record<string, unknown>)) {
      const found = findJwtInObject(value);
      if (found) return found;
    }
  }
  return undefined;
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("message") === "session_expired") {
      toast({ title: "Session expired", description: "Please login again.", variant: "destructive" });
      navigate("/", { replace: true });
    }
  }, [navigate, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const data = (await apiRequest("/api/users/login", {
        method: "POST",
        autoLogoutOn401: false,
        body: JSON.stringify({ email, password }),
      })) as LoginResponse;

      const nameFromApi = data.user?.name || data.data?.user?.name;
      const safeName = nameFromApi && !isEmailLike(nameFromApi) ? nameFromApi : "User";
      const normalizedUser = {
        name: safeName,
        email: data.user?.email || data.data?.user?.email || email,
      };

      const token =
        data.token ||
        data.jwt ||
        data.accessToken ||
        data.data?.token ||
        data.data?.jwt ||
        data.data?.accessToken ||
        findJwtInObject(data);

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("goalstack_token", token);
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("goalstack_token");
        console.warn("Login succeeded but no JWT token was found in response body.");
      }

      localStorage.setItem("goalstack_user", JSON.stringify(normalizedUser));

      toast({ title: "Welcome back!", description: "Login successful" });
      navigate("/dashboard");
    } catch (error: unknown) {
      toast({
        title: "Login Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-0 shadow-xl bg-card">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="flex flex-col items-center mb-8">
            <img src={sadiLogo} alt="Sadi Solutions" className="w-24 h-24 object-contain mb-4" />
            <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

