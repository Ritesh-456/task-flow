export type UserRole = "admin" | "manager" | "employee";
export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type NotificationType = "task_assigned" | "status_updated" | "deadline_reminder";

export interface User {
  _id?: string; // MongoDB ID
  id?: string; // Kept for backward compatibility if needed, but prefer _id
  name: string;
  email: string;
  role: UserRole | string; // Allow string to handle flexible backend responses initially
  avatar?: string;
  createdAt?: string;
  preferences?: {
    theme?: string;
    language?: string;
    timezone?: string;
    notifications?: {
      email?: boolean;
      realtime?: boolean;
      taskAssigned?: boolean;
      taskUpdates?: boolean;
      deadlineReminder?: boolean;
    };
  };
  security?: {
    lastPasswordChange?: string;
    loginHistory?: {
      date: string;
      ip: string;
      device: string;
    }[];
  };
}

export interface Project {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  members: { user: string; role: string }[] | string[];
  owner?: string | User;
  status?: string;
  createdAt?: string;
  taskCount?: number;
  completedCount?: number;
}

export interface Task {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string;
  assignedTo: string | User;
  createdBy?: string;
  projectId: string;
}

export interface Notification {
  _id?: string;
  id?: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
  taskId?: string;
}
