
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Competitors from "./pages/Competitors";
import Clone from "./pages/Clone";
import Analyze from "./pages/Analyze";
import NotFound from "./pages/NotFound";
import { YoutubeProvider } from "./contexts/YoutubeContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <YoutubeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="competitors" element={<Competitors />} />
              <Route path="clone" element={<Clone />} />
              <Route path="analyze" element={<Analyze />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </YoutubeProvider>
  </QueryClientProvider>
);

export default App;
