
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import MobileNavigation from './MobileNavigation';
import DesktopSidebar from './DesktopSidebar';
import { supabase } from '../../integrations/supabase/client';
import { useYoutube } from '../../contexts/YoutubeContext';
import AuthRequired from '../auth/AuthRequired';
import { Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Layout: React.FC = () => {
  const { isLoading, ownChannel } = useYoutube();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
      const checkAuth = async () => {
        try {
          const { data } = await supabase.auth.getSession();
          if (!data.session && location.pathname !== '/auth') {
            navigate('/auth', { replace: true });
          }
        } catch (error) {
          console.error("Error checking session:", error);
          navigate('/auth', { replace: true });
        }
      };

      checkAuth();
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' && location.pathname !== '/auth') {
          navigate('/auth', { replace: true });
        }
      });

      return () => subscription.unsubscribe();
    }, [navigate, location]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-10 bg-background border-b flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-md flex items-center justify-center">
            <img src="/Logo1.png" alt="Logo" className="h-8 w-8 rounded-md" />
          </div>
            <span className="text-xl font-semibold font-inter">ScriptX</span>
          </div>
        
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
              <div className="p-4 border-b border-sidebar-border">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-md flex items-center justify-center">
                    <img src="/Logo1.png" alt="Logo" className="h-8 w-8 rounded-md" />
                  </div>
                    <span className="text-xl font-semibold font-inter">ScriptX</span>
                  </div>  
              </div>
              
              <nav 
                className="flex-1 px-4 py-2"
                onClick={() => setOpen(false)}
              >
                {ownChannel && (
                  <div className="mt-0 pt-0 pb-2">
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
                <ul className="space-y-2">
                  {/* Updated navigation links */}
                  <li>
                    <Button 
                      asChild 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => setOpen(false)}
                    >
                      <a href="/dashboard">
                        <span className="h-5 w-5 mr-3">📊</span>
                        Dashboard
                      </a>
                    </Button>
                  </li>
                  <li>
                    <Button 
                      asChild 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => setOpen(false)}
                    >
                      <a href="/dashboard/competitors">
                        <span className="h-5 w-5 mr-3">👥</span>
                        Competitors
                      </a>
                    </Button>
                  </li>
                  <li>
                    <Button 
                      asChild 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => setOpen(false)}
                    >
                      <a href="/dashboard/clone">
                        <span className="h-5 w-5 mr-3">📝</span>
                        Clone
                      </a>
                    </Button>
                  </li>
                  <li>
                    <Button 
                      asChild 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => setOpen(false)}
                    >
                      <a href="/dashboard/scripts">
                        <span className="h-5 w-5 mr-3">📜</span>
                        Scripts
                      </a>
                    </Button>
                  </li>
                </ul>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </header>
      
      <DesktopSidebar />
      
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4 pb-24 md:pb-4">
          {isLoading && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-background p-6 rounded-lg shadow-lg flex flex-col items-center">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-foreground">Loading...</p>
              </div>
            </div>
          )}
          
          <AuthRequired>
            <Outlet />
          </AuthRequired>
        </main>
        
        <MobileNavigation />
      </div>
    </div>
  );
};

export default Layout;
