import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import api from "@/services/api";
import { toast } from "sonner";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    impersonatedUser: User | null;
    setImpersonatedUser: (user: User | null) => void;
    activeRole: string;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string, gender: string, role: string, inviteCode?: string) => Promise<boolean>;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
    const activeRole = impersonatedUser?.role || user?.role || "employee";

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
            const storedImpersonated = localStorage.getItem("taskflow_impersonated_user_data");
            if (storedImpersonated) {
                try {
                    setImpersonatedUser(JSON.parse(storedImpersonated));
                } catch (e) {
                    localStorage.removeItem("taskflow_impersonated_user_data");
                    localStorage.removeItem("taskflow_impersonated_user");
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    // Apply Theme
    useEffect(() => {
        // Find theme from user preferences, OR local storage, OR default to dark
        const theme = user?.preferences?.theme || localStorage.getItem("taskflow_theme") || "dark";
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

        // Persist to local storage so it holds across page reloads/sign-ins before user state initializes
        localStorage.setItem("taskflow_theme", theme);
    }, [user]);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { data } = await api.post("/auth/login", { email, password });
            setUser(data);
            setImpersonatedUser(null);
            localStorage.removeItem('taskflow_impersonated_user');
            localStorage.removeItem('taskflow_impersonated_user_data');
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
            setImpersonatedUser(null);
            localStorage.removeItem('taskflow_impersonated_user');
            localStorage.removeItem('taskflow_impersonated_user_data');
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
        setImpersonatedUser(null);
        localStorage.removeItem('taskflow_impersonated_user');
        localStorage.removeItem('taskflow_impersonated_user_data');
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
        <AuthContext.Provider value={{ user, isLoading, impersonatedUser, setImpersonatedUser, activeRole, login, register, logout, updateUser }}>
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
