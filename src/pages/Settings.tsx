import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState } from "react";

const Settings = () => {
  const { user, logout } = useAuth();
  const { users } = useData(); // We might need this if we want to update the global user list, but for now read-only or local update

  // Local state for editing (if we implement it)
  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");

  const handleSave = () => {
    // Implement update logic if desired.
    // For now, just show a toast.
    toast.info("Profile update not fully implemented in this demo.");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        <Separator />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Profile</h2>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={email} disabled className="bg-muted" />
                </div>
                <div className="grid gap-2">
                  <Label>Role</Label>
                  <div className="flex h-10 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
                    {user?.role}
                  </div>
                </div>
                <div className="pt-2">
                  <Button onClick={handleSave}>Save Changes</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Account Actions</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Sign out of your account on this device.
              </p>
              <Button variant="destructive" onClick={logout}>Sign Out</Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
