import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, CheckSquare, Settings, LogOut, Zap, TrendingUp, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", allowedRoles: ["super_admin", "team_admin", "manager", "employee"] },
  { icon: FolderKanban, label: "Projects", path: "/projects", allowedRoles: ["super_admin", "team_admin", "manager", "employee"] },
  { icon: CheckSquare, label: "Tasks", path: "/tasks", allowedRoles: ["super_admin", "team_admin", "manager", "employee"] },
  { icon: TrendingUp, label: "Performance", path: "/performance", allowedRoles: ["super_admin", "team_admin"] },
  { icon: BarChart3, label: "Analytics", path: "/analytics", allowedRoles: ["super_admin", "team_admin"] },
  { icon: Settings, label: "Settings", path: "/settings", allowedRoles: ["super_admin", "team_admin", "manager", "employee"] },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar = ({ isOpen, onToggle, isCollapsed, onToggleCollapse }: SidebarProps) => {
  const location = useLocation();
  const { logout, activeRole } = useAuth();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 flex h-screen flex-col border-r-2 border-border bg-surface transition-all duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full",
        isOpen && !isCollapsed ? "w-60" : "w-20"
      )}
    >
      {/* Logo */}
      <div className={cn("flex h-14 items-center border-b border-border transition-all duration-300", isOpen && !isCollapsed ? "px-5 gap-2" : "justify-center px-0")}>
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary shrink-0">
          <Zap className="h-4 w-4 text-primary-foreground shrink-0" />
        </div>
        {(isOpen && !isCollapsed) && (
          <span className="text-sm font-semibold text-foreground whitespace-nowrap overflow-hidden">
            TaskFlow
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-3 overflow-y-auto overflow-x-hidden">
        {navItems.filter(item => item.allowedRoles.includes(activeRole)).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div key={item.path} className="group relative z-50">
              <Link
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 768) onToggle();
                }}
                className={cn(
                  "flex items-center rounded-md text-sm font-medium transition-colors relative",
                  isOpen && !isCollapsed ? "gap-3 px-3 py-2 justify-start" : "justify-center py-3 px-0",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {(isOpen && !isCollapsed) && (
                  <span className={cn("whitespace-nowrap overflow-hidden", isActive ? "text-primary" : "text-foreground")}>{item.label}</span>
                )}
              </Link>
              {/* Fake Tooltip for collapsed state */}
              {(!isOpen || isCollapsed) && (
                <div className="absolute left-full top-1/2 ml-4 -translate-y-1/2 rounded bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 z-[9999] whitespace-nowrap">
                  {item.label}
                  <div className="absolute left-0 top-1/2 -ml-1 -translate-y-1/2 border-[5px] border-transparent border-r-foreground" />
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3 flex flex-col gap-2 relative">
        <button
          onClick={onToggleCollapse}
          className={cn(
            "hidden md:flex items-center text-muted-foreground transition-colors hover:text-foreground",
            isOpen && !isCollapsed ? "justify-start gap-3 px-3 py-2" : "justify-center px-0 py-2 w-full"
          )}
        >
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("transition-transform", isCollapsed ? "rotate-180" : "rotate-0")}>
              <path d="m15 18-6-6 6-6" />
            </svg>
          </div>
          {(isOpen && !isCollapsed) && <span className="text-sm font-medium">Collapse</span>}
        </button>

        <div className="group relative z-40">
          <button
            onClick={logout}
            className={cn(
              "flex items-center rounded-md font-medium text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground w-full",
              isOpen && !isCollapsed ? "gap-3 px-3 py-2 justify-start text-sm" : "justify-center px-0 py-3"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {(isOpen && !isCollapsed) && <span className="text-foreground hover:text-destructive-foreground">Sign Out</span>}
          </button>

          {(!isOpen || isCollapsed) && (
            <div className="absolute left-full top-1/2 ml-4 -translate-y-1/2 rounded bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 z-[9999] whitespace-nowrap">
              Sign Out
              <div className="absolute left-0 top-1/2 -ml-1 -translate-y-1/2 border-[5px] border-transparent border-r-foreground" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
