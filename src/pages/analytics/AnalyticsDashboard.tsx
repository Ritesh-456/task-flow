import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import {
    BarChart3,
    TrendingUp,
    Users,
    Clock,
    CheckCircle2,
    AlertCircle,
    Activity,
    Briefcase
} from 'lucide-react';

// Mock Data for Analytics
const taskTimeData = [
    { name: 'Jan', completed: 40, created: 65 },
    { name: 'Feb', completed: 30, created: 45 },
    { name: 'Mar', completed: 55, created: 50 },
    { name: 'Apr', completed: 45, created: 40 },
    { name: 'May', completed: 60, created: 70 },
    { name: 'Jun', completed: 75, created: 65 },
];

const teamProductivityData = [
    { name: 'Engineering', tasks: 120, efficiency: 85 },
    { name: 'Design', tasks: 80, efficiency: 92 },
    { name: 'Marketing', tasks: 65, efficiency: 78 },
    { name: 'Sales', tasks: 45, efficiency: 88 },
];

const statusData = [
    { name: 'Completed', value: 400, color: '#10b981' },
    { name: 'In Progress', value: 300, color: '#3b82f6' },
    { name: 'Pending', value: 150, color: '#f59e0b' },
    { name: 'Blocked', value: 50, color: '#ef4444' },
];

const workloadData = [
    { name: 'Alex H.', active: 8, capacity: 10 },
    { name: 'Sarah M.', active: 12, capacity: 10 },
    { name: 'John D.', active: 5, capacity: 10 },
    { name: 'Emma W.', active: 9, capacity: 10 },
];

export default function AnalyticsDashboard() {
    const { user, previewRole } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');

    const currentRole = previewRole || user?.role;

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

    return (
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
            <div className="flex space-x-1 rounded-xl bg-surface p-1 max-w-md">
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
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard title="Total Tasks" value="842" icon={Briefcase} trend={12.5} colorClass="text-blue-500" />
                        <StatCard title="Completed" value="512" icon={CheckCircle2} trend={8.2} colorClass="text-emerald-500" />
                        <StatCard title="Active Projects" value="24" icon={Activity} trend={-2.4} colorClass="text-amber-500" />
                        <StatCard title="Overdue" value="38" icon={AlertCircle} trend={-15.3} colorClass="text-rose-500" />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Task Completion Pipeline</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={taskTimeData}>
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
                                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
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
                                            data={statusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: '8px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 flex flex-wrap justify-center gap-4">
                                {statusData.map(stat => (
                                    <div key={stat.name} className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: stat.color }} />
                                        <span className="text-sm text-muted-foreground">{stat.name}</span>
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
                                <BarChart data={teamProductivityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                                    <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--muted-foreground))" />
                                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    />
                                    <Bar yAxisId="left" dataKey="tasks" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Completed Tasks" />
                                    <Bar yAxisId="right" dataKey="efficiency" fill="#10b981" radius={[4, 4, 0, 0]} name="Efficiency Score" />
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
                        <h3 className="text-lg font-semibold text-foreground mb-4">Individual Contributor Workload</h3>
                        <p className="text-sm text-muted-foreground mb-6">Monitoring burn-out vectors across active team members compared to raw capacity limits.</p>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={workloadData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="capacity" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} name="Capacity Limit" />
                                    <Bar dataKey="active" fill="#f43f5e" radius={[0, 4, 4, 0]} name="Active Assignments" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Time Tab */}
            {activeTab === 'time' && (
                <div className="space-y-6">
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-center justify-center p-12">
                        <div className="text-center">
                            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">Time Logs Processing</h3>
                            <p className="text-muted-foreground max-w-md mx-auto">Time tracking analytics are currently calculating historical intervals. Please check back after cron cycles complete.</p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
