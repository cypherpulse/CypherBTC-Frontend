import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import { Profile } from "./pages/Profile";
import { CypherBTC } from "./pages/CypherBTC";
import { Collectibles } from "./pages/Collectibles";
import { Activity } from "./pages/Activity";
import NotFound from "./pages/NotFound";

// Configure React Query with optimized settings for blockchain dApp
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Main Application Component
 *
 * Sets up the core providers and routing for the CypherBTC dApp.
 * Includes React Query for data fetching, toast notifications,
 * tooltips, and client-side routing with protected layouts.
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={200}>
      <Toaster />
      <Sonner position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/cypherbtc" element={<CypherBTC />} />
            <Route path="/collectibles" element={<Collectibles />} />
            <Route path="/activity" element={<Activity />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
