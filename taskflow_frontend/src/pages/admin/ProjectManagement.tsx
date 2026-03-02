import { useState, useEffect } from "react";
import SidebarLayout from "@/layouts/SidebarLayout";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import api from "@/services/api";
import { Project } from "@/types";

const ProjectManagement = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchProjects = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get(`/projects/?page=${page}`);
            // Django Pagination vs Simple List
            if (Array.isArray(data)) {
                setProjects(data);
                setTotalPages(1);
            } else {
                setProjects(data.results || data.data || []);
                setTotalPages(Math.ceil((data.count || 0) / 10) || 1);
            }
        } catch (error) {
            toast.error("Failed to fetch projects");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [page]);

    return (
        <SidebarLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Project Management</h2>
                    <p className="text-muted-foreground">Overview of all projects in the organization.</p>
                </div>

                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="whitespace-nowrap">Project Name</TableHead>
                                <TableHead className="whitespace-nowrap">Owner</TableHead>
                                <TableHead className="whitespace-nowrap">Status</TableHead>
                                <TableHead className="text-right whitespace-nowrap">Task Count</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projects.map((project) => (
                                <TableRow key={project.id}>
                                    <TableCell className="font-medium whitespace-nowrap">{project.name}</TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {project.created_by_name || 'Unknown'}
                                    </TableCell>
                                    <TableCell className="capitalize whitespace-nowrap">{project.status || 'Active'}</TableCell>
                                    <TableCell className="text-right whitespace-nowrap">{project.task_count || 0}</TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && projects.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No projects found.
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

export default ProjectManagement;
