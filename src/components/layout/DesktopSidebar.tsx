
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Clipboard, BarChart, LogOut, Youtube } from 'lucide-react';
import { useYoutube } from '../../contexts/YoutubeContext';
import { Button } from '../ui/button';

const DesktopSidebar: React.FC = () => {
  const { isAuthenticated, ownChannel, logout } = useYoutube();

  return (
    <div className="desktop-nav w-64 bg-sidebar text-sidebar-foreground flex-shrink-0">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Youtube className="h-6 w-6 text-youtube-red" />
            <h1 className="text-xl font-bold">YT Analyzer</h1>
          </div>
          {isAuthenticated && ownChannel && (
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <img 
                  src={ownChannel.thumbnail} 
                  alt={ownChannel.title} 
                  className="w-8 h-8 rounded-full"
                />
                <div className="truncate">
                  <p className="font-medium truncate">{ownChannel.title}</p>
                  <p className="text-xs opacity-70">{ownChannel.subscriberCount.toLocaleString()} subscribers</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `flex items-center gap-3 p-3 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                      : 'hover:bg-sidebar-accent/50'
                  }`
                }
                end
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/competitors" 
                className={({ isActive }) => 
                  `flex items-center gap-3 p-3 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                      : 'hover:bg-sidebar-accent/50'
                  }`
                }
              >
                <Users className="h-5 w-5" />
                <span>Competitors</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/clone" 
                className={({ isActive }) => 
                  `flex items-center gap-3 p-3 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                      : 'hover:bg-sidebar-accent/50'
                  }`
                }
              >
                <Clipboard className="h-5 w-5" />
                <span>Clone</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/analyze" 
                className={({ isActive }) => 
                  `flex items-center gap-3 p-3 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                      : 'hover:bg-sidebar-accent/50'
                  }`
                }
              >
                <BarChart className="h-5 w-5" />
                <span>Analyze</span>
              </NavLink>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t border-sidebar-border">
          {isAuthenticated && (
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
              onClick={logout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span>Logout</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesktopSidebar;
