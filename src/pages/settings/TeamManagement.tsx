import { useState, useEffect } from "react";
import SidebarLayout from "@/layouts/SidebarLayout";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/services/api";
import { User as UserIcon, Copy, RefreshCw, Users } from "lucide-react";
import { User } from "@/types";
import { useAuth } from "@/context/AuthContext";

export default function TeamManagement() {
    const { user, updateUser } = useAuth();
    const [teamMembers, setTeamMembers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inviteCode, setInviteCode] = useState<string | null>(user?.inviteCode || null);

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            let endpoint = '/users/team-members';
            // If super admin, maybe fetch all users or teams? For now let's stick to team members or subordinates
            // The userController has getTeamMembers and getSubordinates.
            // Let's use getTeamMembers for now as a default for Team Admins.
            // For Managers, maybe getSubordinates?

            if (user.role === 'super_admin') {
                endpoint = '/users'; // Super admin sees all
            } else if (user.role === 'manager') {
                endpoint = '/users/subordinates';
            }

            const { data } = await api.get(endpoint);
            setTeamMembers(data);
        } catch (error) {
            console.error("Failed to fetch team members", error);
            // toast.error("Failed to fetch team members");
        } finally {
            setIsLoading(false);
        }
    };

    const generateInvite = async () => {
        try {
            const { data } = await api.post('/users/invite');
            setInviteCode(data.inviteCode);
            updateUser({ inviteCode: data.inviteCode });
            toast.success("New invite code generated");
        } catch (error) {
            toast.error("Failed to generate invite code");
        }
    };

    const copyInviteCode = () => {
        if (inviteCode) {
            navigator.clipboard.writeText(inviteCode);
            toast.success("Invite code copied to clipboard");
        }
    };

    const canInvite = ['super_admin', 'team_admin', 'manager'].includes(user?.role || '');

    return (
        <SidebarLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Team & Hierarchy</h2>
                    <p className="text-muted-foreground">Manage your team members and invite new users.</p>
                </div>

                {canInvite && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Invite New Members</CardTitle>
                            <CardDescription>
                                Share this code with new users to automatically add them to your team hierarchy.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center gap-4">
                            <div className="flex-1 rounded-md border bg-muted p-3 font-mono text-lg text-center tracking-wider">
                                {inviteCode || "No Active Code"}
                            </div>
                            <Button variant="outline" size="icon" onClick={copyInviteCode} disabled={!inviteCode}>
                                <Copy className="h-4 w-4" />
                            </Button>
                            <Button onClick={generateInvite}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Generate New Code
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Team Members
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
                                    </TableRow>
                                ) : teamMembers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            No team members found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    teamMembers.map((member) => (
                                        <TableRow key={member._id}>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">
                                                    {member.avatar ? <img src={member.avatar} className="rounded-full" /> : member.name.charAt(0)}
                                                </div>
                                                {member.name}
                                            </TableCell>
                                            <TableCell>{member.email}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {member.role.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={member.isActive ? "default" : "destructive"}>
                                                    {member.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </SidebarLayout>
    );
}
