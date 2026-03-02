import { useState, useEffect } from "react";
import SidebarLayout from "@/layouts/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Users, Link as LinkIcon, MessageSquare, Mail, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function TeamManagement() {
    const { activeRole } = useAuth();

    const [selectedRole, setSelectedRole] = useState("employee");
    const [email, setEmail] = useState("");
    const [teamId, setTeamId] = useState("");
    const [projects, setProjects] = useState<any[]>([]);
    const [invites, setInvites] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [generatedInvite, setGeneratedInvite] = useState<{
        code: string;
        link: string;
        whatsappMessage: string;
        message: string;
        email: string;
    } | null>(null);

    const [isGenerating, setIsGenerating] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    const canInviteAdmin = activeRole === "super_admin";
    const canInviteManagerAndBelow = activeRole === "admin" || activeRole === "super_admin";

    const ROLES = [
        ...(canInviteAdmin ? [{ value: "admin", label: "Admin" }] : []),
        ...(canInviteManagerAndBelow ? [{ value: "manager", label: "Manager" }] : []),
        ...(canInviteManagerAndBelow ? [{ value: "employee", label: "Employee" }] : []),
    ];

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [projectsRes, invitesRes] = await Promise.all([
                api.get("/projects/"),
                api.get("/accounts/invites/")
            ]);
            setProjects(projectsRes.data);
            setInvites(invitesRes.data);
        } catch (error) {
            console.error("Failed to fetch dashboard config", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (activeRole !== "manager" && activeRole !== "employee") {
            fetchData();
        }
    }, [activeRole]);

    const handleGenerateInvite = async () => {
        setIsGenerating(true);
        try {
            const payload: any = { role: selectedRole };
            if (email) payload.email = email;
            if (teamId) payload.team_id = teamId;

            const response = await api.post("/accounts/invites/generate/", payload);
            const data = response.data;

            setGeneratedInvite({
                code: data.code,
                link: data.invite_link,
                whatsappMessage: data.whatsapp_link,
                message: data.message,
                email: data.email || ""
            });

            toast.success("Invite generated successfully");
            fetchData(); // refresh history
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to generate invite");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSendEmail = async () => {
        if (!generatedInvite?.email) {
            toast.error("No email address was provided for this invite.");
            return;
        }
        setIsSendingEmail(true);
        try {
            await api.post("/accounts/invites/send-email/", {
                email: generatedInvite.email,
                message: generatedInvite.message
            });
            toast.success("Email sent successfully!");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to send email");
        } finally {
            setIsSendingEmail(false);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    if (activeRole === "manager" || activeRole === "employee") {
        return (
            <SidebarLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <div className="text-center">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                        <h2 className="text-xl font-semibold">Access Denied</h2>
                        <p className="text-muted-foreground mt-2">You do not have permission to manage team invitations.</p>
                    </div>
                </div>
            </SidebarLayout>
        );
    }

    return (
        <SidebarLayout>
            <div className="space-y-6 pb-12">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Team Management</h2>
                    <p className="text-muted-foreground">Invite new members to join your workspace.</p>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Generate New Invite</CardTitle>
                            <CardDescription>
                                Create a secure, one-time use invite link. Optional fields help with auto-assignment.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="role">Select Role *</Label>
                                <select
                                    id="role"
                                    name="role"
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    {ROLES.map((role) => (
                                        <option key={role.value} value={role.value}>
                                            {role.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address (Optional)</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="colleague@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <p className="text-[0.8rem] text-muted-foreground">
                                    If provided, you can email the invite directly.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="team">Assign to Project/Team (Optional)</Label>
                                <select
                                    id="team"
                                    name="team"
                                    value={teamId}
                                    onChange={(e) => setTeamId(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="">-- None --</option>
                                    {projects.map((project) => (
                                        <option key={project.id} value={project.id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Button
                                onClick={handleGenerateInvite}
                                disabled={isGenerating || ROLES.length === 0}
                                className="w-full gap-2 mt-4"
                            >
                                <LinkIcon className="h-4 w-4" />
                                {isGenerating ? "Generating..." : "Generate Invite Link"}
                            </Button>
                        </CardContent>
                    </Card>

                    {generatedInvite && (
                        <Card className="border-primary/50 shadow-sm flex flex-col h-full animate-in fade-in slide-in-from-bottom-4">
                            <CardHeader>
                                <CardTitle className="text-primary flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    Invite Ready
                                </CardTitle>
                                <CardDescription>
                                    Share the link, code, or send it directly. Valid for 48 hours.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 flex-1 flex flex-col">
                                <div className="rounded-md bg-muted p-4 space-y-3">
                                    <div className="flex justify-between items-center sm:flex-row flex-col gap-2 bg-background p-2 rounded border">
                                        <code className="text-sm break-all font-mono">{generatedInvite.link}</code>
                                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedInvite.link, "Link")}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex justify-between items-center bg-background p-2 rounded border">
                                        <code className="text-sm font-mono font-bold tracking-widest">{generatedInvite.code}</code>
                                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedInvite.code, "Code")}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="pt-2 space-y-3 mt-auto">
                                    {generatedInvite.email && (
                                        <Button
                                            className="w-full gap-2"
                                            variant="default"
                                            onClick={handleSendEmail}
                                            disabled={isSendingEmail}
                                        >
                                            <Mail className="h-4 w-4" />
                                            {isSendingEmail ? "Sending..." : `Send Email to ${generatedInvite.email}`}
                                        </Button>
                                    )}
                                    <Button
                                        className="w-full gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white"
                                        onClick={() => window.open(generatedInvite.whatsappMessage, "_blank")}
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                        Share via WhatsApp
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Invite History</CardTitle>
                            <CardDescription>Recently generated invites and their current status.</CardDescription>
                        </div>
                        <Button variant="outline" size="icon" onClick={fetchData} disabled={isLoading}>
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Expires</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invites.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                                            No invites found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {invites.map((inv) => (
                                    <TableRow key={inv.id}>
                                        <TableCell className="font-mono">{inv.code}</TableCell>
                                        <TableCell className="capitalize">{inv.role}</TableCell>
                                        <TableCell>{inv.email || "N/A"}</TableCell>
                                        <TableCell>
                                            {inv.is_used ? (
                                                <Badge variant="secondary">Used</Badge>
                                            ) : new Date(inv.expires_at) < new Date() ? (
                                                <Badge variant="destructive">Expired</Badge>
                                            ) : (
                                                <Badge variant="default" className="bg-green-500 hover:bg-green-600">Pending</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{new Date(inv.expires_at).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </SidebarLayout>
    );
}
