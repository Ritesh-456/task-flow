import { useState, useEffect } from "react";
import SidebarLayout from "@/layouts/SidebarLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Folder, CheckSquare, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

interface SystemStats {
    users: { total: number };
    projects: { total: number };
    tasks: {
        total: number;
        active: number;
        completed: number;
        overdue: number;
    };
}

const AdminDashboard = () => {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get("/admin/stats");
                setStats(data);
            } catch (error) {
                toast.error("Failed to load system stats");
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <SidebarLayout>
                <div className="flex h-full items-center justify-center">Loading stats...</div>
            </SidebarLayout>
        );
    }

    return (
        <SidebarLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
                    <p className="text-muted-foreground">Overview of system status and key metrics.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.users.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                            <Folder className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.projects.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                            <CheckSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.tasks.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
                            <AlertCircle className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">{stats?.tasks.overdue}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.tasks.active}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
                            <CheckSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.tasks.completed}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </SidebarLayout>
    );
};

export default AdminDashboard;
