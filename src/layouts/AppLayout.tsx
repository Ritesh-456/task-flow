import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import AIChatAssistant from "../components/ai/AIChatAssistant";
import { cn } from "@/lib/utils";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  // Initialize sidebar from localStorage or default
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Only persist for desktop, always closed by default on mobile on first load
    if (window.innerWidth < 768) return false;

    // Check local storage for desktop preference
    const saved = localStorage.getItem("sidebarOpen");
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return true;
      }
    }
    return true; // Default to open on desktop
  });

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    // Only save preference if on desktop to avoid saving "closed" state from mobile interaction
    if (window.innerWidth >= 768) {
      localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
    }
  }, [sidebarOpen]);

  // Initialize sidebar collapsed state from localStorage or default
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (window.innerWidth < 768) return false;
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  useEffect(() => {
    if (window.innerWidth >= 768) {
      localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
    }
  }, [isCollapsed]);

  return (
    <div className="flex min-h-screen bg-background relative">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-md z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={cn(
        "flex flex-1 flex-col transition-all duration-300",
        sidebarOpen && !isCollapsed ? "md:pl-60" : sidebarOpen && isCollapsed ? "md:pl-20" : "pl-0"
      )}>
        <TopNav sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">{children}</main>
      </div>
      <AIChatAssistant />
    </div>

  );
};

export default AppLayout;
