import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  // Initialize sidebar closed on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  return (
    <div className="flex min-h-screen bg-background relative">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`flex flex-1 flex-col transition-all duration-300 ${sidebarOpen ? "md:pl-60" : "pl-0"}`}>
        <TopNav sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
