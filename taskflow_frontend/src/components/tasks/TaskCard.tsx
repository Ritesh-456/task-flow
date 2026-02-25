import { Task } from "@/types";
import { useData } from "@/context/DataContext";
import { cn } from "@/lib/utils";
import { Calendar, User, MessageSquare } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const priorityStyles: Record<string, string> = {
  high: "bg-destructive/15 text-destructive font-bold",
  medium: "bg-warning/15 text-warning font-bold",
  low: "bg-success/15 text-success font-bold",
  default: "bg-muted text-muted-foreground"
};

const TaskCard = ({ task, index }: { task: Task; index: number }) => {
  const { users, projects, updateTask } = useData();
  const { user } = useAuth();
  const assignee = users.find((u) => u._id === task.assignedTo || u.id === task.assignedTo);
  const project = projects.find((p) => p._id === task.projectId || p.id === task.projectId);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckboxChange = (checked: boolean) => {
    // Only Employees / Assigned users should realistically complete it via quick-check
    if (checked) {
      setIsCommentDialogOpen(true);
    }
  };

  const submitCompletion = async () => {
    if (!commentText.trim()) {
      toast.error("Please enter a comment detailing the work done.");
      return;
    }
    setIsSubmitting(true);
    try {
      await updateTask(task._id || task.id, { status: 'done', comment: commentText });
      setIsCommentDialogOpen(false);
      setCommentText("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Draggable draggableId={task._id || task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "group animate-fade-in rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5",
            snapshot.isDragging && "shadow-lg ring-2 ring-primary/20 rotate-2"
          )}
          style={provided.draggableProps.style}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase", priorityStyles[task.priority])}>
              {task.priority}
            </span>
            {task.status !== 'done' && (
              <div className="flex items-center space-x-2" onPointerDown={(e) => e.stopPropagation()}>
                <Checkbox id={`check-${task._id || task.id}`} onCheckedChange={handleCheckboxChange} />
              </div>
            )}
            {task.status === 'done' && (
              <div className="flex items-center space-x-2" onPointerDown={(e) => e.stopPropagation()}>
                <Checkbox id={`check-${task._id || task.id}`} checked={true} disabled />
              </div>
            )}
          </div>
          <h4 className={cn("mb-1 text-sm font-medium", task.status === 'done' ? "line-through text-muted-foreground" : "text-foreground")}>{task.title}</h4>
          {project && (
            <div className="mb-1.5 flex items-center text-[11px] font-medium text-primary/80">
              <span className="mr-1 opacity-70">Project:</span> {project.name}
            </div>
          )}
          <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
          {task.comments && task.comments.length > 0 && (
            <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              <span>{task.comments.length} Update{task.comments.length !== 1 ? 's' : ''}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : 'No date'}
            </div>
            {assignee && (
              <div className="flex items-center gap-1.5">
                {assignee.avatar ? (
                  <img src={assignee.avatar} alt={`${assignee.firstName}`} className="h-5 w-5 rounded-full object-cover" />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[9px] font-semibold text-primary">
                    {assignee.firstName?.[0] || '?'}{assignee.lastName?.[0] || ''}
                  </div>
                )}
              </div>
            )}
          </div>
          <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
            <DialogContent onPointerDown={(e) => e.stopPropagation()}>
              <DialogHeader>
                <DialogTitle>Complete Task</DialogTitle>
                <DialogDescription>
                  Please document what work was done for this task before marking it as completed.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Textarea
                  placeholder="What work was done?"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCommentDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <Button onClick={submitCompletion} disabled={isSubmitting || !commentText.trim()}>
                  {isSubmitting ? "Saving..." : "Mark as Completed"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
