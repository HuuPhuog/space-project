"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  Terminal, ArrowLeft, Users, Kanban, FileText,
  Link2, Menu, X, Loader2, Home, Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { ProjectData, Member, Task, Note, Resource, ActivityItem } from "@/types";
import { getAvatarUrl } from "@/lib/utils";

// Import child components
import TaskBoard from "@/components/project/TaskBoard";
import NotesSystem from "@/components/project/NotesSystem";
import ResourceHub from "@/components/project/ResourceHub";
import ActivityFeed from "@/components/project/ActivityFeed";

// Types are imported from @/types — no local redefinitions needed

export default function ProjectWorkspacePage({
  params: paramsPromise,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = use(paramsPromise);
  const projectId = params.projectId;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "notes" | "resources">("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProjectDetails();
    }
  }, [status, projectId, router]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Không thể tải thông tin dự án.");
      } else {
        setProject(data.project);
      }
    } catch (err) {
      setError("Đã xảy ra lỗi kết nối cơ sở dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-background min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
          <span className="text-sm text-muted-foreground">Đang tải không gian dự án...</span>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center bg-background p-6 min-h-screen text-center">
        <div className="max-w-md glass-panel p-8 rounded-2xl border border-border">
          <h2 className="text-lg font-bold text-white mb-2">Đã xảy ra lỗi</h2>
          <p className="text-sm text-muted-foreground mb-6">{error || "Dự án không tồn tại."}</p>
          <Link
            href="/dashboard"
            className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-medium text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  // Sidebar Menu Items
  const menuItems = [
    { id: "overview", label: "Tổng quan & Hoạt động", icon: <Home className="w-4 h-4" /> },
    { id: "tasks", label: "Bảng Kanban", icon: <Kanban className="w-4 h-4" /> },
    { id: "notes", label: "Ghi chú tài liệu", icon: <FileText className="w-4 h-4" /> },
    { id: "resources", label: "Tài nguyên & Links", icon: <Link2 className="w-4 h-4" /> },
  ] as const;

  const isOwner = project.members.find(
    (m) => m.user.id === (session?.user as any)?.id
  )?.role === "OWNER";

  // State update handlers
  const handleTasksChange = (updatedTasks: Task[]) => {
    setProject((prev) => prev ? { ...prev, tasks: updatedTasks } : null);
  };

  const handleAddTask = (newTask: Task) => {
    setProject((prev) => prev ? { ...prev, tasks: [...prev.tasks, newTask] } : null);
  };

  const handleDeleteTask = (taskId: string) => {
    setProject((prev) => prev ? { ...prev, tasks: prev.tasks.filter((t) => t.id !== taskId) } : null);
  };

  const handleAddNote = (newNote: Note) => {
    setProject((prev) => prev ? { ...prev, notes: [newNote, ...prev.notes] } : null);
  };

  const handleUpdateNote = (updatedNote: Note) => {
    setProject((prev) => {
      if (!prev) return null;
      const updatedNotes = prev.notes.map((n) => n.id === updatedNote.id ? updatedNote : n);
      // Re-sort notes by updatedAt desc
      updatedNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      return { ...prev, notes: updatedNotes };
    });
  };

  const handleDeleteNote = (noteId: string) => {
    setProject((prev) => prev ? { ...prev, notes: prev.notes.filter((n) => n.id !== noteId) } : null);
  };

  const handleAddResource = (newResource: Resource) => {
    setProject((prev) => prev ? { ...prev, resources: [newResource, ...prev.resources] } : null);
  };

  const handleDeleteResource = (resourceId: string) => {
    setProject((prev) => prev ? { ...prev, resources: prev.resources.filter((r) => r.id !== resourceId) } : null);
  };

  const handleAddMember = (newMember: Member) => {
    setProject((prev) => prev ? { ...prev, members: [...prev.members, newMember] } : null);
  };

  const handleAddActivity = (newActivity: ActivityItem) => {
    setProject((prev) => prev ? { ...prev, activities: [newActivity, ...prev.activities] } : null);
  };

  return (
    <div className="flex-grow flex bg-background min-h-screen">
      {/* Sidebar - Desktop */}
      <aside className="w-64 border-r border-[#1e1e24]/60 glass-panel flex flex-col justify-between hidden md:flex shrink-0">
        <div className="p-4 space-y-6">
          {/* Logo / Back link */}
          <div>
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-2 text-muted-foreground hover:text-white transition-colors mb-6 text-xs font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại Dashboard</span>
            </Link>

            <div className="flex items-center space-x-2 text-[#6366f1] mb-2 px-1">
              <Terminal className="w-4 h-4" />
              <span className="text-xs font-extrabold tracking-wider text-white truncate max-w-[180px]">
                {project.title.toUpperCase()}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground px-1 line-clamp-2">
              {project.description || "Không có mô tả dự án."}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 mb-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === item.id
                    ? "bg-indigo-500/10 border border-indigo-500/30 text-indigo-400"
                    : "bg-transparent border border-transparent text-muted-foreground hover:text-white hover:bg-neutral-800/40"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Settings link — owner only */}
          {isOwner && (
            <Link
              href={`/project/${project.id}/settings`}
              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-white hover:bg-neutral-800/40 border border-transparent transition-all"
            >
              <Settings className="w-4 h-4" />
              <span>Cài đặt dự án</span>
            </Link>
          )}
        </div>

        {/* Member Panel inside Sidebar */}
        <div className="p-4 border-t border-border/30 bg-white/[0.01]">
          <div className="flex items-center space-x-1.5 text-white font-bold text-[10px] uppercase tracking-wider mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>Thành viên nhóm ({project.members.length})</span>
          </div>

          <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
            {project.members.map((m, idx) => (
              <div key={idx} className="flex items-center space-x-2.5 py-1">
                <img
                  src={m.user.avatar || getAvatarUrl(m.user.name)}
                  alt={m.user.name || "User"}
                  className="w-5 h-5 rounded-full border border-neutral-900 bg-neutral-800 shrink-0"
                />
                <div className="overflow-hidden">
                  <p className="text-[11px] font-semibold text-neutral-200 truncate leading-none mb-0.5">
                    {m.user.name}
                  </p>
                  <span className="text-[8px] text-neutral-500 leading-none">
                    {m.role === "OWNER" ? "Trưởng nhóm" : "Thành viên"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile Menu */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <div 
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
            {/* Sidebar drawer */}
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 border-r border-border glass-panel flex flex-col justify-between z-50 md:hidden bg-background"
            >
              <div className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                  <Link 
                    href="/dashboard" 
                    className="flex items-center space-x-2 text-muted-foreground hover:text-white transition-colors text-xs font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại Dashboard</span>
                  </Link>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 rounded-lg hover:bg-neutral-800 text-muted-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <div className="flex items-center space-x-2 text-[#6366f1] mb-2 px-1">
                    <Terminal className="w-4 h-4" />
                    <span className="text-xs font-extrabold tracking-wider text-white truncate max-w-[180px]">
                      {project.title.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground px-1 line-clamp-2">
                    {project.description || "Không có mô tả dự án."}
                  </p>
                </div>

                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        activeTab === item.id
                          ? "bg-indigo-500/10 border border-indigo-500/30 text-indigo-400"
                          : "bg-transparent border border-transparent text-muted-foreground hover:text-white hover:bg-neutral-800/40"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-4 border-t border-border/30 bg-white/[0.01]">
                <div className="flex items-center space-x-1.5 text-white font-bold text-[10px] uppercase tracking-wider mb-3">
                  <Users className="w-3.5 h-3.5" />
                  <span>Thành viên nhóm ({project.members.length})</span>
                </div>
                <div className="space-y-2 max-h-[150px] overflow-y-auto">
                  {project.members.map((m, idx) => (
                    <div key={idx} className="flex items-center space-x-2.5 py-1">
                      <img
                        src={m.user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${m.user.name}`}
                        alt={m.user.name || "User"}
                        className="w-5.5 h-5.5 rounded-full border border-neutral-900 bg-neutral-800"
                      />
                      <div>
                        <p className="text-[11px] font-semibold text-neutral-200 leading-none mb-0.5">
                          {m.user.name}
                        </p>
                        <span className="text-[8px] text-neutral-500 leading-none">
                          {m.role === "OWNER" ? "Trưởng nhóm" : "Thành viên"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Workspace Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Toolbar (Mobile burger and tab info) */}
        <header className="border-b border-[#1e1e24]/60 backdrop-blur-md sticky top-0 z-30 bg-background/50 h-16 flex items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-neutral-800 text-muted-foreground md:hidden cursor-pointer"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
            
            <h1 className="text-sm font-bold text-white uppercase tracking-wider md:block hidden">
              {menuItems.find((item) => item.id === activeTab)?.label}
            </h1>
            <h1 className="text-xs font-bold text-[#6366f1] uppercase tracking-wider md:hidden truncate max-w-[150px]">
              {project.title}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* Display logged in user info in workspace */}
            <div className="flex items-center space-x-2 bg-neutral-900/60 border border-border/60 py-1.5 px-3 rounded-xl">
              <div className="w-4.5 h-4.5 rounded-full bg-indigo-950 border border-border flex items-center justify-center text-[8px] font-bold text-indigo-400">
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="text-[10px] font-medium text-neutral-300 hidden sm:inline">
                {session?.user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-grow p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === "overview" && (
                <ActivityFeed
                  projectId={project.id}
                  members={project.members}
                  activities={project.activities}
                  tasks={project.tasks}
                  onAddMember={handleAddMember}
                  onAddActivity={handleAddActivity}
                />
              )}
              {activeTab === "tasks" && (
                <TaskBoard
                  projectId={project.id}
                  members={project.members}
                  tasks={project.tasks}
                  onTasksChange={handleTasksChange}
                  onAddTask={handleAddTask}
                  onDeleteTask={handleDeleteTask}
                />
              )}
              {activeTab === "notes" && (
                <NotesSystem
                  projectId={project.id}
                  notes={project.notes}
                  onAddNote={handleAddNote}
                  onUpdateNote={handleUpdateNote}
                  onDeleteNote={handleDeleteNote}
                />
              )}
              {activeTab === "resources" && (
                <ResourceHub
                  projectId={project.id}
                  resources={project.resources}
                  onAddResource={handleAddResource}
                  onDeleteResource={handleDeleteResource}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
