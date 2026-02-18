import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Project, Task, User, Notification } from "@/types";
import { mockProjects, mockTasks, mockUsers, mockNotifications } from "@/data/mockData";

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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Initialize data from localStorage or mockData
    useEffect(() => {
        const loadData = () => {
            const storedProjects = localStorage.getItem("taskflow_projects");
            const storedTasks = localStorage.getItem("taskflow_tasks");
            const storedUsers = localStorage.getItem("taskflow_users");
            const storedNotifications = localStorage.getItem("taskflow_notifications");

            setProjects(storedProjects ? JSON.parse(storedProjects) : mockProjects);
            setTasks(storedTasks ? JSON.parse(storedTasks) : mockTasks);
            setUsers(storedUsers ? JSON.parse(storedUsers) : mockUsers);
            setNotifications(storedNotifications ? JSON.parse(storedNotifications) : mockNotifications);
        };

        loadData();
    }, []);

    // Persist data to localStorage whenever it changes
    useEffect(() => {
        if (projects.length > 0) localStorage.setItem("taskflow_projects", JSON.stringify(projects));
    }, [projects]);

    useEffect(() => {
        if (tasks.length > 0) localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        if (users.length > 0) localStorage.setItem("taskflow_users", JSON.stringify(users));
    }, [users]);

    const addProject = (project: Project) => {
        setProjects((prev) => [...prev, project]);
    };

    const addTask = (task: Task) => {
        setTasks((prev) => [...prev, task]);
        // Also update project task count if applicable
        if (task.projectId) {
            setProjects(prev => prev.map(p =>
                p.id === task.projectId
                    ? { ...p, taskCount: p.taskCount + 1 }
                    : p
            ));
        }
    };

    const updateTask = (taskId: string, updates: Partial<Task>) => {
        setTasks((prev) => {
            const newTasks = prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t));

            const task = prev.find(t => t.id === taskId);
            if (task && task.projectId && updates.status) {
                setProjects(currentProjects => currentProjects.map(p => {
                    if (p.id === task.projectId) {
                        const projectTasks = newTasks.filter(t => t.projectId === p.id);
                        const completed = projectTasks.filter(t => t.status === 'done').length;
                        return { ...p, completedCount: completed, taskCount: projectTasks.length };
                    }
                    return p;
                }));
            }
            return newTasks;
        });
    };

    const deleteTask = (taskId: string) => {
        setTasks(prev => {
            const taskToDelete = prev.find(t => t.id === taskId);
            const newTasks = prev.filter(t => t.id !== taskId);

            if (taskToDelete && taskToDelete.projectId) {
                setProjects(currentProjects => currentProjects.map(p => {
                    if (p.id === taskToDelete.projectId) {
                        const projectTasks = newTasks.filter(t => t.projectId === p.id);
                        const completed = projectTasks.filter(t => t.status === 'done').length;
                        return { ...p, completedCount: completed, taskCount: projectTasks.length };
                    }
                    return p;
                }));
            }
            return newTasks;
        });
    };

    const addUser = (user: User) => {
        setUsers((prev) => [...prev, user]);
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
