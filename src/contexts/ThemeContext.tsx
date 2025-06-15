
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Try to get theme from user metadata first
          const userTheme = session.user.user_metadata?.theme as Theme;
          if (userTheme && ['light', 'dark'].includes(userTheme)) {
            setTheme(userTheme);
          } else {
            // Fallback to localStorage for existing users
            const savedTheme = localStorage.getItem('theme') as Theme;
            if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
              setTheme(savedTheme);
              // Save to user metadata for future use
              await supabase.auth.updateUser({
                data: { theme: savedTheme }
              });
            }
          }
        } else {
          // For non-authenticated users, use localStorage
          const savedTheme = localStorage.getItem('theme') as Theme;
          if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
            setTheme(savedTheme);
          }
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
        // Fallback to localStorage
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
          setTheme(savedTheme);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userTheme = session.user.user_metadata?.theme as Theme;
        if (userTheme && ['light', 'dark'].includes(userTheme)) {
          setTheme(userTheme);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const updateThemePreference = async () => {
      if (isLoading) return;

      // Always save to localStorage
      localStorage.setItem('theme', theme);
      document.documentElement.className = theme;

      // Save to user metadata if authenticated
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.auth.updateUser({
            data: { theme }
          });
        }
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    };

    updateThemePreference();
  }, [theme, isLoading]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
