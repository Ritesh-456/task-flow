import { useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import { FolderKanban, Users, Plus, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Projects = () => {
  const { projects, users, addProject } = useData();
  const { user, activeRole } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProject = {
      id: `p${Date.now()}`,
      name: newProjectName,
      description: newProjectDesc,
      members: [user?.id || "u1"], // Default to current user
      createdBy: user?.id || "u1",
      createdAt: new Date().toISOString().split('T')[0],
      taskCount: 0,
      completedCount: 0,
    };

    addProject(newProject);
    toast.success("Project created successfully");
    setNewProjectName("");
    setNewProjectDesc("");
    setIsDialogOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Projects</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage and track your projects</p>
          </div>

          {activeRole !== "employee" && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Add a new project to your workspace.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateProject} className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                    <Input
                      id="name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Project Name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="description" className="text-sm font-medium">Description</label>
                    <Textarea
                      id="description"
                      value={newProjectDesc}
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                      placeholder="Project Description"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Project</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-lg bg-surface/50">
            <FolderKanban className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground">No Projects Yet</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">Create your first project to start organizing tasks and collaborating with your team.</p>
            {activeRole !== "employee" && (
              <Button onClick={() => setIsDialogOpen(true)} className="mt-6 gap-2">
                <Plus className="h-4 w-4" />
                Create First Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const progress = project.taskCount > 0 ? Math.round((project.completedCount / project.taskCount) * 100) : 0;
              // Map member IDs to user objects
              const members = project.members.map((id) => users.find((u) => u.id === id)).filter(Boolean);

              return (
                <Link
                  key={project._id || project.id}
                  to={`/tasks?project=${project.id}`}
                  className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                        <FolderKanban className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">{project.name}</h3>
                    </div>
                    {activeRole !== "employee" && (
                      <button className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-surface group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <p className="mb-4 line-clamp-2 text-xs text-muted-foreground">{project.description}</p>

                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{progress}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-1.5">
                      {members.slice(0, 3).map((member) => (
                        <div
                          key={member!._id || member!.id}
                          className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-primary/20 text-[8px] font-semibold text-primary"
                          title={member!.name}
                        >
                          {member!.name.substring(0, 2).toUpperCase()}
                        </div>
                      ))}
                      {members.length > 3 && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-surface text-[8px] font-medium text-muted-foreground">
                          +{members.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">{project.members.length}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Projects;
