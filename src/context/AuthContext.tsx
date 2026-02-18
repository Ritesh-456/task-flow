import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import api from "@/services/api";
import { toast } from "sonner";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string, role?: string) => Promise<boolean>;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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

    const register = async (name: string, email: string, password: string, role: string = 'employee') => {
        setIsLoading(true);
        try {
            const { data } = await api.post("/auth/register", { name, email, password, role });
            setUser(data);
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

    const logout = () => {
        setUser(null);
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
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
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
