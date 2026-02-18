import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import KanbanColumn from "@/components/KanbanColumn";
import { TaskStatus, TaskPriority } from "@/types";
import { Plus, Filter } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const statuses: TaskStatus[] = ["todo", "in-progress", "done"];

const TaskBoard = () => {
  const { tasks, projects, addTask, updateTask, users } = useData();
  const { user } = useAuth();

  const [searchParams] = useSearchParams();
  const projectFilter = searchParams.get("project");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Add Task State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>("");
  const [newTaskProject, setNewTaskProject] = useState<string>(projectFilter || "");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");

  let filteredTasks = projectFilter
    ? tasks.filter((t) => t.projectId === projectFilter)
    : tasks;

  if (priorityFilter !== "all") {
    filteredTasks = filteredTasks.filter((t) => t.priority === priorityFilter);
  }

  const currentProject = projectFilter ? projects.find((p) => p.id === projectFilter) : null;

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const task = tasks.find((t) => t.id === draggableId);
    if (!task) return;

    if (task.status !== destination.droppableId) {
      updateTask(task.id, { status: destination.droppableId as TaskStatus });
    }

    // Note: Reordering within the same column is not implemented in logic/storage yet
    // because our data source is a flat array and filtering happens on render.
    // To support reordering, we'd need an 'order' field in Task or manage per-column lists.
    // For now, simpler DnD just changing status is sufficient for this scope.
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: `t${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDesc,
      status: "todo" as TaskStatus,
      priority: newTaskPriority,
      deadline: newTaskDeadline || new Date().toISOString().split('T')[0],
      assignedTo: newTaskAssignee || user?.id || "u1",
      createdBy: user?.id || "u1",
      projectId: newTaskProject || (projects[0]?.id || ""),
    };

    addTask(newTask);
    toast.success("Task created successfully");

    // Reset form
    setNewTaskTitle("");
    setNewTaskDesc("");
    setIsDialogOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {currentProject ? currentProject.name : "All Tasks"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {currentProject ? currentProject.description : "Kanban board view of all tasks"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-9 rounded-md border border-border bg-surface px-3 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>Add a new task to the board.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTask} className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="title" className="text-sm font-medium">Title</label>
                    <Input id="title" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} required />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="desc" className="text-sm font-medium">Description</label>
                    <Textarea id="desc" value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Priority</label>
                      <Select value={newTaskPriority} onValueChange={(v: any) => setNewTaskPriority(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Project</label>
                      <Select value={newTaskProject} onValueChange={setNewTaskProject} disabled={!!projectFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Assign To</label>
                      <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map(u => (
                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Deadline</label>
                      <Input type="date" value={newTaskDeadline} onChange={(e) => setNewTaskDeadline(e.target.value)} />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="submit">Create Task</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
            {statuses.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={filteredTasks.filter((t) => t.status === status)}
              />
            ))}
          </div>
        </DragDropContext>
      </div>
    </AppLayout>
  );
};

export default TaskBoard;
