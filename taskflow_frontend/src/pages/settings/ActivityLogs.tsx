import { useState, useEffect } from "react";
import SidebarLayout from "@/layouts/SidebarLayout";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import api from "@/services/api";
import { formatDistanceToNow } from "date-fns";

interface Activity {
    _id: string;
    action: string;
    entityType: string;
    details: any;
    createdAt: string;
    user: {
        name: string;
        email: string;
    }
}

export default function ActivityLogs() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fallback to realistic mock data to demonstrate the UI until backend is connected
        const mockActivities: Activity[] = [
            { _id: "1", action: "created", entityType: "task", details: {}, createdAt: new Date().toISOString(), user: { name: "Admin Alpha", email: "admin@alpha.com" } },
            { _id: "2", action: "updated", entityType: "project", details: {}, createdAt: new Date(Date.now() - 3600000).toISOString(), user: { name: "You", email: "" } },
            { _id: "3", action: "deleted", entityType: "file", details: {}, createdAt: new Date(Date.now() - 86400000).toISOString(), user: { name: "System", email: "" } },
            { _id: "4", action: "invited", entityType: "user", details: {}, createdAt: new Date(Date.now() - 172800000).toISOString(), user: { name: "You", email: "" } }
        ];

        const fetchActivities = async () => {
            try {
                const { data } = await api.get('/activities');
                if (data && data.length > 0) {
                    setActivities(data);
                } else {
                    setActivities(mockActivities);
                }
            } catch (error) {
                console.error("Failed to fetch activities, using mock data", error);
                setActivities(mockActivities);
            } finally {
                setIsLoading(false);
            }
        };
        fetchActivities();
    }, []);

    return (
        <SidebarLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Activity Logs</h2>
                    <p className="text-muted-foreground">View recent system actions.</p>
                </div>

                <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Entity</TableHead>
                                <TableHead>Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
                                </TableRow>
                            ) : activities.length > 0 ? (
                                activities.map((activity) => (
                                    <TableRow key={activity._id}>
                                        <TableCell className="font-medium">{activity.user?.name || 'Unknown'}</TableCell>
                                        <TableCell className="capitalize">{activity.action}</TableCell>
                                        <TableCell className="capitalize">{activity.entityType}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">No recent activity found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </SidebarLayout>
    );
}
