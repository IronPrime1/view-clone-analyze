
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Clipboard as ClipboardIcon, Code } from 'lucide-react';

const MobileNavigation: React.FC = () => {
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
    </nav>
  );
};

export default MobileNavigation;
