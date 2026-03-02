import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Project, User } from "@/types";
import { useData } from "@/context/DataContext";
import { HardHat, Shield, User as UserIcon, ShieldAlert } from "lucide-react";

interface ViewMembersModalProps {
    project: Project | null;
    onClose: () => void;
}

export const ViewMembersModal = ({ project, onClose }: ViewMembersModalProps) => {
    const { users } = useData();

    if (!project) return null;

    const members = (project.members || []).map((m: any) => {
        const id = typeof m === 'string' ? m : m.userId || m.user;
        const role = typeof m === 'string' ? 'employee' : m.role || 'employee';
        const user = users.find((u) => u._id === id || u.id === String(id));
        return { user, role };
    }).filter(m => m.user !== undefined);

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'super_admin': return <ShieldAlert className="h-4 w-4 text-primary" />;
            case 'admin': return <Shield className="h-4 w-4 text-purple-500" />;
            case 'manager': return <HardHat className="h-4 w-4 text-blue-500" />;
            default: return <UserIcon className="h-4 w-4 text-muted-foreground" />;
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Project Members</DialogTitle>
                    <DialogDescription>
                        Users currently assigned to this project.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 max-h-80 overflow-y-auto pr-2 py-4">
                    {members.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No members assigned to this project.</p>
                    ) : (
                        members.map(({ user: u, role }) => {
                            if (!u) return null;
                            return (
                                <div key={u.id || u._id as string} className="flex items-center justify-between p-3 rounded-md border border-border bg-card">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                            {(u.firstName?.[0] || u.first_name?.[0] || '') + (u.lastName?.[0] || u.last_name?.[0] || '')}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{u.firstName || u.first_name} {u.lastName || u.last_name}</p>
                                            <p className="text-xs text-muted-foreground">{u.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface text-xs font-medium capitalize">
                                        {getRoleIcon(role)}
                                        {role.replace('_', ' ')}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
