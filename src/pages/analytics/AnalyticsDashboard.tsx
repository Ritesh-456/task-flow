import { useState, useEffect } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    BarChart, Bar
} from "recharts";
import { toast } from "sonner";
import api from "@/services/api";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsDashboard = () => {
    const [overview, setOverview] = useState<any>(null);
    const [taskDistribution, setTaskDistribution] = useState<any[]>([]);
    const [tasksOverTime, setTasksOverTime] = useState<any[]>([]);
    const [productivity, setProductivity] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [overviewRes, distRes, timeRes, prodRes] = await Promise.all([
                    api.get("/analytics/overview"),
                    api.get("/analytics/task-distribution"),
                    api.get("/analytics/tasks-over-time"),
                    api.get("/analytics/user-productivity")
                ]);

                setOverview(overviewRes.data);
                setTaskDistribution(distRes.data);
                setTasksOverTime(timeRes.data);
                setProductivity(prodRes.data);
            } catch (error) {
                toast.error("Failed to fetch analytics data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <SidebarLayout>
                <div className="flex h-full items-center justify-center">Loading analytics...</div>
            </SidebarLayout>
        );
    }

    return (
        <SidebarLayout>
            <div className="space-y-6 pb-10">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
                    <p className="text-muted-foreground">Productivity insights and performance metrics.</p>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overview?.totalTasks}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overview?.completionRate}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overview?.pendingTasks}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">{overview?.overdueTasks}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Task Status Distribution - Pie Chart */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Task Status Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={taskDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {taskDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Tasks Over Time - Line Chart */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Tasks Over Time (Last 7 Days)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={tasksOverTime}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="created" stroke="#8884d8" name="Created" />
                                    <Line type="monotone" dataKey="completed" stroke="#82ca9d" name="Completed" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* User Productivity - Bar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Performing Users (Completed Tasks)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={productivity}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="completed" fill="#8884d8" name="Completed Tasks" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </SidebarLayout>
    );
};

export default AnalyticsDashboard;
