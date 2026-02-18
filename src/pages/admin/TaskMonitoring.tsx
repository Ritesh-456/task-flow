import { useState, useEffect } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/services/api";
import { Task } from "@/types";
import { format } from "date-fns";

const TaskMonitoring = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            // In a real app, this would be /admin/tasks with filters
            // For now reusing project tasks or creating a new endpoint
            const { data } = await api.get("/admin/tasks");
            setTasks(data);
        } catch (error) {
            toast.error("Failed to fetch tasks");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "done":
                return <Badge className="bg-green-500">Done</Badge>;
            case "in-progress":
                return <Badge className="bg-blue-500">In Progress</Badge>;
            default:
                return <Badge variant="secondary">Todo</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case "high":
                return <Badge variant="destructive">High</Badge>;
            case "medium":
                return <Badge className="bg-orange-500">Medium</Badge>;
            default:
                return <Badge variant="outline">Low</Badge>;
        }
    };

    return (
        <SidebarLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Task Monitoring</h2>
                    <p className="text-muted-foreground">Monitor all tasks across the organization.</p>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Deadline</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.map((task) => (
                                <TableRow key={task._id || task.id}>
                                    <TableCell className="font-medium">{task.title}</TableCell>
                                    <TableCell>{(task.assignedTo as any)?.name || 'Unassigned'}</TableCell>
                                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                                    <TableCell>{format(new Date(task.deadline), 'PP')}</TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && tasks.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No tasks found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </SidebarLayout>
    );
};

export default TaskMonitoring;
