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
        const fetchActivities = async () => {
            try {
                const { data } = await api.get('/activities');
                setActivities(data);
            } catch (error) {
                console.error("Failed to fetch activities", error);
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
