import { useState, useEffect } from "react";
import SidebarLayout from "@/layouts/SidebarLayout";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/services/api";
import { Task } from "@/types";
import { format } from "date-fns";

const TaskMonitoring = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get(`/tasks/?page=${page}`);
            // Django Pagination vs Simple List
            if (Array.isArray(data)) {
                setTasks(data);
                setTotalPages(1);
            } else {
                setTasks(data.results || data.data || []);
                setTotalPages(Math.ceil((data.count || 0) / 10) || 1);
            }
        } catch (error) {
            toast.error("Failed to fetch tasks");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [page]);

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
                                <TableHead>Due Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.map((task) => (
                                <TableRow key={task.id}>
                                    <TableCell className="font-medium">{task.title}</TableCell>
                                    <TableCell>{task.assigned_to_name || 'Unassigned'}</TableCell>
                                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                                    <TableCell>{task.due_date ? format(new Date(task.due_date), 'PP') : 'No date'}</TableCell>
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

                {/* Pagination Controls */}
                <div className="flex justify-center flex-wrap gap-2 mt-4">
                    <Button
                        variant="outline"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        Previous
                    </Button>
                    <span className="flex items-center text-sm px-2 text-muted-foreground">
                        Page {page} of {Math.max(1, totalPages)}
                    </span>
                    <Button
                        variant="outline"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </SidebarLayout>
    );
};

export default TaskMonitoring;
