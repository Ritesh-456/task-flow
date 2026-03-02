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
    updateProject: (projectId: string, updates: Partial<Project>) => void;
    deleteProject: (projectId: string) => void;
    addProjectMember: (projectId: string, userId: string, role: string) => Promise<void>;
    removeProjectMember: (memberId: string) => Promise<void>;
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
    const { activeRole, viewAsUserId } = useAuth();

    // Initialize data from API
    useEffect(() => {
        const loadData = async () => {
            const token = localStorage.getItem("taskflow_user");
            if (!token) return;

            try {
                const queryParam = viewAsUserId ? `?userId=${viewAsUserId}` : '';

                // Fetch Users (Team Members)
                const usersRes = await api.get("/accounts/users/").catch(() => ({ data: [] }));
                setUsers(Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.data || []));

                // Fetch Tasks
                const tasksRes = await api.get("/tasks/").catch(() => ({ data: [] }));
                setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : (tasksRes.data?.data || []));

                // Fetch Projects
                const projectsRes = await api.get("/projects/").catch(() => ({ data: [] }));
                setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : (projectsRes.data?.data || []));

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
            const { data } = await api.post('/projects/', project);
            setProjects((prev) => [...prev, data]);
        } catch (e) {
            console.error("Failed to add project", e);
            toast.error("Failed to add project");
        }
    };

    const updateProject = async (projectId: string, updates: Partial<Project>) => {
        try {
            const { data } = await api.patch(`/projects/${projectId}/`, updates);
            setProjects((prev) => prev.map((p) => (p.id === projectId || p._id === projectId ? data : p)));
            toast.success("Project updated");
        } catch (e) {
            console.error("Failed to update project", e);
            toast.error("Failed to update project");
        }
    };

    const deleteProject = async (projectId: string) => {
        try {
            await api.delete(`/projects/${projectId}/`);
            setProjects((prev) => prev.filter(p => p.id !== projectId && p._id !== projectId));
            toast.success("Project deleted");
        } catch (e) {
            console.error("Failed to delete project", e);
            toast.error("Failed to delete project");
        }
    };

    const addProjectMember = async (project: string, user: string, role: string) => {
        try {
            const { data } = await api.post('/projects/members/', { project, user, role });
            // Refresh projects to get updated member list
            const projectsRes = await api.get("/projects/");
            setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : (projectsRes.data?.data || []));
            toast.success("Member added to project");
        } catch (e) {
            console.error("Failed to add project member", e);
            toast.error("Failed to add member");
        }
    };

    const removeProjectMember = async (memberId: string) => {
        try {
            await api.delete(`/projects/members/${memberId}/`);
            // Refresh projects to get updated member list
            const projectsRes = await api.get("/projects/");
            setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : (projectsRes.data?.data || []));
            toast.success("Member removed from project");
        } catch (e) {
            console.error("Failed to remove project member", e);
            toast.error("Failed to remove member");
        }
    };

    const addTask = async (task: Task) => {
        try {
            const { data } = await api.post('/tasks/', task);
            setTasks((prev) => [...prev, data]);
            toast.success("Task created");
        } catch (e) {
            console.error("Failed to add task", e);
            toast.error("Failed to create task");
        }
    };

    const updateTask = async (taskId: string, updates: Partial<Task>) => {
        try {
            const { data } = await api.put(`/tasks/${taskId}/`, updates);
            setTasks((prev) => prev.map((t) => (t.id === taskId || t._id === taskId ? data : t)));
        } catch (e) {
            console.error("Failed to update task", e);
            toast.error("Failed to update task");
        }
    };

    const deleteTask = async (taskId: string) => {
        try {
            await api.delete(`/tasks/${taskId}/`);
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
                updateProject,
                deleteProject,
                addProjectMember,
                removeProjectMember,
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
