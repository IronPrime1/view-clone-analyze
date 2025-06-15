
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import MobileNavigation from './MobileNavigation';
import DesktopSidebar from './DesktopSidebar';
import { supabase } from '../../integrations/supabase/client';
import { useYoutube } from '../../contexts/YoutubeContext';
import { ThemeToggle } from '../ui/theme-toggle';
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
      <header className="md:hidden sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-4 py-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img src="/Logo1.png" alt="Logo" className="h-8 w-8 rounded-md shadow-md" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-md"></div>
          </div>
          <span className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            ScriptX
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="neon-border">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 modern-card">
              <div className="flex flex-col h-full bg-card text-card-foreground">
                <div className="p-4 border-b border-border/50">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img src="/Logo1.png" alt="Logo" className="h-8 w-8 rounded-md shadow-md" />
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-md"></div>
                    </div>
                    <span className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      ScriptX
                    </span>
                  </div>  
                </div>
                
                <nav 
                  className="flex-1 px-4 py-2"
                  onClick={() => setOpen(false)}
                >
                  {ownChannel && (
                    <div className="mt-0 pt-0 pb-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 neon-border">
                        <img 
                          src={ownChannel.thumbnail} 
                          alt={ownChannel.title} 
                          className="w-10 h-10 rounded-full shadow-md"
                        />
                        <div className="truncate">
                          <p className="font-medium truncate">{ownChannel.title}</p>
                          <p className="text-xs text-muted-foreground">{ownChannel.subscriberCount.toLocaleString()} subscribers</p>
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
                        className="w-full justify-start hover-lift neon-border"
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
                        className="w-full justify-start hover-lift neon-border"
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
                        className="w-full justify-start hover-lift neon-border"
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
                        className="w-full justify-start hover-lift neon-border"
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
        </div>
      </header>
      
      <DesktopSidebar />
      
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 pb-24 md:pb-6">
          {isLoading && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="modern-card p-8 flex flex-col items-center neon-glow">
                <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-foreground font-medium">Loading...</p>
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
