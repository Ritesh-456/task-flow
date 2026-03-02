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
    register: (firstName: string, lastName: string, email: string, password: string, gender: string, role: string, inviteCode?: string, avatar?: string) => Promise<boolean>;
    superAdminRegister: (userData: any) => Promise<boolean>;
    logout: () => void;

    viewAsUserId: string | null;
    setViewAsUserId: (id: string | null) => void;
    updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeUser = (userData: any): User => {
    if (!userData) return userData;
    return {
        ...userData,
        id: userData.id?.toString() || userData._id,
        _id: userData._id || userData.id?.toString(),
        firstName: userData.firstName || userData.first_name || "",
        lastName: userData.lastName || userData.last_name || "",
        role: userData.role || "employee",
    } as User;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
    const [viewAsUserId, setViewAsUserIdState] = useState<string | null>(null);
    const activeRole = impersonatedUser?.role || user?.role || "employee";

    useEffect(() => {
        const checkAuth = async () => {
            const storedUser = localStorage.getItem("taskflow_user");
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(normalizeUser(parsedUser));
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
            const storedViewAs = localStorage.getItem("taskflow_view_as_user");
            if (storedViewAs) {
                setViewAsUserIdState(storedViewAs);
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const setViewAsUserId = (id: string | null) => {
        if (id) {
            localStorage.setItem("taskflow_view_as_user", id);
        } else {
            localStorage.removeItem("taskflow_view_as_user");
        }
        setViewAsUserIdState(id);
        // Refresh the page or trigger a global data reload
        window.location.reload();
    };

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
            const { data } = await api.post("/accounts/login/", { email, password });
            // Django Custom View returns { access, refresh, user }
            const { access, user: userData } = data;
            const normalizedUser = normalizeUser(userData);

            localStorage.setItem("taskflow_token", access);
            localStorage.setItem("taskflow_user", JSON.stringify(normalizedUser));

            setUser(normalizedUser);
            setImpersonatedUser(null);
            localStorage.removeItem('taskflow_impersonated_user');
            localStorage.removeItem('taskflow_impersonated_user_data');

            toast.success("Welcome back!");
            return true;
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.detail || "Login failed");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (firstName: string, lastName: string, email: string, password: string, gender: string, role: string, inviteCode?: string, avatar?: string) => {
        setIsLoading(true);
        try {
            // Note: Our Django ConsumeInviteView expects { first_name, last_name, email, password, code }
            const { data } = await api.post("/accounts/invites/consume/", {
                first_name: firstName,
                last_name: lastName,
                email,
                password,
                code: inviteCode
            });

            // Backend returns { message, user }
            // Note: Register through invite usually requires a separate login step 
            // but we can auto-login if the backend provides tokens.
            // Our current ConsumeInviteView doesn't return tokens, so we'll just redirect to login
            toast.success("Account created! Please log in.");
            window.location.href = '/login';
            return true;
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Registration failed");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const superAdminRegister = async (userData: any) => {
        setIsLoading(true);
        try {
            // Mapping frontend camelCase to backend snake_case
            const payload = {
                first_name: userData.firstName,
                last_name: userData.lastName,
                email: userData.email,
                password: userData.password,
                company_name: userData.companyName,
                plan: userData.plan
            };

            const { data } = await api.post("/accounts/signup/", payload);

            // Backend returns { message, user }. We still need to log in to get tokens.
            toast.success("Super Admin created! Please log in.");
            window.location.href = '/login';
            return true;
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Super Admin registration failed");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        // Django JWT logout is client-side (clear tokens)
        setUser(null);
        setImpersonatedUser(null);
        localStorage.removeItem('taskflow_impersonated_user');
        localStorage.removeItem('taskflow_impersonated_user_data');
        localStorage.removeItem("taskflow_user");
        localStorage.removeItem("taskflow_token");
        toast.info("Logged out successfully");
        window.location.href = '/login';
    };

    const updateUser = (userData: any) => {
        setUser(prev => {
            if (!prev) return null;
            const updated = normalizeUser({ ...prev, ...userData });
            localStorage.setItem("taskflow_user", JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, impersonatedUser, setImpersonatedUser, activeRole, login, register, superAdminRegister, logout, updateUser, viewAsUserId, setViewAsUserId }}>
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
