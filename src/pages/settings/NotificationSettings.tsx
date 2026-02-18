import { useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Bell, Mail, MessageSquare, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const NotificationSettings = () => {
    const { user, updateUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Initialize state from user preferences or defaults
    const [email, setEmail] = useState(user?.preferences?.notifications?.email ?? true);
    const [realtime, setRealtime] = useState(user?.preferences?.notifications?.realtime ?? true);
    const [taskAssigned, setTaskAssigned] = useState(user?.preferences?.notifications?.taskAssigned ?? true);
    const [taskUpdates, setTaskUpdates] = useState(user?.preferences?.notifications?.taskUpdates ?? true);
    const [deadlineReminder, setDeadlineReminder] = useState(user?.preferences?.notifications?.deadlineReminder ?? true);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Update user preferences via context/API
            const currentPreferences = user?.preferences || {};
            const updatedPreferences = {
                ...currentPreferences,
                notifications: {
                    email,
                    realtime,
                    taskAssigned,
                    taskUpdates,
                    deadlineReminder
                }
            };

            await updateUser({ preferences: updatedPreferences });
            toast.success("Notification settings updated");
        } catch (error) {
            toast.error("Failed to update settings");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SidebarLayout>
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">Notification Settings</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage how you receive notifications.
                    </p>
                </div>
                <div className="border-t border-border" />

                <div className="space-y-4">
                    <h4 className="text-sm font-medium">Channels</h4>
                    <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-card">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <label className="text-base font-medium">Email Notifications</label>
                            </div>
                            <p className="text-sm text-muted-foreground">Receive daily digests and important alerts.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={email}
                            onChange={(e) => setEmail(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-card">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <Bell className="h-4 w-4 text-muted-foreground" />
                                <label className="text-base font-medium">Push Notifications</label>
                            </div>
                            <p className="text-sm text-muted-foreground">Real-time alerts for immediate updates.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={realtime}
                            onChange={(e) => setRealtime(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-medium">Activities</h4>
                    <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-card">
                        <div className="space-y-0.5">
                            <label className="text-base font-medium">Task Assignments</label>
                            <p className="text-sm text-muted-foreground">When a task is assigned to you.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={taskAssigned}
                            onChange={(e) => setTaskAssigned(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-card">
                        <div className="space-y-0.5">
                            <label className="text-base font-medium">Task Updates</label>
                            <p className="text-sm text-muted-foreground">When a task you're following changes status.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={taskUpdates}
                            onChange={(e) => setTaskUpdates(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-card">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <label className="text-base font-medium">Deadline Reminders</label>
                            </div>
                            <p className="text-sm text-muted-foreground">Reminders for approaching deadlines.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={deadlineReminder}
                            onChange={(e) => setDeadlineReminder(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Preferences"}
                    </Button>
                </div>
            </div>
        </SidebarLayout>
    );
};

export default NotificationSettings;
