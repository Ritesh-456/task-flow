import { Bell, CheckCircle2, Clock, UserPlus } from "lucide-react";
import { mockNotifications } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { NotificationType } from "@/types";

const iconMap: Record<NotificationType, React.ReactNode> = {
  task_assigned: <UserPlus className="h-4 w-4 text-primary" />,
  status_updated: <CheckCircle2 className="h-4 w-4 text-success" />,
  deadline_reminder: <Clock className="h-4 w-4 text-warning" />,
};

const NotificationPanel = ({ onClose }: { onClose: () => void }) => {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed right-4 top-14 z-50 w-80 animate-fade-in rounded-lg border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          <button className="text-xs text-primary hover:underline">Mark all read</button>
        </div>
        <div className="max-h-80 overflow-y-auto scrollbar-thin">
          {mockNotifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "flex gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-surface",
                !notification.read && "bg-surface/50"
              )}
            >
              <div className="mt-0.5">{iconMap[notification.type]}</div>
              <div className="flex-1">
                <p className="text-sm text-foreground">{notification.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              {!notification.read && (
                <div className="mt-1.5 h-2 w-2 animate-pulse-dot rounded-full bg-primary" />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
