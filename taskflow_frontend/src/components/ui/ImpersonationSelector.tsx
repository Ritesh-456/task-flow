import { useState, useEffect } from "react";
import { User } from "@/types";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

export default function ImpersonationSelector() {
    const { user, impersonatedUser, setImpersonatedUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>("manager");
    const [targets, setTargets] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Only authorized roles can impersonate
    if (!user || !['super_admin', 'admin'].includes(user.role)) return null;

    useEffect(() => {
        if (!isOpen) return;
        const fetchTargets = async () => {
            setIsLoading(true);
            try {
                // Assuming we don't send the x-impersonate-user header for this specific call, 
                // but our API interceptor handles it globally. We want to fetch as the REAL user,
                // so we must temporarily strip the header or the backend handles req.realUser properly.
                // Our backend handles `req.realUser` logic so it's fine.
                const { data } = await api.get(`/accounts/users/?role=${selectedRole}`);
                // Handle paginated responses if necessary
                const userList = Array.isArray(data) ? data : (data.results || []);
                setTargets(userList);
            } catch (error) {
                console.error("Failed to fetch impersonation targets", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTargets();
    }, [isOpen, selectedRole]);

    const handleSelectUser = (target: User | null) => {
        if (!target) {
            // Revert to "Self"
            setImpersonatedUser(null);
            localStorage.removeItem("taskflow_impersonated_user");
            localStorage.removeItem("taskflow_impersonated_user_data");
        } else {
            setImpersonatedUser(target);
            localStorage.setItem("taskflow_impersonated_user", String(target.id));
            localStorage.setItem("taskflow_impersonated_user_data", JSON.stringify(target));
        }
        setIsOpen(false);
        // Force reload to completely refresh application state contexts (Dashboard data, projects, etc)
        window.location.reload();
    };

    const filteredTargets = targets.filter(t =>
        t.id !== user.id &&
        ((`${t.firstName || t.first_name || ''} ${t.lastName || t.last_name || ''}`).toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.email || '').toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs relative z-50 pointer-events-auto">
                    {impersonatedUser ? "Change Impersonation" : "Impersonate User"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3 relative z-50 pointer-events-auto" align="end">
                <div className="space-y-4">
                    <h4 className="font-medium text-sm">Select Context</h4>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder="Filter by Role" />
                        </SelectTrigger>
                        <SelectContent className="z-[60]">
                            {user.role === 'super_admin' && (
                                <>
                                    <SelectItem value="super_admin">Super Admins</SelectItem>
                                    <SelectItem value="admin">Admins</SelectItem>
                                </>
                            )}
                            {['super_admin', 'admin'].includes(user.role) && (
                                <SelectItem value="manager">Managers</SelectItem>
                            )}
                            {['super_admin', 'admin', 'manager'].includes(user.role) && (
                                <SelectItem value="employee">Employees</SelectItem>
                            )}
                        </SelectContent>
                    </Select>

                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 w-full rounded-md border border-border bg-surface pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <div className="max-h-[200px] overflow-y-auto space-y-1 rounded-md border border-border p-1">
                        <button
                            onClick={() => handleSelectUser(null)}
                            className="flex w-full items-center gap-3 rounded-sm p-2 text-left hover:bg-muted transition-colors border-b border-border/50 mb-1"
                        >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                                ME
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="truncate text-sm font-medium">Me (Original Context)</span>
                                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                            </div>
                        </button>

                        {isLoading ? (
                            <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                        ) : filteredTargets.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">No other users found.</div>
                        ) : (
                            filteredTargets.map(target => (
                                <button
                                    key={target.id}
                                    onClick={() => handleSelectUser(target)}
                                    className="flex w-full items-center gap-3 rounded-sm p-2 text-left hover:bg-muted transition-colors"
                                >
                                    {target.avatar ? (
                                        <img src={target.avatar} alt={`${target.firstName} ${target.lastName}`} className="h-8 w-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                                            {(target.firstName?.[0] || target.first_name?.[0] || target.email?.[0] || '?').toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="truncate text-sm font-medium">
                                            {target.firstName || ''} {target.lastName || ''}
                                            {(!target.firstName && !target.lastName) && ((target as any).name || 'Unknown User')}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">{target.email}</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
