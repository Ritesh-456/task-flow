import React, { useMemo, useState, useEffect } from "react";
import AppLayout from "@/layouts/AppLayout";
import { CheckCircle2, Clock, AlertTriangle, FolderKanban, TrendingUp, TrendingDown, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { User as UserIcon, Shield } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { tasks } = useData();
  const { user, viewAsUserId, setViewAsUserId } = useAuth();
  const [hierarchyUsers, setHierarchyUsers] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.role === 'super_admin') {
      const fetchHierarchy = async () => {
        try {
          const queryParam = viewAsUserId ? `?userId=${viewAsUserId}` : '';
          const { data } = await api.get(`/users${queryParam}`);
          setHierarchyUsers(data);
        } catch (error) {
          console.error("Failed to fetch hierarchy", error);
        }
      };
      fetchHierarchy();
    }
  }, [user]);

  const activeUser = hierarchyUsers.find(u => u._id === viewAsUserId) || user;

  const metrics = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "done").length;
    const pending = tasks.filter((t) => t.status !== "done").length;

    // Overdue logic
    const overdue = tasks.filter((t) => {
      if (!t.dueDate || t.status === 'done') return false;
      return new Date(t.dueDate) < now;
    }).length;

    // Last week's stats for comparison
    const lastWeekTasks = tasks.filter(t => new Date(t.createdAt || 0) <= oneWeekAgo);
    const lastWeekCompleted = lastWeekTasks.filter(t => t.status === "done").length;

    const taskGrowth = lastWeekTasks.length === 0 ? 100 : Math.round(((total - lastWeekTasks.length) / lastWeekTasks.length) * 100);
    const compGrowth = lastWeekCompleted === 0 ? (completed > 0 ? 100 : 0) : Math.round(((completed - lastWeekCompleted) / lastWeekCompleted) * 100);

    // Distribution Data for Pie Chart
    const distMap = { "done": 0, "in-progress": 0, "todo": 0 };
    tasks.forEach(t => distMap[t.status] = (distMap[t.status] || 0) + 1);
    const distribution = [
      { name: "Done", value: distMap["done"], color: "#10b981" },
      { name: "In Progress", value: distMap["in-progress"], color: "#3b82f6" },
      { name: "Todo", value: distMap["todo"], color: "#f59e0b" }
    ].filter(d => d.value > 0);

    // Weekly Line Data (Last 7 days)
    const lineDataMap: Record<string, { date: string; completed: number; created: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      lineDataMap[dateStr] = { date: dateStr, completed: 0, created: 0 };
    }

    tasks.forEach(t => {
      const createDate = new Date(t.createdAt || 0).toLocaleDateString('en-US', { weekday: 'short' });
      if (lineDataMap[createDate]) lineDataMap[createDate].created++;

      // For completion, we roughly check updated at if it's done
      if (t.status === 'done') {
        const compDate = new Date(t.updatedAt || t.createdAt || 0).toLocaleDateString('en-US', { weekday: 'short' });
        if (lineDataMap[compDate]) lineDataMap[compDate].completed++;
      }
    });

    const lineData = Object.values(lineDataMap);

    return { total, completed, pending, overdue, taskGrowth, compGrowth, distribution, lineData };
  }, [tasks]);

  const stats = [
    {
      label: "Total Tasks",
      value: metrics.total,
      icon: FolderKanban,
      color: "text-primary bg-primary/10",
      trend: metrics.taskGrowth,
      progress: 100,
      barColor: "bg-primary"
    },
    {
      label: "Completed",
      value: metrics.completed,
      icon: CheckCircle2,
      color: "text-success bg-success/10",
      trend: metrics.compGrowth,
      progress: metrics.total === 0 ? 0 : (metrics.completed / metrics.total) * 100,
      barColor: "bg-success"
    },
    {
      label: "Pending",
      value: metrics.pending,
      icon: Clock,
      color: "text-warning bg-warning/10",
      trend: 0,
      progress: metrics.total === 0 ? 0 : (metrics.pending / metrics.total) * 100,
      barColor: "bg-warning"
    },
    {
      label: "Overdue",
      value: metrics.overdue,
      icon: AlertTriangle,
      color: "text-destructive bg-destructive/10",
      trend: 0,
      progress: metrics.total === 0 ? 0 : (metrics.overdue / metrics.total) * 100,
      barColor: "bg-destructive"
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back, {user?.firstName}
              {viewAsUserId && <span className="ml-2 text-primary font-bold">(Viewing as: {activeUser?.firstName} {activeUser?.lastName})</span>}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user?.role === 'super_admin' && (
              <div className="flex items-center gap-2 mr-4">
                <span className="text-xs font-bold uppercase text-muted-foreground whitespace-nowrap">View As:</span>
                <Select
                  value={viewAsUserId || "current_user"}
                  onValueChange={(val) => setViewAsUserId(val === "current_user" ? null : val)}
                >
                  <SelectTrigger className="w-[180px] h-9 bg-card border-border">
                    <SelectValue placeholder="Switch Context" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current_user">Me ({user?.role})</SelectItem>
                    {hierarchyUsers
                      .filter(u => u._id !== user?._id)
                      .map(u => (
                        <SelectItem key={u._id} value={u._id}>
                          {u.firstName} {u.lastName} ({u.role})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => window.print()}>
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Dynamic Metric Cards with Trends and Progress Bars */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
                {stat.trend !== 0 && (
                  <div className={cn("flex items-center gap-1 text-xs font-medium rounded-full px-2 py-1",
                    stat.trend > 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
                    {stat.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(stat.trend)}% vs last wk
                  </div>
                )}
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm font-medium text-muted-foreground mt-1">{stat.label}</p>
              </div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn("h-full rounded-full transition-all duration-1000", stat.barColor)}
                  style={{ width: `${stat.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Analytics Visualizations - Hidden for Employees */}
        {user?.role !== 'employee' ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Pie Chart: Task Distribution */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-6 font-semibold text-foreground">Task Distribution</h3>
              <div className="h-[300px] w-full">
                {metrics.distribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.distribution}
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {metrics.distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">No tasks found</div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                {metrics.distribution.map((stat) => (
                  <div key={stat.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: stat.color }} />
                    <span className="text-sm font-medium text-muted-foreground">
                      {stat.name} ({stat.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Line Chart: Weekly Performance */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-6 font-semibold text-foreground">Weekly Performance</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.lineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="created" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Created" />
                    <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Completed" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-primary/5 p-8 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-foreground">Personal Focus Mode</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
              You are currently in personal focus mode. Detailed organization analytics are reserved for team leads and administrators.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
