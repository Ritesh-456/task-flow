import { useState } from "react";
import { Bell, Search, Menu, PanelLeftClose } from "lucide-react";
import { mockNotifications, currentUser } from "@/data/mockData";
import NotificationPanel from "@/components/NotificationPanel";

interface TopNavProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const TopNav = ({ sidebarOpen, onToggleSidebar }: TopNavProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="h-9 w-full min-w-[120px] md:w-64 rounded-md border border-border bg-surface pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {currentUser.avatar}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
              <p className="text-xs capitalize text-muted-foreground">{currentUser.role}</p>
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
