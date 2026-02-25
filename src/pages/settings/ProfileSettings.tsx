import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import SidebarLayout from "@/layouts/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/services/api";
import { Camera } from "lucide-react";

export default function ProfileSettings() {
    const { user, updateUser } = useAuth();
    const [firstName, setFirstName] = useState(user?.firstName || "");
    const [lastName, setLastName] = useState(user?.lastName || "");
    const [email, setEmail] = useState(user?.email || "");
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { data } = await api.put("/users/profile", { firstName, lastName, email });
            updateUser(data);
            toast.success("Profile updated successfully");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image size must be less than 2MB");
            return;
        }

        const formData = new FormData();
        formData.append("image", file);

        const toastId = toast.loading("Uploading image...");

        try {
            const { data } = await api.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            // Update user profile with new avatar URL
            const avatarUrl = `http://localhost:5000${data}`; // Ensure backend URL is correct
            const { data: updatedUser } = await api.put("/users/profile", { avatar: avatarUrl });
            updateUser(updatedUser);
            toast.success("Avatar updated!", { id: toastId });
        } catch (error: any) {
            toast.error("Failed to upload image", { id: toastId });
        }
    };

    return (
        <SidebarLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
                    <p className="text-muted-foreground">
                        Manage your public profile and personal details.
                    </p>
                </div>

                <div className="flex flex-col gap-8 md:flex-row">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-background shadow-xl">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary">
                                        {firstName?.[0] || '?'}{lastName?.[0] || ''}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
                            >
                                <Camera className="h-4 w-4" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium">{user?.role ? user.role.toUpperCase() : 'USER'}</p>
                            <p className="text-xs text-muted-foreground">Joined {user?.createdAt ? new Date(user.createdAt!).toLocaleDateString() : 'Recently'}</p>
                        </div>
                    </div>

                    <div className="flex-1 max-w-xl">
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
