import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/AppLayout';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { toast } from 'sonner';
import { TaskDistributionData, TasksOverTimeData, UserProductivityData, ProjectProgressData } from '@/types';
import {
    BarChart3,
    TrendingUp,
    Users,
    Clock,
    CheckCircle2,
    AlertCircle,
    Activity,
    Briefcase,
    Loader2
} from 'lucide-react';

export default function AnalyticsDashboard() {
    const { user, activeRole } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);

    // Dynamic Data States
    const [overview, setOverview] = useState<any>(null);
    const [distribution, setDistribution] = useState<TaskDistributionData[]>([]);
    const [timeData, setTimeData] = useState<TasksOverTimeData[]>([]);
    const [productivity, setProductivity] = useState<UserProductivityData[]>([]);
    const [projects, setProjects] = useState<ProjectProgressData[]>([]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setIsLoading(true);
            try {
                // Fetch all 5 analytical endpoints in parallel for maximum speed
                const [overviewRes, distRes, timeRes, prodRes, projRes] = await Promise.all([
                    api.get('/analytics/overview'),
                    api.get('/analytics/task-distribution'),
                    api.get('/analytics/tasks-over-time'),
                    api.get('/analytics/user-productivity'),
                    api.get('/analytics/project-progress')
                ]);

                setOverview(overviewRes.data);

                // Assign a color map to the distribution payload to match the mocked UI pie chart colors
                const colorMap: Record<string, string> = {
                    'Done': '#10b981',
                    'In-progress': '#3b82f6',
                    'Todo': '#f59e0b',
                    'Blocked': '#ef4444'
                };

                const mappedDistribution = distRes.data.map((item: any) => ({
                    ...item,
                    color: colorMap[item.name] || '#64748b' // default slate
                }));
                setDistribution(mappedDistribution);

                // Ensure the LineChart always has exactly a 7-day trailing window to draw connecting lines.
                // We force a flat map of 7 days to prevent single-point arrays from collapsing the Recharts XAxis.
                const finalTimeData = Array.from({ length: 7 }).map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    const dateStr = d.toISOString().split('T')[0];

                    // Allow the backend data to override the padded 0 values if it exists
                    const backendArray = Array.isArray(timeRes.data) ? timeRes.data : [];
                    const apiMatch = backendArray.find((item: any) => item.date === dateStr);

                    return {
                        date: dateStr,
                        created: apiMatch ? Number(apiMatch.created) : 0,
                        completed: apiMatch ? Number(apiMatch.completed) : 0,
                        pending: apiMatch ? Number(apiMatch.pending) : 0,
                        overdue: apiMatch ? Number(apiMatch.overdue) : 0
                    };
                });

                setTimeData(finalTimeData);

                setProductivity(prodRes.data);
                setProjects(projRes.data);
            } catch (error) {
                console.error("Failed to load analytics data", error);
                toast.error("Failed to fetch analytics payload");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    const currentRole = activeRole;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
                    <p className="text-foreground font-medium mb-1">{`Date: ${label}`}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {`${entry.name}: ${entry.value}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'performance', label: 'Performance', icon: TrendingUp },
        { id: 'workload', label: 'Workload', icon: Users },
        { id: 'time', label: 'Time Analysis', icon: Clock },
    ];

    const StatCard = ({ title, value, icon: Icon, trend, colorClass }: any) => (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between pb-2">
                <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                <Icon className={`h-5 w-5 ${colorClass}`} />
            </div>
            <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-foreground">{value}</div>
                {trend && (
                    <span className={`text-xs font-medium ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-24 animate-in fade-in duration-500">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50 mb-4" />
                <h3 className="text-lg font-medium text-foreground">Analyzing Organization Telemetry...</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm text-center">
                    Fetching statistical distributions and generating visual charts from the latest database records.
                </p>
            </div>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-500 px-4 py-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics Hub</h1>
                        <p className="text-muted-foreground mt-1">
                            Comprehensive breakdown of your organization's performance.
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 rounded-xl bg-surface p-1 max-w-xl">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
              flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all
              ${activeTab === tab.id
                                    ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                                    : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'}
            `}
                        >
                            <tab.icon className="h-4 w-4" />
                            <span className="hidden sm:inline whitespace-nowrap">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="mt-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <StatCard title="Total Tasks" value={overview?.totalTasks || 0} icon={Briefcase} trend={12.5} colorClass="text-blue-500" />
                                <StatCard title="Completed" value={overview?.completedTasks || 0} icon={CheckCircle2} trend={8.2} colorClass="text-emerald-500" />
                                <StatCard title="Pending" value={overview?.pendingTasks || 0} icon={Activity} trend={-2.4} colorClass="text-amber-500" />
                                <StatCard title="Overdue" value={overview?.overdueTasks || 0} icon={AlertCircle} trend={-15.3} colorClass="text-rose-500" />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-foreground mb-4">Task Completion Pipeline</h3>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={timeData}>
                                                <defs>
                                                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                                                <YAxis stroke="hsl(var(--muted-foreground))" />
                                                <RechartsTooltip
                                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                                />
                                                <Area type="monotone" dataKey="created" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCreated)" name="Tasks Created" />
                                                <Area type="monotone" dataKey="completed" stroke="#10b981" fillOpacity={1} fill="url(#colorCompleted)" name="Tasks Completed" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-foreground mb-4">Task Status Distribution</h3>
                                    <div className="h-[300px] w-full flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={distribution}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={80}
                                                    outerRadius={110}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {distribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={(entry as any).color} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip
                                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: '8px' }}
                                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-4 flex flex-wrap justify-center gap-4">
                                        {distribution.map((stat: any) => (
                                            <div key={stat.name} className="flex items-center gap-2">
                                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: stat.color }} />
                                                <span className="text-sm text-muted-foreground">{stat.name}: {stat.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Performance Tab */}
                    {activeTab === 'performance' && (
                        <div className="space-y-6">
                            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-foreground mb-4">Team Productivity Matchup</h3>
                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={productivity} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                                            <YAxis stroke="hsl(var(--muted-foreground))" />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                            />
                                            <Bar dataKey="completed" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Completed Tasks" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Workload Tab */}
                    {activeTab === 'workload' && (
                        <div className="space-y-6">
                            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-foreground mb-4">Project Progress Tracking</h3>
                                <p className="text-sm text-muted-foreground mb-6">Monitoring completion velocity across active projects.</p>
                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={projects} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                                            <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                                            <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={220} fontSize={14} />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                            />
                                            <Bar dataKey="progress" fill="#10b981" radius={[0, 4, 4, 0]} name="Completion Percentage" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Time Tab */}
                    {activeTab === 'time' && (
                        <div className="grid grid-cols-1 gap-6">
                            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-6">Task Creation Over Time</h3>
                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={timeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                            />
                                            <Line type="monotone" dataKey="created" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: "#8b5cf6" }} activeDot={{ r: 6 }} name="Tasks Created" />
                                            <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981" }} activeDot={{ r: 6 }} name="Tasks Completed" />
                                            <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: "#f59e0b" }} activeDot={{ r: 6 }} name="Tasks Pending" />
                                            <Line type="monotone" dataKey="overdue" stroke="#ef4444" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: "#ef4444" }} activeDot={{ r: 6 }} name="Tasks Overdue" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
