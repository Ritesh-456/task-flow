import { Task, Project, Notification, User } from "@/types";

export const currentUser: User = {
  id: "u1",
  name: "Alex Morgan",
  email: "alex@taskflow.io",
  role: "admin",
  avatar: "AM",
};

export const mockUsers: User[] = [
  currentUser,
  { id: "u2", name: "Sarah Chen", email: "sarah@taskflow.io", role: "manager", avatar: "SC" },
  { id: "u3", name: "James Wilson", email: "james@taskflow.io", role: "employee", avatar: "JW" },
  { id: "u4", name: "Maria Garcia", email: "maria@taskflow.io", role: "employee", avatar: "MG" },
  { id: "u5", name: "David Kim", email: "david@taskflow.io", role: "manager", avatar: "DK" },
];

export const mockProjects: Project[] = [
  {
    id: "p1",
    name: "Website Redesign",
    description: "Complete overhaul of the company website with modern design",
    members: ["u1", "u2", "u3"],
    createdBy: "u1",
    createdAt: "2025-01-15",
    taskCount: 12,
    completedCount: 5,
  },
  {
    id: "p2",
    name: "Mobile App v2",
    description: "Second version of the mobile application with new features",
    members: ["u1", "u4", "u5"],
    createdBy: "u2",
    createdAt: "2025-02-01",
    taskCount: 8,
    completedCount: 2,
  },
  {
    id: "p3",
    name: "API Integration",
    description: "Integrate third-party APIs for payment and analytics",
    members: ["u2", "u3", "u5"],
    createdBy: "u1",
    createdAt: "2025-02-10",
    taskCount: 6,
    completedCount: 4,
  },
];

export const mockTasks: Task[] = [
  {
    id: "t1", title: "Design homepage wireframes", description: "Create wireframes for the new homepage layout",
    status: "todo", priority: "high", deadline: "2025-02-25", assignedTo: "u3", createdBy: "u1", projectId: "p1",
  },
  {
    id: "t2", title: "Set up CI/CD pipeline", description: "Configure automated deployment pipeline",
    status: "in-progress", priority: "high", deadline: "2025-02-20", assignedTo: "u2", createdBy: "u1", projectId: "p1",
  },
  {
    id: "t3", title: "Write API documentation", description: "Document all REST API endpoints",
    status: "done", priority: "medium", deadline: "2025-02-18", assignedTo: "u1", createdBy: "u2", projectId: "p3",
  },
  {
    id: "t4", title: "Implement auth flow", description: "Build login and registration screens",
    status: "in-progress", priority: "high", deadline: "2025-02-22", assignedTo: "u4", createdBy: "u5", projectId: "p2",
  },
  {
    id: "t5", title: "Database schema design", description: "Design the database schema for new features",
    status: "todo", priority: "medium", deadline: "2025-03-01", assignedTo: "u5", createdBy: "u1", projectId: "p2",
  },
  {
    id: "t6", title: "Unit tests for payments", description: "Write comprehensive unit tests for payment module",
    status: "todo", priority: "low", deadline: "2025-03-05", assignedTo: "u3", createdBy: "u2", projectId: "p3",
  },
  {
    id: "t7", title: "Responsive navigation", description: "Make navigation responsive across all devices",
    status: "in-progress", priority: "medium", deadline: "2025-02-28", assignedTo: "u1", createdBy: "u1", projectId: "p1",
  },
  {
    id: "t8", title: "Performance optimization", description: "Optimize page load times and bundle size",
    status: "done", priority: "high", deadline: "2025-02-15", assignedTo: "u2", createdBy: "u1", projectId: "p1",
  },
  {
    id: "t9", title: "User feedback form", description: "Create a feedback collection form",
    status: "done", priority: "low", deadline: "2025-02-12", assignedTo: "u4", createdBy: "u5", projectId: "p2",
  },
  {
    id: "t10", title: "Analytics dashboard", description: "Build analytics widgets for the dashboard",
    status: "todo", priority: "high", deadline: "2025-03-10", assignedTo: "u1", createdBy: "u2", projectId: "p3",
  },
];

export const mockNotifications: Notification[] = [
  { id: "n1", type: "task_assigned", message: "You were assigned to 'Design homepage wireframes'", read: false, createdAt: "2025-02-18T10:30:00Z", taskId: "t1" },
  { id: "n2", type: "status_updated", message: "Task 'Set up CI/CD pipeline' moved to In Progress", read: false, createdAt: "2025-02-18T09:15:00Z", taskId: "t2" },
  { id: "n3", type: "deadline_reminder", message: "Task 'Write API documentation' is due today", read: true, createdAt: "2025-02-18T08:00:00Z", taskId: "t3" },
  { id: "n4", type: "task_assigned", message: "You were assigned to 'Analytics dashboard'", read: false, createdAt: "2025-02-17T16:45:00Z", taskId: "t10" },
  { id: "n5", type: "status_updated", message: "Task 'Performance optimization' marked as Done", read: true, createdAt: "2025-02-17T14:20:00Z", taskId: "t8" },
];
