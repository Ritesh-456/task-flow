import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from 'react';

// Lazy load Pages
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Projects = lazy(() => import("./pages/projects/Projects"));
const TaskBoard = lazy(() => import("./pages/tasks/TaskBoard"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy load Settings Pages
const ProfileSettings = lazy(() => import("./pages/settings/ProfileSettings"));
const AccountSettings = lazy(() => import("./pages/settings/AccountSettings"));
const PreferencesSettings = lazy(() => import("./pages/settings/PreferencesSettings"));
const SecuritySettings = lazy(() => import("./pages/settings/SecuritySettings"));
const ActivityLogs = lazy(() => import("./pages/settings/ActivityLogs"));
const TeamManagement = lazy(() => import("./pages/settings/TeamManagement"));
const ProjectSettings = lazy(() => import("./pages/settings/ProjectSettings"));
const NotificationSettings = lazy(() => import("./pages/settings/NotificationSettings"));

// Lazy load Admin & Analytics Pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const ProjectManagement = lazy(() => import("./pages/admin/ProjectManagement"));
const TaskMonitoring = lazy(() => import("./pages/admin/TaskMonitoring"));
const AnalyticsDashboard = lazy(() => import("./pages/analytics/AnalyticsDashboard"));
const PerformanceDashboard = lazy(() => import("./pages/performance/PerformanceDashboard"));

// Lazy load Public Pages
const LandingHome = lazy(() => import("./pages/landing/LandingHome"));
const Pricing = lazy(() => import("./pages/landing/Pricing"));
const Contact = lazy(() => import("./pages/landing/Contact"));
import ScrollToTop from "./components/ScrollToTop";

import { useAuth } from "./context/AuthContext";

const queryClient = new QueryClient();

// Simple protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <Suspense fallback={
              <div className="flex h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            }>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Register />} />

                {/* Public Routes */}
                <Route path="/" element={<LandingHome />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/contact" element={<Contact />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                <Route path="/tasks" element={<ProtectedRoute><TaskBoard /></ProtectedRoute>} />

                {/* Settings Routes */}
                <Route path="/settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
                <Route path="/settings/account" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
                <Route path="/settings/preferences" element={<ProtectedRoute><PreferencesSettings /></ProtectedRoute>} />
                <Route path="/settings/notifications" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
                <Route path="/settings/security" element={<ProtectedRoute><SecuritySettings /></ProtectedRoute>} />
                <Route path="/settings/activity" element={<ProtectedRoute><ActivityLogs /></ProtectedRoute>} />
                <Route path="/settings/team" element={<ProtectedRoute><TeamManagement /></ProtectedRoute>} />
                <Route path="/settings/projects" element={<ProtectedRoute><ProjectSettings /></ProtectedRoute>} />

                {/* Admin & Analytics Routes */}
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
                <Route path="/admin/projects" element={<ProtectedRoute><ProjectManagement /></ProtectedRoute>} />
                <Route path="/admin/tasks" element={<ProtectedRoute><TaskMonitoring /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
                <Route path="/performance" element={<ProtectedRoute><PerformanceDashboard /></ProtectedRoute>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
