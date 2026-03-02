import { useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import { FolderKanban, Users, Plus, MoreHorizontal, Edit, Trash2, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Project } from "@/types";

const Projects = () => {
  const { projects, users, addProject, updateProject, deleteProject, addProjectMember, removeProjectMember } = useData();
  const { user, activeRole } = useAuth();
  const navigate = useNavigate();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [assignUserId, setAssignUserId] = useState("");

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    addProject({
      name: projectName,
      description: projectDesc,
    } as Project);

    setProjectName("");
    setProjectDesc("");
    setIsCreateDialogOpen(false);
  };

  const handleEditClick = (project: Project) => {
    setSelectedProject(project);
    setProjectName(project.name);
    setProjectDesc(project.description || "");
    setIsEditDialogOpen(true);
  };

  const handleUpdateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !projectName.trim()) return;

    updateProject(selectedProject.id || (selectedProject as any)._id, {
      name: projectName,
      description: projectDesc,
    });

    setIsEditDialogOpen(false);
    setSelectedProject(null);
  };

  const handleDeleteConfirm = () => {
    if (!selectedProject) return;
    deleteProject(selectedProject.id || (selectedProject as any)._id);
    setIsDeleteDialogOpen(false);
    setSelectedProject(null);
  };

  const handleAssignMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !assignUserId) return;

    const projectId = selectedProject.id || (selectedProject as any)._id;
    addProjectMember(projectId, assignUserId, "employee");
    setIsAssignDialogOpen(false);
    setAssignUserId("");
  };

  const manageableUsers = users.filter(u => {
    if (activeRole === 'super_admin' || activeRole === 'admin') return true;
    if (activeRole === 'manager') {
      // Manager can only assign subordinates
      const currentId = user?._id || user?.id;
      return (u.role === 'employee') && (u.reportsTo === currentId || (u as any).reports_to === currentId);
    }
    return false;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Projects</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage and track your projects</p>
          </div>

          {activeRole !== "employee" && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <Button className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                New Project
              </Button>
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
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Project Name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="description" className="text-sm font-medium">Description</label>
                    <Textarea
                      id="description"
                      value={projectDesc}
                      onChange={(e) => setProjectDesc(e.target.value)}
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
            {activeRole !== "employee" && (activeRole !== "manager") && (
              <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-6 gap-2">
                <Plus className="h-4 w-4" />
                Create First Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const progress = (project.task_count || 0) > 0 ? Math.round(((project.completed_count || 0) / (project.task_count || 1)) * 100) : 0;
              const members = (project.members || []).map((m: any) => {
                const id = typeof m === 'string' ? m : m.userId || m.user;
                return users.find((u) => u._id === id || u.id === String(id));
              }).filter(Boolean);

              return (
                <div
                  key={project._id || project.id}
                  onClick={() => navigate(`/tasks?project=${project.id}`)}
                  className="group cursor-pointer rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                        <FolderKanban className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">{project.name}</h3>
                    </div>

                    {activeRole !== "employee" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="rounded p-1 text-muted-foreground transition-all hover:bg-surface group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {(activeRole === 'super_admin') && (
                            <>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditClick(project); }}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Project
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }}>
                                <UserPlus className="mr-2 h-4 w-4" /> Assign Admins
                              </DropdownMenuItem>
                            </>
                          )}
                          {(activeRole === 'super_admin' || activeRole === 'admin') && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }}>
                              <UserPlus className="mr-2 h-4 w-4" /> Assign Managers
                            </DropdownMenuItem>
                          )}
                          {activeRole === 'manager' && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedProject(project); setIsAssignDialogOpen(true); }}>
                              <UserPlus className="mr-2 h-4 w-4" /> Assign Employees
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }}>
                            <Users className="mr-2 h-4 w-4" /> View Members
                          </DropdownMenuItem>
                          {activeRole === 'super_admin' && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => { e.stopPropagation(); setSelectedProject(project); setIsDeleteDialogOpen(true); }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Project
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                          title={`${member!.firstName} ${member!.lastName}`}
                        >
                          {(member!.firstName?.[0] || member!.first_name?.[0] || '') + (member!.lastName?.[0] || member!.last_name?.[0] || '')}
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
                      <span className="text-xs font-medium">{project.members?.length || 0}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update project details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateProject} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="edit-name" className="text-sm font-medium">Name</label>
                <Input
                  id="edit-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Project Name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-description" className="text-sm font-medium">Description</label>
                <Textarea
                  id="edit-description"
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="Project Description"
                />
              </div>
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the project
                and all of its associated tasks.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedProject(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete Project
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Assign Member Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Assign Team Member</DialogTitle>
              <DialogDescription>
                Assign an employee to this project.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAssignMember} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="user-select" className="text-sm font-medium">Select Employee</label>
                <select
                  id="user-select"
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                >
                  <option value="">Select an employee...</option>
                  {manageableUsers.map(u => (
                    <option key={u._id || u.id} value={u._id || u.id}>
                      {u.firstName || u.first_name} {u.lastName || u.last_name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
              <DialogFooter>
                <Button type="submit">Assign to Project</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Projects;
