import { useState, useEffect } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/services/api";
import { Folder, Plus } from "lucide-react";

interface Project {
    _id: string;
    name: string;
    description: string;
    status: string;
    members: any[];
}

export default function ProjectSettings() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data } = await api.get('/projects');
            setProjects(data);
        } catch (error) {
            toast.error("Failed to fetch projects");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateProject = async () => {
        const name = prompt("Enter project name:");
        if (!name) return;

        try {
            const { data } = await api.post('/projects', { name, description: 'New project' });
            setProjects([...projects, data]);
            toast.success("Project created");
        } catch (error) {
            toast.error("Failed to create project");
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        if (!confirm("Delete this project?")) return;
        try {
            await api.delete(`/projects/${projectId}`);
            setProjects(projects.filter(p => p._id !== projectId));
            toast.success("Project deleted");
        } catch (error) {
            toast.error("Failed to delete project");
        }
    };

    return (
        <SidebarLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Project Settings</h2>
                        <p className="text-muted-foreground">Manage your projects.</p>
                    </div>
                    <Button onClick={handleCreateProject}><Plus className="h-4 w-4 mr-2" /> New Project</Button>
                </div>

                <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Members</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
                                </TableRow>
                            ) : (
                                projects.map((project) => (
                                    <TableRow key={project._id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <Folder className="h-4 w-4 text-muted-foreground" />
                                            {project.name}
                                        </TableCell>
                                        <TableCell className="capitalize">{project.status}</TableCell>
                                        <TableCell>{project.members.length} members</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteProject(project._id)}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </SidebarLayout>
    );
}
