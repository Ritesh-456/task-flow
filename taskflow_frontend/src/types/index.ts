export type UserRole = "super_admin" | "admin" | "manager" | "employee";
export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type NotificationType = "task_assigned" | "status_updated" | "deadline_reminder";

export interface User {
  _id?: string; // MongoDB ID
  id?: string; // Kept for backward compatibility if needed, but prefer _id
  token?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole | string; // Allow string to handle flexible backend responses initially
  avatar?: string;
  inviteCode?: string;
  teamId?: string;
  tenantId?: string;
  reportsTo?: string;
  isActive?: boolean;
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
  members: { userId: string; role: string }[] | string[];
  createdBy?: string | User;
  tenantId?: string;
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
  dueDate: string;
  assignedTo: string | User;
  createdBy?: string;
  projectId: string;
  tenantId?: string;
  aiPriority?: string;
  aiRationale?: string;
  comments?: { message: string; userId: string; createdAt: Date | string }[];
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
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

export interface TaskDistributionData {
  name: string;
  value: number;
}

export interface TasksOverTimeData {
  date: string;
  created: number;
  completed: number;
}

export interface UserProductivityData {
  firstName: string;
  lastName: string;
  completed: number;
}

export interface ProjectProgressData {
  name: string;
  progress: number;
}
