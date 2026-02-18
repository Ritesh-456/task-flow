import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { mockUsers } from "@/data/mockData";

interface AuthContextType {
    user: User | null;
    login: (email: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("taskflow_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string) => {
        // Check localStorage for users first, then fall back to mockUsers
        const storedUsers = localStorage.getItem("taskflow_users");
        const users: User[] = storedUsers ? JSON.parse(storedUsers) : mockUsers;

        const foundUser = users.find((u) => u.email === email);
        if (foundUser) {
            setUser(foundUser);
            localStorage.setItem("taskflow_user", JSON.stringify(foundUser));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("taskflow_user");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
