import { useState } from "react";
import { Bell, Search, Menu, PanelLeftClose, Sun, Moon } from "lucide-react";
import { mockNotifications } from "@/data/mockData";
import NotificationPanel from "../components/ui/NotificationPanel";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { toast } from "sonner";
import ImpersonationSelector from "../components/ui/ImpersonationSelector";

interface TopNavProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const TopNav = ({ sidebarOpen, onToggleSidebar }: TopNavProps) => {
  const { user, updateUser, impersonatedUser } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  const toggleTheme = async () => {
    const currentTheme = user?.preferences?.theme || "dark";
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    updateUser({
      preferences: {
        ...user?.preferences,
        theme: newTheme
      }
    });

    try {
      await api.put("/users/preferences", { theme: newTheme });
    } catch (error) {
      console.error("Failed to save theme preference");
      updateUser({
        preferences: {
          ...user?.preferences,
          theme: currentTheme
        }
      });
      toast.error("Failed to save theme");
    }
  };

  const isDark = (user?.preferences?.theme || "dark") === "dark";

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 sm:px-6 backdrop-blur-sm gap-4">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onToggleSidebar}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground z-50 relative pointer-events-auto"
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="h-9 w-32 sm:w-48 md:w-64 rounded-md border border-border bg-surface pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ImpersonationSelector />

          <button
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-surface transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <Sun className="h-5 w-5 text-muted-foreground" /> : <Moon className="h-5 w-5 text-muted-foreground" />}
          </button>

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-surface transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-primary ring-2 ring-background">
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 ml-1">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={`${user.firstName} ${user.lastName}`}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {user?.firstName ? `${user.firstName[0]}${user.lastName?.[0] || ''}`.toUpperCase() : '??'}
              </div>
            )}
            <div className="hidden md:block">
              <p className="text-sm font-medium text-foreground">
                {user?.firstName || user?.first_name ? `${user?.firstName || user?.first_name} ${user?.lastName || user?.last_name || ''}` : 'Loading...'}
              </p>
              <p className="text-xs capitalize text-muted-foreground">
                {impersonatedUser ? `[${user?.role?.replace("_", " ")}] Impersonating...` : user?.role?.replace("_", " ") || 'User'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}
    </>
  );
};

export default TopNav;
