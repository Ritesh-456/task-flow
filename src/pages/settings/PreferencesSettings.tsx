import { useState, useEffect } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function PreferencesSettings() {
    const { user, updateUser } = useAuth();
    const [theme, setTheme] = useState("dark");
    const [language, setLanguage] = useState("en");
    const [timezone, setTimezone] = useState("UTC");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user && user.preferences) {
            setTheme(user.preferences.theme || "dark");
            setLanguage(user.preferences.language || "en");
            setTimezone(user.preferences.timezone || "UTC");
        }
    }, [user]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await api.put("/users/preferences", { theme, language, timezone });

            // Update local user context to trigger theme change immediately
            updateUser({
                preferences: {
                    ...user?.preferences,
                    theme,
                    language,
                    timezone
                } as any
            });

            toast.success("Preferences saved successfully");
        } catch (error: any) {
            toast.error("Failed to save preferences");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SidebarLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Preferences</h2>
                    <p className="text-muted-foreground">Customize your application experience.</p>
                </div>

                <div className="rounded-lg border bg-card p-6 max-w-xl space-y-6">
                    <div className="space-y-2">
                        <Label>Theme</Label>
                        <Select value={theme} onValueChange={setTheme}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Language</Label>
                        <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Timezone</Label>
                        <Select value={timezone} onValueChange={setTimezone}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="UTC">UTC</SelectItem>
                                <SelectItem value="EST">Eastern Time (US & Canada)</SelectItem>
                                <SelectItem value="PST">Pacific Time (US & Canada)</SelectItem>
                                <SelectItem value="IST">India Standard Time</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Preferences"}
                    </Button>
                </div>
            </div>
        </SidebarLayout>
    );
}
