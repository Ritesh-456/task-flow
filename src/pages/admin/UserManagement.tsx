import { useState, useEffect } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Trash2, UserCog } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { User, UserRole } from "@/types";

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get(`/admin/users?pageNumber=${page}`);
            setUsers(data.users);
            setPage(data.page);
            setTotalPages(data.pages);
        } catch (error) {
            toast.error("Failed to fetch users");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const handleRoleUpdate = async (userId: string, currentRole: string) => {
        const newRole = prompt("Enter new role (admin/manager/employee):", currentRole);
        if (!newRole || newRole === currentRole) return;

        if (!["admin", "manager", "employee"].includes(newRole)) {
            toast.error("Invalid role");
            return;
        }

        try {
            await api.put(`/admin/users/${userId}/role`, { role: newRole });
            toast.success("User role updated");
            fetchUsers();
        } catch (error) {
            toast.error("Failed to update role");
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        try {
            await api.delete(`/admin/users/${userId}`);
            toast.success("User deleted");
            fetchUsers();
        } catch (error) {
            toast.error("Failed to delete user");
        }
    };

    return (
        <SidebarLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                    <p className="text-muted-foreground">Manage users, roles, and access.</p>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user._id || user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell className="capitalize">{user.role}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRoleUpdate(user._id || user.id!, user.role as string)}
                                            >
                                                <UserCog className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(user._id || user.id!)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && users.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls could go here */}
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        disabled={page <= 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                        Previous
                    </Button>
                    <span className="flex items-center text-sm">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </SidebarLayout>
    );
};

export default UserManagement;
