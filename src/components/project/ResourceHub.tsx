"use client";

import { useState } from "react";
import {
  Plus, Trash2, X, Loader2, ExternalLink, HardDrive, Link2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Resource, ResourceType } from "@/types";
import { RESOURCE_TYPE_META } from "@/types";
import { cn } from "@/lib/utils";

// Inline SVG icons for brand logos (lucide-react doesn't export Github/Figma)
const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const FigmaIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
    <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" />
    <path d="M12 9h3.5a3.5 3.5 0 1 1-3.5 3.5V9z" />
    <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" />
    <path d="M5 18.5A3.5 3.5 0 0 1 8.5 15H12v3.5a3.5 3.5 0 1 1-7 0z" />
  </svg>
);

const RESOURCE_ICONS: Record<ResourceType, React.ReactNode> = {
  GITHUB: <GithubIcon className="w-5 h-5 text-neutral-300" />,
  FIGMA: <FigmaIcon className="w-5 h-5 text-rose-400" />,
  DRIVE: <HardDrive className="w-5 h-5 text-blue-400" />,
  OTHER: <Link2 className="w-5 h-5 text-indigo-400" />,
};

interface ResourceHubProps {
  projectId: string;
  resources: Resource[];
  onAddResource: (resource: Resource) => void;
  onDeleteResource: (resourceId: string) => void;
}

export default function ResourceHub({
  projectId,
  resources,
  onAddResource,
  onDeleteResource,
}: ResourceHubProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<ResourceType>("OTHER");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      const res = await fetch(`/api/projects/${projectId}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url: formattedUrl, type }),
      });
      const data = await res.json();

      if (res.ok) {
        onAddResource(data.resource);
        setModalOpen(false);
        setTitle("");
        setUrl("");
        setType("OTHER");
      } else {
        setError(data.error || "Không thể lưu liên kết.");
      }
    } catch {
      setError("Đã xảy ra lỗi kết nối.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (resourceId: string) => {
    if (!confirm("Xóa tài nguyên này?")) return;
    const res = await fetch(
      `/api/projects/${projectId}/resources/${resourceId}`,
      { method: "DELETE" }
    );
    if (res.ok) onDeleteResource(resourceId);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-white">Kho tài nguyên</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Các liên kết tài liệu quan trọng của dự án.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-border hover:border-indigo-500/30 text-white text-xs cursor-pointer transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm liên kết</span>
        </button>
      </div>

      {/* Resource Grid */}
      {resources.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-border/40 text-center max-w-lg mx-auto mt-8">
          <Link2 className="w-8 h-8 text-indigo-500 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-white mb-1">
            Chưa có tài nguyên nào
          </h3>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            GitHub repo, Figma design file, Google Drive — tất cả ở một chỗ.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-semibold hover:opacity-90 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm ngay</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {resources.map((res) => {
            const meta = RESOURCE_TYPE_META[res.type];
            return (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-5 rounded-2xl border border-border/40 hover:border-indigo-500/20 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-xl bg-neutral-900 border border-border/60">
                    {RESOURCE_ICONS[res.type]}
                  </div>
                  <button
                    onClick={() => handleDelete(res.id)}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-neutral-800 hover:text-red-400 text-neutral-500 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3
                  className="text-xs font-bold text-white line-clamp-1 mb-1.5"
                  title={res.title}
                >
                  {res.title}
                </h3>
                <span
                  className={cn(
                    "text-[9px] font-semibold border px-2 py-0.5 rounded-full inline-block w-fit",
                    meta.badgeClass
                  )}
                >
                  {meta.label}
                </span>

                <div className="flex items-center justify-between border-t border-border/20 pt-3 mt-3">
                  <span className="text-[9px] text-neutral-500 truncate max-w-[150px]">
                    {res.url.replace(/^https?:\/\/(www\.)?/i, "")}
                  </span>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center space-x-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                  >
                    <span>Mở</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Resource Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-md p-6 rounded-2xl relative shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-white">
                  Thêm liên kết tài nguyên
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-neutral-800 text-muted-foreground hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Figma Design System, GitHub Repo..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#161620] border border-[#27273a] focus:border-indigo-500/60 rounded-xl py-2 px-4 text-sm text-white placeholder-muted-foreground outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    URL *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://figma.com/file/... hoặc github.com/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-[#161620] border border-[#27273a] focus:border-indigo-500/60 rounded-xl py-2 px-4 text-sm text-white placeholder-muted-foreground outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Loại tài nguyên
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ResourceType)}
                    className="w-full bg-[#161620] border border-[#27273a] focus:border-indigo-500/60 rounded-xl py-2 px-3 text-sm text-white outline-none"
                  >
                    <option value="GITHUB">GitHub Repository</option>
                    <option value="FIGMA">Figma Design File</option>
                    <option value="DRIVE">Google Drive</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#27273a] hover:bg-neutral-800 text-muted-foreground hover:text-white text-sm transition-all cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 text-white font-medium text-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>Thêm</span>
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
