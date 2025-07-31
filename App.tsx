
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SessionWorkspace from "./pages/SessionWorkspace";
import PatientDetailedProfile from "./pages/PatientDetailedProfile";
import PatientList from "./pages/PatientList";
import NewPatient from "./pages/NewPatient";
import MyAccount from "./pages/MyAccount";
import FAQs from "./pages/FAQs";
import CalendarView from "./pages/CalendarView";
import HelpCenter from "./pages/HelpCenter";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/session-workspace" element={<SessionWorkspace />} />
          
          {/* Patient Routes */}
          <Route path="/patients" element={<PatientList />} />
          <Route path="/patients/:patientId" element={<PatientDetailedProfile />} />
          <Route path="/new-patient" element={<NewPatient />} />
          
          {/* Calendar Routes */}
          <Route path="/calendar" element={<CalendarView />} />
          
          {/* Support Routes */}
          <Route path="/help" element={<HelpCenter />} />
          
          {/* Legacy routes for backward compatibility */}
          <Route path="/patient-list" element={<PatientList />} />
          <Route path="/patient-detailed-profile" element={<PatientDetailedProfile />} />
          
          <Route path="/my-account" element={<MyAccount />} />
          <Route path="/faqs" element={<FAQs />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
