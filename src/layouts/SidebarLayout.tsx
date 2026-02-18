import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
    User,
    Settings,
    Shield,
    Bell,
    Layout,
    Users,
    Activity,
    Folder
} from "lucide-react";
import AppLayout from "./AppLayout";

interface SidebarLayoutProps {
    children: React.ReactNode;
}

const sidebarItems = [
    { icon: User, label: "Profile", href: "/settings" },
    { icon: Shield, label: "Account", href: "/settings/account" },
    { icon: Layout, label: "Preferences", href: "/settings/preferences" },
    { icon: Bell, label: "Notifications", href: "/settings/notifications" },
    { icon: Shield, label: "Security", href: "/settings/security" },
    { icon: Activity, label: "Activity Logs", href: "/settings/activity" },
];

const adminItems = [
    { icon: Layout, label: "Admin Dashboard", href: "/admin" },
    { icon: Activity, label: "Analytics", href: "/analytics" },
    { icon: Users, label: "User Management", href: "/admin/users" },
    { icon: Folder, label: "Project Management", href: "/admin/projects" },
    { icon: Settings, label: "Task Monitoring", href: "/admin/tasks" },
];

export default function SidebarLayout({ children }: SidebarLayoutProps) {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin' || user?.role === 'manager'; // Simple check, refine as needed for specific items

    return (
        <AppLayout>
            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                <aside className="md:w-1/3 lg:w-1/4 shrink-0">
                    <nav className="flex flex-row md:flex-col flex-wrap gap-2 pb-4 md:pb-0">
                        {sidebarItems.map((item) => (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap",
                                    location.pathname === item.href || (item.href !== "/settings" && location.pathname.startsWith(item.href))
                                        ? "bg-accent text-accent-foreground"
                                        : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        ))}

                        {isAdmin && (
                            <>
                                <div className="my-2 border-t border-border hidden md:block" />
                                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:block">
                                    Admin
                                </div>
                                {adminItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        className={cn(
                                            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap",
                                            location.pathname === item.href
                                                ? "bg-accent text-accent-foreground"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                ))}
                            </>
                        )}
                    </nav>
                </aside>

                <div className="flex-1 w-full max-w-4xl">
                    {children}
                </div>
            </div>
        </AppLayout>
    );
}
