
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Clipboard, BarChart } from 'lucide-react';

const MobileNavigation: React.FC = () => {
  return (
    <nav className="mobile-nav">
      <NavLink 
        to="/" 
        className={({ isActive }) => 
          `flex flex-col items-center p-2 ${
            isActive ? 'text-primary' : 'text-muted-foreground'
          }`
        }
        end
      >
        <LayoutDashboard className="h-6 w-6" />
        <span className="text-xs mt-1">Dashboard</span>
      </NavLink>
      
      <NavLink 
        to="/competitors" 
        className={({ isActive }) => 
          `flex flex-col items-center p-2 ${
            isActive ? 'text-primary' : 'text-muted-foreground'
          }`
        }
      >
        <Users className="h-6 w-6" />
        <span className="text-xs mt-1">Competitors</span>
      </NavLink>
      
      <NavLink 
        to="/clone" 
        className={({ isActive }) => 
          `flex flex-col items-center p-2 ${
            isActive ? 'text-primary' : 'text-muted-foreground'
          }`
        }
      >
        <Clipboard className="h-6 w-6" />
        <span className="text-xs mt-1">Clone</span>
      </NavLink>
      
      <NavLink 
        to="/analyze" 
        className={({ isActive }) => 
          `flex flex-col items-center p-2 ${
            isActive ? 'text-primary' : 'text-muted-foreground'
          }`
        }
      >
        <BarChart className="h-6 w-6" />
        <span className="text-xs mt-1">Analyze</span>
      </NavLink>
    </nav>
  );
};

export default MobileNavigation;
