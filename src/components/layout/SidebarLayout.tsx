import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
    { icon: Users, label: "Team Management", href: "/settings/team" },
    { icon: Folder, label: "Project Settings", href: "/settings/projects" },
];

export default function SidebarLayout({ children }: SidebarLayoutProps) {
    const location = useLocation();
    // Mock role for now, replace with actual auth context check
    const isAdmin = true;

    return (
        <AppLayout>
            <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                <aside className="md:w-1/4 lg:w-1/5 shrink-0">
                    <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
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
