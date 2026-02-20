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

    const fetchProjects = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get("/admin/projects");
            setProjects(data.data || []);
        } catch (error) {
            toast.error("Failed to fetch projects");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

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
                                <TableRow key={project._id || project.id}>
                                    <TableCell className="font-medium whitespace-nowrap">{project.name}</TableCell>
                                    <TableCell className="whitespace-nowrap">{(project.owner as any)?.name || 'Unknown'}</TableCell>
                                    <TableCell className="capitalize whitespace-nowrap">{project.status || 'Active'}</TableCell>
                                    <TableCell className="text-right whitespace-nowrap">{project.taskCount || 0}</TableCell>
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
            </div>
        </SidebarLayout>
    );
};

export default ProjectManagement;
