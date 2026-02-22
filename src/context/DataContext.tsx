import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Project, Task, User, Notification } from "@/types";
import { mockProjects, mockTasks, mockUsers, mockNotifications } from "@/data/mockData";
import api from "@/services/api";
export { api };
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";


interface DataContextType {
    projects: Project[];
    tasks: Task[];
    users: User[];
    notifications: Notification[];
    addProject: (project: Project) => void;
    addTask: (task: Task) => void;
    updateTask: (taskId: string, updates: Partial<Task>) => void;
    deleteTask: (taskId: string) => void;
    addUser: (user: User) => void;
    clearData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { activeRole } = useAuth();

    // Initialize data from API
    useEffect(() => {
        const loadData = async () => {
            const token = localStorage.getItem("taskflow_user");
            if (!token) return;

            try {
                // Fetch Users (Team Members)
                const usersRes = await api.get('/users/team-members').catch(() => ({ data: { data: [] } }));
                setUsers(usersRes.data.data || []);

                // Fetch Tasks
                const tasksRes = await api.get('/tasks').catch(() => ({ data: { data: [] } }));
                setTasks(tasksRes.data.data || []);

                // Fetch Projects
                const projectsRes = await api.get('/projects').catch(() => ({ data: { data: [] } }));
                setProjects(projectsRes.data.data || []);

                // Notifications - hard to mock unless we have an endpoint
                setNotifications(mockNotifications);

            } catch (error) {
                console.error("Failed to load data", error);
            }
        };

        loadData();
    }, [activeRole]);

    // Persist data? No, we sync with backend now. 
    // Remove local storage effects for data, keep for Auth only (handled in AuthContext).

    const addProject = async (project: Project) => {
        try {
            const { data } = await api.post('/projects', project);
            setProjects((prev) => [...prev, data]);
        } catch (e) {
            console.error("Failed to add project", e);
            toast.error("Failed to add project");
        }
    };

    const addTask = async (task: Task) => {
        try {
            const { data } = await api.post('/tasks', task);
            setTasks((prev) => [...prev, data]);
            toast.success("Task created");
        } catch (e) {
            console.error("Failed to add task", e);
            toast.error("Failed to create task");
        }
    };

    const updateTask = async (taskId: string, updates: Partial<Task>) => {
        try {
            const { data } = await api.put(`/tasks/${taskId}`, updates);
            setTasks((prev) => prev.map((t) => (t.id === taskId || t._id === taskId ? data : t)));
        } catch (e) {
            console.error("Failed to update task", e);
            toast.error("Failed to update task");
        }
    };

    const deleteTask = async (taskId: string) => {
        try {
            await api.delete(`/tasks/${taskId}`);
            setTasks((prev) => prev.filter(t => t.id !== taskId && t._id !== taskId));
            toast.success("Task deleted");
        } catch (e) {
            console.error("Failed to delete task", e);
            toast.error("Failed to delete task");
        }
    };



    const addUser = (user: User) => {
        setUsers((prev) => [...prev, user]);
    };

    const clearData = () => {
        setProjects([]);
        setTasks([]);
        setUsers([]);
        setNotifications([]);
    };

    return (
        <DataContext.Provider
            value={{
                projects,
                tasks,
                users,
                notifications,
                addProject,
                addTask,
                updateTask,
                deleteTask,
                addUser,
                clearData,
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
};
