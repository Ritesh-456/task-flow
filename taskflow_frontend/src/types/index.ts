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
  first_name?: string;
  last_name?: string;
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
  id: string;
  name: string;
  description: string;
  members: ProjectMember[];
  created_by?: string | number;
  created_by_name?: string;
  tenant?: string | number;
  status?: string;
  created_at?: string;
  task_count?: number;
  completed_count?: number;
  // Deprecated MongoDB fields
  _id?: string;
}

export interface ProjectMember {
  id: number;
  user: number;
  user_email: string;
  user_name: string;
  role: string;
  created_at: string;
}

export interface Task {
  id: string | number;
  title: string;
  description: string;
  status: TaskStatus | string;
  priority: TaskPriority | string;
  due_date: string;
  assigned_to: string | number | User;
  assigned_to_name?: string;
  assigned_by?: string | number | User;
  assigned_by_name?: string;
  project: string | number;
  tenant?: string | number;
  // Frontend legacy/extended fields
  dueDate?: string;
  _id?: string;
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
