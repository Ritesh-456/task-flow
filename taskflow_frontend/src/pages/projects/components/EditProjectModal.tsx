import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Project } from "@/types";
import { useData } from "@/context/DataContext";

interface EditProjectModalProps {
    project: Project | null;
    onClose: () => void;
}

export const EditProjectModal = ({ project, onClose }: EditProjectModalProps) => {
    const { updateProject } = useData();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (project) {
            setName(project.name);
            setDescription(project.description || "");
        }
    }, [project]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!project || !name.trim()) return;

        updateProject(project.id || (project as any)._id, { name, description });
        onClose();
    };

    if (!project) return null;

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Project</DialogTitle>
                    <DialogDescription>Update project details.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="edit-name" className="text-sm font-medium">Name</label>
                        <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Project Name" required />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="edit-description" className="text-sm font-medium">Description</label>
                        <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Project Description" />
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
