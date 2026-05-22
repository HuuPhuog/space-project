"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Plus, FileText, Trash2, Save, Check,
  Loader2, Eye, Edit3, ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Note } from "@/types";
import { cn } from "@/lib/utils";

interface NotesSystemProps {
  projectId: string;
  notes: Note[];
  onAddNote: (note: Note) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
}

type SaveStatus = "saved" | "saving" | "unsaved";
type EditorMode = "edit" | "preview";

export default function NotesSystem({
  projectId,
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}: NotesSystemProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [mode, setMode] = useState<EditorMode>("edit");
  const [creating, setCreating] = useState(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  // Sync fields when selection changes
  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setSaveStatus("saved");
    }
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save with 1.2s debounce
  const triggerSave = useCallback(
    (noteId: string, newTitle: string, newContent: string) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaveStatus("saving");

      saveTimerRef.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `/api/projects/${projectId}/notes/${noteId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title: newTitle, content: newContent }),
            }
          );
          const data = await res.json();
          if (res.ok) {
            onUpdateNote(data.note);
            setSaveStatus("saved");
          } else {
            setSaveStatus("unsaved");
          }
        } catch {
          setSaveStatus("unsaved");
        }
      }, 1200);
    },
    [projectId, onUpdateNote]
  );

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (selectedId) triggerSave(selectedId, val, content);
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    if (selectedId) triggerSave(selectedId, title, val);
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Ghi chú chưa đặt tên", content: "" }),
      });
      const data = await res.json();
      if (res.ok) {
        onAddNote(data.note);
        setSelectedId(data.note.id);
        setMode("edit");
      }
    } catch {
      /* noop */
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Xóa ghi chú này?")) return;

    const res = await fetch(`/api/projects/${projectId}/notes/${noteId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      onDeleteNote(noteId);
      if (selectedId === noteId) setSelectedId(null);
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // ---- Save Status Indicator -----
  const SaveIndicator = () => (
    <div className="flex items-center space-x-1.5 text-[10px]">
      {saveStatus === "saving" && (
        <>
          <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
          <span className="text-neutral-500">Đang lưu...</span>
        </>
      )}
      {saveStatus === "saved" && (
        <>
          <Check className="w-3 h-3 text-emerald-400" />
          <span className="text-neutral-500">Đã lưu tự động</span>
        </>
      )}
      {saveStatus === "unsaved" && (
        <>
          <Save className="w-3 h-3 text-amber-400 animate-pulse" />
          <span className="text-neutral-500">Chưa lưu</span>
        </>
      )}
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-5 h-[calc(100vh-160px)] min-h-[480px]">
      {/* ── Left panel: Note list ── */}
      <div
        className={cn(
          "w-full md:w-72 flex-shrink-0 flex flex-col border border-border/40 rounded-2xl glass-panel p-4",
          selectedId ? "hidden md:flex" : "flex"
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Ghi chú ({notes.length})
          </span>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="p-1.5 rounded-lg bg-neutral-900 border border-border hover:border-indigo-500/30 text-white cursor-pointer transition-all disabled:opacity-50"
            title="Tạo ghi chú mới"
          >
            {creating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
          {notes.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground italic">
              Nhấn + để tạo ghi chú đầu tiên.
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                onClick={() => setSelectedId(note.id)}
                className={cn(
                  "flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all group",
                  selectedId === note.id
                    ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                    : "border-transparent hover:bg-neutral-800/40 hover:border-border/30 text-muted-foreground hover:text-white"
                )}
              >
                <div className="flex items-center space-x-2.5 overflow-hidden">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs font-medium truncate">
                    {note.title || "Ghi chú chưa đặt tên"}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDelete(note.id, e)}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-neutral-900 hover:text-red-400 text-neutral-500 transition-all cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Right panel: Editor ── */}
      <div
        className={cn(
          "flex-1 border border-border/40 rounded-2xl glass-panel flex flex-col",
          !selectedId && "hidden md:flex items-center justify-center"
        )}
      >
        {selectedId ? (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/30">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedId(null)}
                  className="md:hidden p-1.5 rounded-lg bg-neutral-900 border border-border text-muted-foreground hover:text-white transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <SaveIndicator />
              </div>

              {/* Mode toggle */}
              <div className="flex items-center p-0.5 rounded-lg bg-neutral-900 border border-border">
                <button
                  onClick={() => setMode("edit")}
                  className={cn(
                    "flex items-center space-x-1.5 px-2.5 py-1 rounded text-[10px] font-semibold transition-all cursor-pointer",
                    mode === "edit"
                      ? "bg-indigo-500 text-white"
                      : "text-muted-foreground hover:text-white"
                  )}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Soạn</span>
                </button>
                <button
                  onClick={() => setMode("preview")}
                  className={cn(
                    "flex items-center space-x-1.5 px-2.5 py-1 rounded text-[10px] font-semibold transition-all cursor-pointer",
                    mode === "preview"
                      ? "bg-indigo-500 text-white"
                      : "text-muted-foreground hover:text-white"
                  )}
                >
                  <Eye className="w-3 h-3" />
                  <span>Xem trước</span>
                </button>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 flex flex-col overflow-hidden p-5">
              {/* Title */}
              <input
                type="text"
                placeholder="Tiêu đề ghi chú..."
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="bg-transparent text-lg font-bold text-white border-b border-transparent focus:border-border/40 pb-2 mb-4 outline-none w-full placeholder-neutral-600"
              />

              {/* Body */}
              <AnimatePresence mode="wait">
                {mode === "edit" ? (
                  <motion.textarea
                    key="editor"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    placeholder={`Hỗ trợ Markdown:\n# Tiêu đề\n**in đậm**, *in nghiêng*\n- Danh sách\n> Trích dẫn\n\`code\``}
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-neutral-300 placeholder-neutral-600 outline-none resize-none w-full font-mono leading-relaxed"
                    style={{ minHeight: 0, height: "100%" }}
                  />
                ) : (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 overflow-y-auto prose prose-invert prose-sm max-w-none
                      prose-headings:text-white prose-headings:font-bold
                      prose-p:text-neutral-300 prose-p:leading-relaxed
                      prose-strong:text-white
                      prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
                      prose-code:text-rose-400 prose-code:bg-neutral-800 prose-code:px-1 prose-code:rounded prose-code:text-xs
                      prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-border/40 prose-pre:rounded-xl
                      prose-blockquote:border-l-indigo-500 prose-blockquote:text-neutral-400
                      prose-li:text-neutral-300
                      prose-hr:border-border/40"
                  >
                    {content ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-neutral-600 italic text-sm">
                        Chưa có nội dung. Hãy chuyển sang chế độ soạn thảo để bắt đầu.
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="text-center p-8">
            <FileText className="w-10 h-10 text-neutral-700 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-neutral-400 mb-1">
              Chưa chọn ghi chú
            </h3>
            <p className="text-xs text-neutral-500 max-w-xs leading-normal">
              Chọn một ghi chú từ danh sách hoặc nhấn{" "}
              <button
                onClick={handleCreate}
                className="text-indigo-400 hover:underline cursor-pointer"
              >
                tạo ghi chú mới
              </button>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
