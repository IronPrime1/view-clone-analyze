import React from 'react'
import { Button } from '@/components/ui/button';
import { useYoutube } from '../../contexts/YoutubeContext';

function Nav() {
  const { isAuthenticated, logout } = useYoutube();
   const handleAction = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur border-b border-white/20 container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src="/Logo1.png" alt="ScriptX Logo" className="h-10 w-10" />
          <h1 className="text-2xl font-bold">ScriptX</h1>
        </div>
          <Button 
              onClick={handleAction} 
              variant="default" 
              className="border-white/20 text-white text-md px-4 py-2 rounded-lg"
            >
              {isAuthenticated ? "Dashboard" : "Sign In"}
          </Button>
      </header>
  )
}

export default Nav