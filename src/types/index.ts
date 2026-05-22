// ============================================================
// Project Space — Centralized Type Definitions
// All entity types mirror the Prisma schema exactly.
// Import from "@/types" in all pages and components.
// ============================================================

// ------ Enums -----------------------------------------------

export type Role = "OWNER" | "MEMBER" | "VIEWER";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type ResourceType = "GITHUB" | "FIGMA" | "DRIVE" | "OTHER";

// ------ Core User -------------------------------------------

export interface UserSummary {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
}

export interface UserProfile extends UserSummary {
  createdAt: string;
}

// ------ Project Member --------------------------------------

export interface Member {
  role: Role;
  user: UserSummary;
}

// ------ Task ------------------------------------------------

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignedToId: string | null;
  assignedTo: Pick<UserSummary, "id" | "name" | "avatar"> | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// ------ Note ------------------------------------------------

export interface Note {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: Pick<UserSummary, "name" | "avatar">;
  createdAt: string;
  updatedAt: string;
}

// ------ Resource --------------------------------------------

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  createdAt: string;
}

// ------ Activity --------------------------------------------

export interface ActivityItem {
  id: string;
  action: string;
  createdAt: string;
  user: Pick<UserSummary, "id" | "name" | "avatar">;
}

// ------ Project (full workspace data) -----------------------

export interface ProjectData {
  id: string;
  title: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  members: Member[];
  tasks: Task[];
  notes: Note[];
  resources: Resource[];
  activities: ActivityItem[];
}

// ------ Dashboard Project card (lighter version) ------------

export interface ProjectCard {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  _count: {
    tasks: number;
    members: number;
  };
  members: { user: UserSummary }[];
}

// ------ Label maps (UI helpers, co-located with types) ------

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "Cần làm",
  IN_PROGRESS: "Đang làm",
  REVIEW: "Đánh giá",
  DONE: "Hoàn thành",
};

export const TASK_PRIORITY_META: Record<
  TaskPriority,
  { label: string; className: string }
> = {
  LOW: {
    label: "Thấp",
    className: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
  MEDIUM: {
    label: "Trung bình",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  HIGH: {
    label: "Cao",
    className: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
};

export const RESOURCE_TYPE_META: Record<
  ResourceType,
  { label: string; badgeClass: string }
> = {
  GITHUB: {
    label: "GitHub Repository",
    badgeClass: "bg-neutral-800 text-neutral-300 border-neutral-700",
  },
  FIGMA: {
    label: "Figma Design",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
  DRIVE: {
    label: "Google Drive",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  OTHER: {
    label: "Tài liệu / Link ngoài",
    badgeClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  },
};
