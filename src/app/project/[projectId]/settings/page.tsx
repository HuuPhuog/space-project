"use client";

import { useSession } from "next-auth/react";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Settings, ArrowLeft, Loader2, AlertTriangle, Check, Trash2,
} from "lucide-react";
import Link from "next/link";

interface ProjectSettingsPageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectSettingsPage({ params: paramsPromise }: ProjectSettingsPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { projectId } = use(paramsPromise);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // Fetch project details once
  useState(() => {
    if (initialized) return;
    setInitialized(true);
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.project) {
          setTitle(d.project.title);
          setDescription(d.project.description ?? "");
        }
      });
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaveSuccess(false);
    setSaving(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Không thể lưu cài đặt.");
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      setError("Đã xảy ra lỗi kết nối.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== title) {
      setError(`Nhập đúng tên dự án "${title}" để xác nhận xóa.`);
      return;
    }
    setDeleting(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/settings`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Không thể xóa dự án.");
        setDeleting(false);
      }
    } catch {
      setError("Đã xảy ra lỗi kết nối.");
      setDeleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      <header className="border-b border-[#1e1e24]/60 backdrop-blur-md sticky top-0 z-40 bg-background/50">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center space-x-4">
          <Link
            href={`/project/${projectId}`}
            className="flex items-center space-x-1.5 text-muted-foreground hover:text-white transition-colors text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại dự án</span>
          </Link>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Settings className="w-4 h-4" />
            <span className="text-sm font-semibold text-white">Cài đặt dự án</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10 space-y-6">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white mb-1">Cài đặt dự án</h1>
          <p className="text-sm text-muted-foreground">
            Chỉnh sửa thông tin hoặc xóa dự án.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </div>
        )}

        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-6 border border-border/40"
        >
          <h2 className="text-sm font-bold text-white mb-5">Thông tin chung</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Tên dự án *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#161620] border border-[#27273a] focus:border-indigo-500/60 rounded-xl py-2.5 px-4 text-sm text-white placeholder-muted-foreground outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Mô tả
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mục tiêu, phạm vi, ghi chú cho dự án..."
                className="w-full bg-[#161620] border border-[#27273a] focus:border-indigo-500/60 rounded-xl py-2.5 px-4 text-sm text-white placeholder-muted-foreground outline-none transition-all resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 text-white font-medium text-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Đã lưu!</span>
                  </>
                ) : (
                  <span>Lưu thay đổi</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-panel rounded-2xl p-6 border border-red-500/20 bg-red-500/[0.02]"
        >
          <div className="flex items-center space-x-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h2 className="text-sm font-bold text-red-400">Vùng nguy hiểm</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-5">
            Xóa dự án sẽ xóa toàn bộ công việc, ghi chú, tài nguyên và lịch sử hoạt động.
            Hành động này <strong className="text-white">không thể hoàn tác</strong>.
          </p>

          <div className="space-y-3">
            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Nhập tên dự án để xác nhận:{" "}
              <span className="text-white font-mono">{title}</span>
            </label>
            <input
              type="text"
              placeholder={title}
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full bg-[#1a0c0c] border border-red-500/30 focus:border-red-500/60 rounded-xl py-2.5 px-4 text-sm text-white placeholder-muted-foreground outline-none transition-all"
            />
            <button
              onClick={handleDelete}
              disabled={deleting || deleteConfirm !== title}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-medium text-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa dự án vĩnh viễn</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
