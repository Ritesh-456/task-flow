import { Task } from "@/types";
import { useData } from "@/context/DataContext";
import { cn } from "@/lib/utils";
import { Calendar, User } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";

const priorityStyles = {
  high: "bg-priority-high/15 text-priority-high",
  medium: "bg-priority-medium/15 text-priority-medium",
  low: "bg-priority-low/15 text-priority-low",
};

const TaskCard = ({ task, index }: { task: Task; index: number }) => {
  const { users } = useData();
  const assignee = users.find((u) => u.id === task.assignedTo);

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
          <div className="mb-2 flex items-center gap-2">
            <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase", priorityStyles[task.priority])}>
              {task.priority}
            </span>
          </div>
          <h4 className="mb-1 text-sm font-medium text-foreground">{task.title}</h4>
          <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
            {assignee && (
              <div className="flex items-center gap-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[9px] font-semibold text-primary">
                  {assignee.avatar}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
