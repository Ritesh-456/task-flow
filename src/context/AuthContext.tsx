import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import api from "@/services/api";
import { toast } from "sonner";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    previewRole: string | null;
    setPreviewRole: (role: string | null) => void;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string, gender: string, role: string, inviteCode?: string) => Promise<boolean>;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [previewRole, setPreviewRole] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const storedUser = localStorage.getItem("taskflow_user");
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                } catch (e) {
                    console.error("Failed to parse user", e);
                    localStorage.removeItem("taskflow_user");
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    // Apply Theme
    useEffect(() => {
        const theme = user?.preferences?.theme || "dark";
        const root = window.document.documentElement;

        root.classList.remove("light", "dark");

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
    }, [user]);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { data } = await api.post("/auth/login", { email, password });
            setUser(data);
            setPreviewRole(null); // Reset preview role on login
            localStorage.setItem("taskflow_user", JSON.stringify(data));
            toast.success("Welcome back!");
            return true;
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Login failed");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string, gender: string, role: string, inviteCode?: string) => {
        setIsLoading(true);
        try {
            const { data } = await api.post("/auth/register", { name, email, password, gender, role, inviteCode });
            setUser(data);
            setPreviewRole(null); // Reset preview role on register
            localStorage.setItem("taskflow_user", JSON.stringify(data));
            toast.success("Account created successfully!");
            return true;
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Registration failed");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (e) {
            console.error("Failed to call logout API", e);
        }
        setUser(null);
        setPreviewRole(null);
        localStorage.removeItem("taskflow_user");
        toast.info("Logged out successfully");
    };

    const updateUser = (userData: Partial<User>) => {
        setUser(prev => {
            if (!prev) return null;
            const updated = { ...prev, ...userData };
            localStorage.setItem("taskflow_user", JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, previewRole, setPreviewRole, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within a AuthProvider");
    }
    return context;
};
