
import React from 'react';
import { useYoutube } from '../../contexts/YoutubeContext';
import { Button } from '../ui/button';
import { Youtube } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { useNavigate } from 'react-router-dom';

const YoutubeAuth: React.FC = () => {
  const { login, isLoading } = useYoutube();
  const navigate = useNavigate();
  
  const handleConnect = async () => {
    try {
      // Make sure we have a clean URL before the redirect
      window.history.replaceState({}, document.title, window.location.pathname);
      await login();
      // The login function now redirects to Google OAuth
    } catch (error) {
      console.error("Failed to start YouTube auth:", error);
    }
  };
  
  return (
    <div className="max-w-md mx-auto my-8">
      <Card className="shadow-lg border-2 border-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Youtube className="h-8 w-8 text-youtube-red" />
            <span>Connect with YouTube</span>
          </CardTitle>
          <CardDescription>
            Connect your YouTube channel to analyze your performance against competitors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-accent/50 p-4 rounded-md">
            <h3 className="font-medium mb-2">What you'll get:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Compare your daily views with competitors</li>
              <li>Analyze competitor videos and strategies</li>
              <li>Generate content ideas based on competitor success</li>
              <li>Track performance over time</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleConnect} 
            disabled={isLoading}
            className="w-full bg-youtube-red hover:bg-youtube-red/80"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Connecting...
              </>
            ) : (
              <>
                <Youtube className="h-5 w-5 mr-2" />
                Connect YouTube Channel
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default YoutubeAuth;