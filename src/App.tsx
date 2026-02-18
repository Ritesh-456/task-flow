import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/dashboard/Dashboard";
import Projects from "./pages/projects/Projects";
import TaskBoard from "./pages/tasks/TaskBoard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotFound from "./pages/NotFound";

// Settings Pages
import ProfileSettings from "./pages/settings/ProfileSettings";
import AccountSettings from "./pages/settings/AccountSettings";
import PreferencesSettings from "./pages/settings/PreferencesSettings";
import SecuritySettings from "./pages/settings/SecuritySettings";
import ActivityLogs from "./pages/settings/ActivityLogs";
import TeamManagement from "./pages/settings/TeamManagement";
import ProjectSettings from "./pages/settings/ProjectSettings";
import NotificationSettings from "./pages/settings/NotificationSettings";

// Admin & Analytics Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import ProjectManagement from "./pages/admin/ProjectManagement";
import TaskMonitoring from "./pages/admin/TaskMonitoring";
import AnalyticsDashboard from "./pages/analytics/AnalyticsDashboard";

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
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
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

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
