import { Task, TaskStatus } from "@/types";
import TaskCard from "./TaskCard";
import { cn } from "@/lib/utils";
import { Droppable } from "@hello-pangea/dnd";
import { ClipboardList } from "lucide-react";

const statusConfig: Record<TaskStatus, { label: string; dotClass: string }> = {
  todo: { label: "To Do", dotClass: "bg-muted-foreground" },
  "in-progress": { label: "In Progress", dotClass: "bg-warning" },
  done: { label: "Done", dotClass: "bg-success" },
};

const KanbanColumn = ({ status, tasks }: { status: TaskStatus; tasks: Task[] }) => {
  const config = statusConfig[status];

  return (
    <div className="flex w-full md:min-w-[280px] md:w-80 flex-1 flex-col">
      <div className="mb-3 flex items-center gap-2 px-1">
        <div className={cn("h-2 w-2 rounded-full", config.dotClass)} />
        <h3 className="text-sm font-semibold text-foreground">{config.label}</h3>
        <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex flex-col gap-2 rounded-xl bg-muted/50 p-2 min-h-[200px] transition-colors border border-border/50",
              snapshot.isDraggingOver && "bg-muted/80 ring-2 ring-primary/20"
            )}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-border/50 rounded-lg m-2 bg-background/50">
                <ClipboardList className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm font-medium text-muted-foreground/50">No Tasks</p>
                <p className="text-xs text-muted-foreground/40 mt-1">Drag and drop here</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
