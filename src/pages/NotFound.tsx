
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this might be a failed OAuth callback
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const pendingYoutubeAuth = localStorage.getItem('pendingYoutubeAuth');
    
    if (code && pendingYoutubeAuth === 'true') {
      // This looks like an OAuth callback that got misrouted
      console.log("Detected misrouted OAuth callback, redirecting to Auth page");
      navigate('/auth' + location.search, { replace: true });
      return;
    }
    
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        <Button 
          onClick={() => navigate('/')} 
          className="inline-flex items-center"
        >
          <Home className="mr-2 h-4 w-4" />
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
