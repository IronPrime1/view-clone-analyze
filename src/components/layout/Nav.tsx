import { Button } from '@/components/ui/button';
import { useYoutube } from '../../contexts/YoutubeContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../ui/theme-toggle';

function Nav() {
  const { isAuthenticated } = useYoutube();
  const navigate = useNavigate();
   const handleAction = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };
  return (
    <header className="fixed top-0 left-0 right-0 z-100 bg-black border-b border-white/20">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src="/Logo1.png" alt="ScriptX Logo" className="h-10 w-10" />
          <h1 className="text-2xl font-bold">ScriptX</h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button 
              onClick={handleAction} 
              variant="default" 
              className="border-white/20 text-white text-md px-4 py-2 rounded-lg"
            >
              {isAuthenticated ? "Dashboard" : "Sign In"}
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Nav
