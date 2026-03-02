import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Eye } from "lucide-react";

export default function ImpersonationBanner() {
    const { user, impersonatedUser, setImpersonatedUser } = useAuth();

    if (!user || !impersonatedUser) return null;

    const handleExit = () => {
        setImpersonatedUser(null);
        localStorage.removeItem("taskflow_impersonated_user");
        localStorage.removeItem("taskflow_impersonated_user_data");
        window.location.reload();
    };

    return (
        <div className="bg-destructive text-destructive-foreground px-4 py-2 flex items-center justify-center gap-3 w-full shadow-md z-[60] fixed top-0 left-0">
            <Eye className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">
                Viewing as: {impersonatedUser.firstName || impersonatedUser.first_name || (impersonatedUser as any).name || 'User'} ({impersonatedUser.role.replace("_", " ")})
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={handleExit}
                className="ml-4 h-7 text-xs bg-white text-destructive border-transparent hover:bg-gray-100 hover:text-destructive"
            >
                <LogOut className="h-3 w-3 mr-1" /> Exit Preview
            </Button>
        </div>
    );
}
