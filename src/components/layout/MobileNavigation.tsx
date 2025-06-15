
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Clipboard as ClipboardIcon, Code, User, LogIn } from 'lucide-react';
import { useYoutube } from '../../contexts/YoutubeContext';
import { Button } from '../ui/button';

const MobileNavigation: React.FC = () => {
  const { isAuthenticated, ownChannel, logout } = useYoutube();
  const navigate = useNavigate();

  const handleAuthAction = () => {
    if (isAuthenticated) {
      logout();
    } else {
      navigate('/auth');
    }
  };

  return (
    <nav className="mobile-nav fixed bottom-0 left-0 right-0 bg-background border-t flex justify-around items-center px-2 md:hidden z-10">
      <NavLink 
        to="/dashboard" 
        className={({ isActive }) => 
          `flex flex-col items-center py-2 px-2 ${
            isActive ? 'text-primary' : 'text-muted-foreground'
          }`
        }
        end
      >
        <LayoutDashboard className="h-5 w-5" />
        <span className="text-xs mt-1">Dashboard</span>
      </NavLink>
      
      <NavLink 
        to="/dashboard/competitors" 
        className={({ isActive }) => 
          `flex flex-col items-center py-2 px-2 ${
            isActive ? 'text-primary' : 'text-muted-foreground'
          }`
        }
      >
        <Users className="h-5 w-5" />
        <span className="text-xs mt-1">Competitors</span>
      </NavLink>
      
      <NavLink 
        to="/dashboard/clone" 
        className={({ isActive }) => 
          `flex flex-col items-center py-2 px-2 ${
            isActive ? 'text-primary' : 'text-muted-foreground'
          }`
        }
      >
        <ClipboardIcon className="h-5 w-5" />
        <span className="text-xs mt-1">Clone</span>
      </NavLink>
      
      <NavLink 
        to="/dashboard/scripts" 
        className={({ isActive }) => 
          `flex flex-col items-center py-2 px-2 ${
            isActive ? 'text-primary' : 'text-muted-foreground'
          }`
        }
      >
        <Code className="h-5 w-5" />
        <span className="text-xs mt-1">Scripts</span>
      </NavLink>

      {isAuthenticated ? (
        <button 
          onClick={handleAuthAction}
          className="flex flex-col items-center py-2 px-2 text-muted-foreground"
        >
          {ownChannel ? (
            <img 
              src={ownChannel.thumbnail} 
              alt={ownChannel.title} 
              className="w-5 h-5 rounded-full"
            />
          ) : (
            <User className="h-5 w-5" />
          )}
          <span className="text-xs mt-1">Profile</span>
        </button>
      ) : (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleAuthAction}
          className="flex flex-col items-center py-2 px-2 h-auto"
        >
          <LogIn className="h-5 w-5" />
          <span className="text-xs mt-1">Login</span>
        </Button>
      )}
    </nav>
  );
};

export default MobileNavigation;
