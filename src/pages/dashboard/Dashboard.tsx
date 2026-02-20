import AppLayout from "@/layouts/AppLayout";
import { CheckCircle2, Clock, AlertTriangle, FolderKanban, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";

const Dashboard = () => {
  const { tasks, projects, users } = useData();
  const { user } = useAuth();

  const stats = [
    {
      label: "Total Tasks",
      value: tasks.length,
      icon: CheckCircle2,
      color: "text-primary bg-primary/10",
    },
    {
      label: "In Progress",
      value: tasks.filter((t) => t.status === "in-progress").length,
      icon: Clock,
      color: "text-warning bg-warning/10",
    },
    {
      label: "Completed",
      value: tasks.filter((t) => t.status === "done").length,
      icon: TrendingUp,
      color: "text-success bg-success/10",
    },
    {
      label: "High Priority",
      value: tasks.filter((t) => t.priority === "high").length,
      icon: AlertTriangle,
      color: "text-destructive bg-destructive/10",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Overview of your projects and tasks</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Tasks & Projects */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Tasks */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Recent Tasks</h2>
            </div>
            <div className="divide-y divide-border">
              {tasks.slice(0, 5).map((task) => {
                const assignee = users.find((u) => u.id === task.assignedTo);
                return (
                  <div key={task._id || task.id} className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-surface/50">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      task.status === "done" ? "bg-success" : task.status === "in-progress" ? "bg-warning" : "bg-muted-foreground"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{projects.find(p => p.id === task.projectId)?.name}</p>
                    </div>
                    <span className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                      task.priority === "high" ? "bg-priority-high/15 text-priority-high" :
                        task.priority === "medium" ? "bg-priority-medium/15 text-priority-medium" :
                          "bg-priority-low/15 text-priority-low"
                    )}>
                      {task.priority}
                    </span>
                    {assignee && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[9px] font-semibold text-primary">
                        {assignee.avatar}
                      </div>
                    )}
                  </div>
                );
              })}
              {tasks.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No recent tasks
                </div>
              )}
            </div>
          </div>

          {/* Projects */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Active Projects</h2>
            </div>
            <div className="divide-y divide-border">
              {projects.map((project) => {
                // Calculate progress dynamically if redundant properties are not relied upon OR if we trust DataContext to update them
                // DataContext updates taskCount and completedCount.
                const progress = project.taskCount > 0 ? Math.round((project.completedCount / project.taskCount) * 100) : 0;
                return (
                  <div key={project._id || project.id} className="px-5 py-4 transition-colors hover:bg-surface/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-medium text-foreground">{project.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {project.members.length}
                      </div>
                    </div>
                    <p className="mb-3 text-xs text-muted-foreground">{project.description}</p>
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{progress}%</span>
                    </div>
                  </div>
                );
              })}
              {projects.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No active projects
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
export default Dashboard;
