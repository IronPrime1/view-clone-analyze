
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Clipboard as ClipboardIcon, Code } from 'lucide-react';

const MobileNavigation: React.FC = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/50 flex justify-around items-center px-2 py-3 z-10 shadow-lg">
      <NavLink 
        to="/dashboard" 
        className={({ isActive }) => 
          `flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-300 ${
            isActive 
              ? 'text-primary bg-primary/10 neon-glow' 
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          }`
        }
        end
      >
        <LayoutDashboard className="h-5 w-5 mb-1" />
        <span className="text-xs font-medium">Dashboard</span>
      </NavLink>
      
      <NavLink 
        to="/dashboard/competitors" 
        className={({ isActive }) => 
          `flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-300 ${
            isActive 
              ? 'text-primary bg-primary/10 neon-glow' 
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          }`
        }
      >
        <Users className="h-5 w-5 mb-1" />
        <span className="text-xs font-medium">Competitors</span>
      </NavLink>
      
      <NavLink 
        to="/dashboard/clone" 
        className={({ isActive }) => 
          `flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-300 ${
            isActive 
              ? 'text-primary bg-primary/10 neon-glow' 
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          }`
        }
      >
        <ClipboardIcon className="h-5 w-5 mb-1" />
        <span className="text-xs font-medium">Clone</span>
      </NavLink>
      
      <NavLink 
        to="/dashboard/scripts" 
        className={({ isActive }) => 
          `flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-300 ${
            isActive 
              ? 'text-primary bg-primary/10 neon-glow' 
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          }`
        }
      >
        <Code className="h-5 w-5 mb-1" />
        <span className="text-xs font-medium">Scripts</span>
      </NavLink>
    </nav>
  );
};

export default MobileNavigation;
