"use client";

import { useState, useEffect } from "react";
import {
  Plus, Trash2, X, Loader2, User, Calendar,
  ChevronDown, AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task, Member, TaskStatus, TaskPriority } from "@/types";
import { TASK_PRIORITY_META, TASK_STATUS_LABELS } from "@/types";
import { cn, formatShortDate } from "@/lib/utils";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

interface TaskBoardProps {
  projectId: string;
  members: Member[];
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  onAddTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const COLUMNS: { id: TaskStatus; accentClass: string }[] = [
  { id: "TODO", accentClass: "border-t-slate-500" },
  { id: "IN_PROGRESS", accentClass: "border-t-indigo-500" },
  { id: "REVIEW", accentClass: "border-t-amber-500" },
  { id: "DONE", accentClass: "border-t-emerald-500" },
];

// ---- Task Creation / Edit Modal ----------------------------

interface TaskModalProps {
  projectId: string;
  members: Member[];
  initialStatus: TaskStatus;
  editTask?: Task | null;
  onClose: () => void;
  onSaved: (task: Task) => void;
}

function TaskModal({
  projectId,
  members,
  initialStatus,
  editTask,
  onClose,
  onSaved,
}: TaskModalProps) {
  const isEdit = Boolean(editTask);

  const [title, setTitle] = useState(editTask?.title ?? "");
  const [description, setDescription] = useState(editTask?.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(editTask?.priority ?? "MEDIUM");
  const [status, setStatus] = useState<TaskStatus>(editTask?.status ?? initialStatus);
  const [assignedToId, setAssignedToId] = useState(editTask?.assignedToId ?? "");
  const [dueDate, setDueDate] = useState(
    editTask?.dueDate ? editTask.dueDate.slice(0, 10) : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      title,
      description: description || null,
      priority,
      status,
      assignedToId: assignedToId || null,
      dueDate: dueDate || null,
    };

    try {
      const url = isEdit
        ? `/api/projects/${projectId}/tasks/${editTask!.id}`
        : `/api/projects/${projectId}/tasks`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Không thể lưu công việc.");
      } else {
        onSaved(data.task);
        onClose();
      }
    } catch {
      setError("Đã xảy ra lỗi kết nối.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
            {isEdit ? "Chỉnh sửa công việc" : "Thêm công việc mới"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-muted-foreground hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Tiêu đề *
            </label>
            <input
              type="text"
              required
              placeholder="Mô tả ngắn gọn công việc..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#161620] border border-[#27273a] focus:border-indigo-500/60 rounded-xl py-2 px-4 text-sm text-white placeholder-muted-foreground outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Mô tả
            </label>
            <textarea
              rows={2}
              placeholder="Chi tiết, ghi chú thêm..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#161620] border border-[#27273a] focus:border-indigo-500/60 rounded-xl py-2.5 px-4 text-sm text-white placeholder-muted-foreground outline-none transition-all resize-none"
            />
          </div>

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Trạng thái
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-[#161620] border border-[#27273a] focus:border-indigo-500/60 rounded-xl py-2 px-3 text-sm text-white outline-none"
              >
                {Object.entries(TASK_STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Độ ưu tiên
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-[#161620] border border-[#27273a] focus:border-indigo-500/60 rounded-xl py-2 px-3 text-sm text-white outline-none"
              >
                <option value="LOW">Thấp</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HIGH">Cao</option>
              </select>
            </div>
          </div>

          {/* Assignee + Due Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Giao cho
              </label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full bg-[#161620] border border-[#27273a] focus:border-indigo-500/60 rounded-xl py-2 px-3 text-sm text-white outline-none"
              >
                <option value="">Chưa phân công</option>
                {members.map((m) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.name || m.user.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Hạn hoàn thành
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#161620] border border-[#27273a] focus:border-indigo-500/60 rounded-xl py-2 px-3 text-sm text-white outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
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
                <span>{isEdit ? "Lưu thay đổi" : "Tạo công việc"}</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ---- Task Card Component -----------------------------------

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

function TaskCard({ task, index, onEdit, onDelete }: TaskCardProps) {
  const priorityMeta = TASK_PRIORITY_META[task.priority];

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEdit(task)}
          className={cn(
            "glass-card p-4 rounded-xl border border-border/40 hover:border-border/80 transition-all cursor-pointer group",
            snapshot.isDragging && "shadow-2xl border-indigo-500/40 rotate-1 scale-[1.02]"
          )}
        >
          {/* Title + Delete */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-xs font-semibold text-white leading-snug line-clamp-2 flex-1">
              {task.title}
            </h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-neutral-800 hover:text-red-400 text-muted-foreground transition-all cursor-pointer shrink-0"
              title="Xóa công việc"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          {task.description && (
            <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3 leading-normal">
              {task.description}
            </p>
          )}

          {/* Footer meta */}
          <div className="flex items-center justify-between gap-2 border-t border-border/30 pt-2.5 mt-2">
            <span
              className={cn(
                "text-[9px] px-2 py-0.5 rounded-full border font-medium",
                priorityMeta.className
              )}
            >
              {priorityMeta.label}
            </span>

            <div className="flex items-center space-x-2">
              {task.dueDate && (
                <div
                  className="flex items-center space-x-0.5 text-[9px] text-muted-foreground"
                  title="Hạn hoàn thành"
                >
                  <Calendar className="w-2.5 h-2.5" />
                  <span>{formatShortDate(task.dueDate)}</span>
                </div>
              )}

              {task.assignedTo ? (
                <img
                  src={
                    task.assignedTo.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(task.assignedTo.name || "")}`
                  }
                  alt={task.assignedTo.name || "User"}
                  className="w-5 h-5 rounded-full border border-neutral-900 bg-neutral-800"
                  title={`Giao cho: ${task.assignedTo.name}`}
                />
              ) : (
                <div
                  className="w-5 h-5 rounded-full border border-neutral-800 flex items-center justify-center"
                  title="Chưa giao"
                >
                  <User className="w-2.5 h-2.5 text-neutral-600" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

// ---- Main TaskBoard ----------------------------------------

export default function TaskBoard({
  projectId,
  members,
  tasks,
  onTasksChange,
  onAddTask,
  onDeleteTask,
}: TaskBoardProps) {
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<TaskStatus>("TODO");
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openCreate = (status: TaskStatus) => {
    setEditingTask(null);
    setModalStatus(status);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setModalStatus(task.status);
    setModalOpen(true);
  };

  const handleSaved = (task: Task) => {
    if (editingTask) {
      // Update existing task in list
      const updated = tasks.map((t) => (t.id === task.id ? task : t));
      onTasksChange(updated);
    } else {
      onAddTask(task);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Xóa công việc này?")) return;

    const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      onDeleteTask(taskId);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const destStatus = destination.droppableId as TaskStatus;

    const taskIndex = tasks.findIndex((t) => t.id === draggableId);
    if (taskIndex === -1 || tasks[taskIndex].status === destStatus) return;

    // Optimistic update
    const updated = [...tasks];
    updated[taskIndex] = { ...updated[taskIndex], status: destStatus };
    onTasksChange(updated);

    try {
      const res = await fetch(
        `/api/projects/${projectId}/tasks/${draggableId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: destStatus }),
        }
      );
      if (!res.ok) {
        // Rollback
        onTasksChange(tasks);
      }
    } catch {
      onTasksChange(tasks);
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter((t) => t.status === col.id);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  return (
    <div className="flex flex-col">
      {/* Board Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-white">Bảng công việc</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kéo thả để cập nhật trạng thái. Nhấn vào thẻ để chỉnh sửa.
          </p>
        </div>
        <button
          onClick={() => openCreate("TODO")}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-border hover:border-indigo-500/30 text-white text-xs cursor-pointer transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm công việc</span>
        </button>
      </div>

      {/* Kanban Columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col) => (
            <div
              key={col.id}
              className={cn(
                "glass-panel border-t-2 rounded-2xl p-4 flex flex-col",
                col.accentClass,
                "border-border/40"
              )}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">
                    {TASK_STATUS_LABELS[col.id]}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-neutral-800 text-[9px] text-muted-foreground font-semibold">
                    {tasksByStatus[col.id].length}
                  </span>
                </div>
                <button
                  onClick={() => openCreate(col.id)}
                  className="p-1 rounded hover:bg-neutral-800 text-muted-foreground hover:text-white transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Droppable area */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex-grow min-h-[300px] space-y-3 transition-colors rounded-xl",
                      snapshot.isDraggingOver && "bg-white/[0.02]"
                    )}
                  >
                    {tasksByStatus[col.id].map((task, index) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        index={index}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                    {provided.placeholder}

                    {tasksByStatus[col.id].length === 0 && (
                      <div className="border border-dashed border-neutral-800/50 rounded-xl py-8 text-center text-[10px] text-neutral-600 select-none">
                        Kéo thẻ vào đây
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Task Modal */}
      <AnimatePresence>
        {modalOpen && (
          <TaskModal
            projectId={projectId}
            members={members}
            initialStatus={modalStatus}
            editTask={editingTask}
            onClose={() => {
              setModalOpen(false);
              setEditingTask(null);
            }}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
