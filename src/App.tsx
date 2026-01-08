import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FarmProvider } from "@/contexts/FarmContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import WaterBudget from "./pages/WaterBudget";
import CropDoctor from "./pages/CropDoctor";
import FarmLogs from "./pages/FarmLogs";
import DeviceSettings from "./pages/DeviceSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FarmProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/water-budget" element={<WaterBudget />} />
            <Route path="/crop-doctor" element={<CropDoctor />} />
            <Route path="/farm-logs" element={<FarmLogs />} />
            <Route path="/settings" element={<DeviceSettings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </FarmProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
