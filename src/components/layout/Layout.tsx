
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import MobileNavigation from './MobileNavigation';
import DesktopSidebar from './DesktopSidebar';
import { supabase } from '../../integrations/supabase/client';
import { useYoutube } from '../../contexts/YoutubeContext';
import AuthRequired from '../auth/AuthRequired';

const Layout: React.FC = () => {
  const { isLoading } = useYoutube();
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/auth', { replace: true });
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth', { replace: true });
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
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
