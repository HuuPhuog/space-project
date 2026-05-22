"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal, Plus, LogOut, Loader2, Folder,
  ChevronRight, Users, CheckSquare, X, Settings,
} from "lucide-react";
import Link from "next/link";
import type { ProjectCard } from "@/types";
import { getAvatarUrl } from "@/lib/utils";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [modalError, setModalError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated") fetchProjects();
  }, [status, router]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (res.ok) setProjects(data.projects || []);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setCreating(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();

      if (!res.ok) {
        setModalError(data.error || "Không thể tạo dự án.");
      } else {
        setTitle("");
        setDescription("");
        setIsModalOpen(false);
        fetchProjects();
      }
    } catch {
      setModalError("Đã xảy ra lỗi kết nối.");
    } finally {
      setCreating(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
          <span className="text-sm text-muted-foreground">Đang tải...</span>
        </div>
      </div>
    );
  }

  const user = session?.user;

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      {/* Header */}
      <header className="border-b border-[#1e1e24]/60 backdrop-blur-md sticky top-0 z-40 bg-background/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Terminal className="w-5 h-5" />
            <span className="text-sm font-bold tracking-wider text-white">PROJECT SPACE</span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/settings"
              className="p-2 rounded-lg hover:bg-neutral-800 text-muted-foreground hover:text-white transition-all"
              title="Cài đặt tài khoản"
            >
              <Settings className="w-4 h-4" />
            </Link>

            <div className="flex items-center space-x-2.5">
              <img
                src={
                  (user as any)?.avatar ||
                  user?.image ||
                  getAvatarUrl(user?.name)
                }
                alt={user?.name || "User"}
                className="w-7 h-7 rounded-lg border border-[#27273a] bg-neutral-800"
              />
              <span className="text-sm font-medium text-white hidden md:inline">
                {user?.name}
              </span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">
              Không gian làm việc
            </h1>
            <p className="text-sm text-muted-foreground">
              {projects.length > 0
                ? `${projects.length} dự án đang hoạt động`
                : "Bắt đầu bằng cách tạo dự án đầu tiên."}
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 text-white font-medium text-sm transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo dự án mới</span>
          </button>
        </div>

        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-2xl p-14 text-center border border-border max-w-lg mx-auto mt-8"
          >
            <div className="p-4 rounded-full bg-neutral-900 border border-border w-fit mx-auto mb-6">
              <Folder className="w-8 h-8 text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Chưa có dự án nào
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Tạo không gian làm việc chung cho nhóm của bạn.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-medium text-sm mx-auto cursor-pointer hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo dự án ngay</span>
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((proj, i) => (
              <motion.div
                key={proj.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative glass-panel p-6 rounded-2xl border border-border hover:border-indigo-500/25 transition-all flex flex-col justify-between group h-[195px]"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1 flex-1 mr-2">
                      {proj.title}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {proj.description || "Không có mô tả dự án."}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-border/40 pt-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 text-muted-foreground text-[11px]">
                      <Users className="w-3.5 h-3.5" />
                      <span>{proj._count.members}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground text-[11px]">
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>{proj._count.tasks}</span>
                    </div>
                  </div>

                  {/* Member avatars */}
                  <div className="flex -space-x-2">
                    {proj.members.slice(0, 4).map((m, idx) => (
                      <img
                        key={idx}
                        src={m.user.avatar || getAvatarUrl(m.user.name)}
                        alt={m.user.name || "User"}
                        className="w-6 h-6 rounded-full border border-neutral-900 bg-neutral-800"
                        title={m.user.name || m.user.email}
                      />
                    ))}
                    {proj._count.members > 4 && (
                      <div className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-900 flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                        +{proj._count.members - 4}
                      </div>
                    )}
                  </div>
                </div>

                {/* Full card clickable area */}
                <Link href={`/project/${proj.id}`} className="absolute inset-0 rounded-2xl" />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-md p-6 rounded-2xl relative shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-white">Tạo dự án mới</h3>
                <button
                  onClick={() => { setIsModalOpen(false); setModalError(""); }}
                  className="p-1 rounded-lg hover:bg-neutral-800 text-muted-foreground hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {modalError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Tên dự án *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Capstone Project, Website THPT..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#161620] border border-[#27273a] focus:border-indigo-500/60 rounded-xl py-2.5 px-4 text-sm text-white placeholder-muted-foreground outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Mô tả dự án
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Mục tiêu, phạm vi của dự án..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#161620] border border-[#27273a] focus:border-indigo-500/60 rounded-xl py-2.5 px-4 text-sm text-white placeholder-muted-foreground outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#27273a] hover:bg-neutral-800 text-muted-foreground hover:text-white text-sm transition-all cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 text-white font-medium text-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang tạo...</span>
                      </>
                    ) : (
                      <span>Khởi tạo</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
