
import React from 'react'
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useYoutube } from '../../contexts/YoutubeContext';
import { useNavigate } from 'react-router-dom';

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img src="/Logo1.png" alt="ScriptX Logo" className="h-10 w-10 rounded-lg shadow-md" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-lg"></div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            ScriptX
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button 
            onClick={handleAction} 
            className="modern-button px-6 py-2"
          >
            {isAuthenticated ? "Dashboard" : "Sign In"}
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Nav
