"use client";

import { useState, useEffect } from "react";
import {
  Users, Activity, Send, Loader2, CheckCircle2,
  TrendingUp, CircleAlert,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Member, ActivityItem, Task } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

interface ActivityFeedProps {
  projectId: string;
  members: Member[];
  activities: ActivityItem[];
  tasks: Task[];
  onAddMember: (newMember: Member) => void;
  onAddActivity: (newActivity: ActivityItem) => void;
}

export default function ActivityFeed({
  projectId,
  members,
  activities,
  tasks,
  onAddMember,
  onAddActivity,
}: ActivityFeedProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Không thể thêm thành viên.");
      } else {
        setSuccess(`Đã thêm ${data.member.user.name || email} vào dự án!`);
        onAddMember(data.member);

        const newActivity: ActivityItem = {
          id: `local-${Date.now()}`,
          action: `đã thêm thành viên "${data.member.user.name || email}" vào dự án`,
          createdAt: new Date().toISOString(),
          user: {
            id: data.member.user.id,
            name: data.member.user.name,
            avatar: data.member.user.avatar,
          },
        };
        onAddActivity(newActivity);
        setEmail("");
      }
    } catch {
      setError("Đã xảy ra lỗi kết nối.");
    } finally {
      setLoading(false);
    }
  };

  // Project metrics
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "DONE").length;
  const progressPercent =
    totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Activity Timeline */}
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-border/40">
          <div className="flex items-center space-x-2 mb-6">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Hoạt động gần đây</h2>
          </div>

          {activities.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground">
              Chưa có hoạt động nào được ghi nhận.
            </div>
          ) : (
            <div className="relative border-l border-neutral-800 ml-3 pl-6 space-y-6">
              {activities.map((act, index) => (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  className="relative group"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-neutral-900 border-2 border-indigo-500 group-hover:bg-indigo-400 transition-colors" />

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="font-semibold text-xs text-white">
                        {act.user.name || "Thành viên"}
                      </span>{" "}
                      <span className="text-xs text-muted-foreground">
                        {act.action}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-500 whitespace-nowrap pt-0.5">
                      {formatRelativeTime(act.createdAt)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Utilities */}
      <div className="space-y-6">
        {/* Progress Card */}
        <div className="glass-panel p-6 rounded-2xl border border-border/40 bg-gradient-to-br from-[#12121c] to-transparent">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Tiến độ dự án</h3>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <span className="text-2xl font-extrabold text-white">
                {progressPercent}%
              </span>
              <span className="text-xs text-muted-foreground">
                {doneTasks}/{totalTasks} công việc
              </span>
            </div>

            <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Invite Member Card */}
        <div className="glass-panel p-6 rounded-2xl border border-border/40">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Thêm thành viên</h3>
          </div>

          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Nhập email của người dùng đã có tài khoản để mời tham gia dự án.
          </p>

          {error && (
            <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] flex items-start gap-1.5">
              <CircleAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleInvite} className="space-y-3">
            <input
              type="email"
              required
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#161620] border border-[#27273a] focus:border-[#6366f1]/60 focus:ring-1 focus:ring-[#6366f1]/60 rounded-xl py-2 px-3.5 text-xs text-white placeholder-muted-foreground outline-none transition-all"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-neutral-900 hover:bg-[#6366f1]/10 border border-[#27273a] hover:border-[#6366f1]/30 text-white text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>Gửi lời mời</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Members list */}
          {members.length > 0 && (
            <div className="mt-5 pt-4 border-t border-border/30 space-y-2.5">
              {members.map((m) => (
                <div key={m.user.id} className="flex items-center space-x-2.5">
                  <img
                    src={
                      m.user.avatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.user.name || m.user.email)}`
                    }
                    alt={m.user.name || "User"}
                    className="w-6 h-6 rounded-full border border-neutral-800 bg-neutral-800 shrink-0"
                  />
                  <div className="overflow-hidden flex-1">
                    <p className="text-[11px] font-semibold text-white truncate">
                      {m.user.name || m.user.email}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      {m.role === "OWNER" ? "Trưởng nhóm" : "Thành viên"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
