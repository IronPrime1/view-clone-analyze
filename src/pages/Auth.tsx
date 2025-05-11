
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Youtube, Mail, Lock, Loader2 } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [processingOAuth, setProcessingOAuth] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  // Handle YouTube OAuth callback
  useEffect(() => {
    const processYoutubeAuth = async () => {
      // Check if we have a code in the URL (OAuth callback)
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      
      // Check if we're expecting a YouTube auth callback
      const pendingYoutubeAuth = localStorage.getItem('pendingYoutubeAuth');
      
      if (code && pendingYoutubeAuth === 'true') {
        setProcessingOAuth(true);
        try {
          // Get the current user's auth token
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (!sessionData.session) {
            throw new Error("You must be logged in to connect your YouTube channel");
          }
          
          // Clear the pending auth flag
          localStorage.removeItem('pendingYoutubeAuth');
          
          // Remove any query parameters from the URL to prevent "page not found" issues
          // This modification helps clean up the URL before processing the auth
          window.history.replaceState({}, document.title, '/youtubeauth');
          
          // Call our edge function to exchange the code for tokens
          const { data, error } = await supabase.functions.invoke('youtube-auth', {
            body: {
              code,
              redirectUri: `${window.location.origin}/youtubeauth`
            }
          });
          
          if (error) throw new Error(error.message);
          
          if (!data.success) {
            throw new Error(data.error || "Failed to connect YouTube channel");
          }
          
          toast.success("YouTube channel connected successfully");
          // Use replace to avoid back-button issues
          navigate('/', { replace: true });
          
        } catch (error: any) {
          console.error("YouTube auth error:", error);
          toast.error(error.message || "Failed to connect YouTube channel");
          navigate('/', { replace: true });
        } finally {
          setProcessingOAuth(false);
        }
      }
    };
    
    processYoutubeAuth();
  }, [location, navigate]);
  
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        toast.success("Logged in successfully");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });
        
        if (error) throw error;
        
        if (data.user?.identities?.length === 0) {
          toast.error("Account already exists. Please login instead.");
        } else {
          toast.success("Account created successfully. Please log in.");
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };
  
  // Clean up auth state to prevent limbo states
  const cleanupAuthState = () => {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };
  
  // If processing OAuth, show loading screen
  if (processingOAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Youtube className="h-8 w-8 text-youtube-red" />
              <span>Connecting YouTube</span>
            </CardTitle>
            <CardDescription>
              Please wait while we connect your YouTube account...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-youtube-red" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If already authenticated, redirect to dashboard
  if (session) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center">
            <Youtube className="h-8 w-8 text-youtube-red mr-2" />
            <h1 className="text-2xl font-bold">YT Analyzer</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Analyze your YouTube channel performance against competitors
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? "Login" : "Create Account"}</CardTitle>
            <CardDescription>
              {isLogin 
                ? "Enter your credentials to access your account" 
                : "Sign up to start analyzing your YouTube performance"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleAuth}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters long
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Logging in..." : "Creating account..."}
                  </>
                ) : (
                  isLogin ? "Login" : "Create Account"
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="link" 
                className="text-sm"
                onClick={() => setIsLogin(!isLogin)}
                disabled={loading}
              >
                {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
