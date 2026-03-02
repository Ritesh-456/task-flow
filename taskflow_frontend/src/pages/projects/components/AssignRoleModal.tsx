import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Project, User } from "@/types";
import { useData } from "@/context/DataContext";
import api from "@/services/api";
import { toast } from "sonner";
import { Check } from "lucide-react";

interface AssignRoleModalProps {
    project: Project | null;
    onClose: () => void;
    roleToAssign: "admin" | "manager" | "employee";
}

export const AssignRoleModal = ({ project, onClose, roleToAssign }: AssignRoleModalProps) => {
    const { loadData } = useData();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await api.get(`/accounts/users/?role=${roleToAssign}`);
                setUsers(data);
            } catch (error) {
                toast.error("Failed to load users for assignment.");
            }
        };
        if (project) {
            fetchUsers();
        }
    }, [project, roleToAssign]);

    const toggleUser = (userId: string) => {
        setSelectedUserIds((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!project || selectedUserIds.length === 0) return;

        setLoading(true);
        try {
            const projectId = project.id || (project as any)._id;
            await api.post(`/projects/${projectId}/assign/`, {
                userIds: selectedUserIds,
                role: roleToAssign
            });
            toast.success(`Successfully assigned ${roleToAssign}s to project.`);
            await loadData();
            onClose();
        } catch (error) {
            toast.error("Failed to assign members.");
        } finally {
            setLoading(false);
        }
    };

    if (!project) return null;

    const roleText = roleToAssign.charAt(0).toUpperCase() + roleToAssign.slice(1) + "s";

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Assign {roleText}</DialogTitle>
                    <DialogDescription>Select the users you want to assign to this project as a {roleToAssign}.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2 max-h-60 overflow-y-auto pr-2">
                        {users.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No eligible {roleText.toLowerCase()} found.</p>
                        ) : (
                            users.map((u) => {
                                const id = u.id || u._id as string;
                                const isSelected = selectedUserIds.includes(id);
                                return (
                                    <div
                                        key={id}
                                        onClick={() => toggleUser(id)}
                                        className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-surface'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                                {(u.firstName?.[0] || u.first_name?.[0] || '') + (u.lastName?.[0] || u.last_name?.[0] || '')}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{u.firstName || u.first_name} {u.lastName || u.last_name}</p>
                                                <p className="text-xs text-muted-foreground">{u.email}</p>
                                            </div>
                                        </div>
                                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                        <Button type="submit" disabled={loading || selectedUserIds.length === 0}>Assign Selected</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
