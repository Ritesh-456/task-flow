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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Project } from "@/types";

// Import Modals
import { EditProjectModal } from "./components/EditProjectModal";
import { AssignRoleModal } from "./components/AssignRoleModal";
import { ViewMembersModal } from "./components/ViewMembersModal";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";

type ModalType = "edit" | "assign_admins" | "assign_managers" | "assign_employees" | "view_members" | "delete" | null;

const Projects = () => {
  const { projects, users, addProject } = useData();
  const { activeRole } = useAuth();
  const navigate = useNavigate();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");

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

  const handleMenuClick = (e: React.MouseEvent, project: Project, type: ModalType) => {
    e.stopPropagation();
    setSelectedProject(project);
    setModalType(type);
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
            {activeRole !== "employee" && activeRole !== "manager" && (
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
                      <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded p-1 text-muted-foreground transition-all hover:bg-surface group-hover:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {activeRole === 'super_admin' && (
                              <>
                                <DropdownMenuItem onClick={(e) => handleMenuClick(e, project, "edit")}>
                                  <Edit className="mr-2 h-4 w-4" /> Edit Project
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => handleMenuClick(e, project, "assign_admins")}>
                                  <UserPlus className="mr-2 h-4 w-4" /> Assign Admins
                                </DropdownMenuItem>
                              </>
                            )}
                            {(activeRole === 'super_admin' || activeRole === 'admin') && (
                              <DropdownMenuItem onClick={(e) => handleMenuClick(e, project, "assign_managers")}>
                                <UserPlus className="mr-2 h-4 w-4" /> Assign Managers
                              </DropdownMenuItem>
                            )}
                            {(activeRole === 'super_admin' || activeRole === 'admin' || activeRole === 'manager') && (
                              <DropdownMenuItem onClick={(e) => handleMenuClick(e, project, "assign_employees")}>
                                <UserPlus className="mr-2 h-4 w-4" /> Assign Employees
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={(e) => handleMenuClick(e, project, "view_members")}>
                              <Users className="mr-2 h-4 w-4" /> View Members
                            </DropdownMenuItem>
                            {activeRole === 'super_admin' && (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => handleMenuClick(e, project, "delete")}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Project
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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

        {/* Dynamic Modals Rendering */}
        {modalType === "edit" && <EditProjectModal project={selectedProject} onClose={() => setModalType(null)} />}
        {modalType === "assign_admins" && <AssignRoleModal project={selectedProject} onClose={() => setModalType(null)} roleToAssign="admin" />}
        {modalType === "assign_managers" && <AssignRoleModal project={selectedProject} onClose={() => setModalType(null)} roleToAssign="manager" />}
        {modalType === "assign_employees" && <AssignRoleModal project={selectedProject} onClose={() => setModalType(null)} roleToAssign="employee" />}
        {modalType === "view_members" && <ViewMembersModal project={selectedProject} onClose={() => setModalType(null)} />}
        {modalType === "delete" && <DeleteConfirmModal project={selectedProject} onClose={() => setModalType(null)} />}

      </div>
    </AppLayout>
  );
};

export default Projects;
