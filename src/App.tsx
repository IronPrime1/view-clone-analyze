
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Competitors from "./pages/Competitors";
import Clone from "./pages/Clone";
import Scripts from "./pages/Scripts";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import { YoutubeProvider } from "./contexts/YoutubeContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Add YouTube-specific color to Tailwind
import "./index.css";

// Create a new QueryClient instance outside of the component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <YoutubeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="competitors" element={<Competitors />} />
                <Route path="clone" element={<Clone />} />
                <Route path="scripts" element={<Scripts />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </YoutubeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
