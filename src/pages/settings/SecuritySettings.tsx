import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Laptop, Smartphone } from "lucide-react";
import api from "@/services/api";

interface LoginHistory {
    date: string;
    ip: string;
    device: string;
}

export default function SecuritySettings() {
    const { user } = useAuth();
    const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);

    useEffect(() => {
        if (user && user.security && user.security.loginHistory) {
            // Sort by date desc
            const sorted = [...user.security.loginHistory].sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setLoginHistory(sorted);
        }
    }, [user]);

    return (
        <SidebarLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Security</h2>
                    <p className="text-muted-foreground">Monitor your login activity and active sessions.</p>
                </div>

                <div className="rounded-lg border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-4">Login History</h3>
                    {loginHistory.length > 0 ? (
                        <div className="space-y-4">
                            {loginHistory.map((login, index) => (
                                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            {login.device.toLowerCase().includes("mobile") ? <Smartphone className="h-5 w-5" /> : <Laptop className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{login.device}</p>
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                                <span>{login.ip}</span>
                                                <span className="hidden sm:inline">•</span>
                                                <span>{new Date(login.date).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {index === 0 && (
                                        <div className="self-start sm:self-auto px-2 py-1 rounded bg-green-500/10 text-green-500 text-xs font-medium ml-14 sm:ml-0">
                                            Current Session
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No login history available.</p>
                    )}
                </div>
            </div>
        </SidebarLayout>
    );
}
