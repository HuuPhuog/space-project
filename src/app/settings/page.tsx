"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Terminal, ArrowLeft, User, Loader2, Check, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getAvatarUrl } from "@/lib/utils";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
}

export default function SettingsPage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        setName(data.user.name ?? "");
        setAvatar(data.user.avatar ?? "");
      }
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatar }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Không thể lưu hồ sơ.");
      } else {
        setProfile(data.user);
        setSuccess(true);
        // Refresh NextAuth session so name updates in UI
        await updateSession({ name: data.user.name });
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      setError("Đã xảy ra lỗi kết nối.");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background min-h-screen">
        <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const avatarSrc = avatar || getAvatarUrl(name || profile?.email);

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      {/* Header */}
      <header className="border-b border-[#1e1e24]/60 backdrop-blur-md sticky top-0 z-40 bg-background/50">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="flex items-center space-x-1.5 text-muted-foreground hover:text-white transition-colors text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center space-x-2 text-indigo-400">
              <Terminal className="w-4 h-4" />
              <span className="text-sm font-bold tracking-wider text-white">
                PROJECT SPACE
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white mb-1">
            Hồ sơ cá nhân
          </h1>
          <p className="text-sm text-muted-foreground">
            Cập nhật tên hiển thị và ảnh đại diện của bạn.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-8 border border-border/40 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

          {/* Avatar preview */}
          <div className="flex items-center space-x-5 mb-8 pb-8 border-b border-border/30">
            <img
              src={avatarSrc}
              alt={name || "User"}
              className="w-16 h-16 rounded-2xl border-2 border-indigo-500/30 bg-neutral-900 object-cover"
            />
            <div>
              <p className="text-base font-bold text-white">{name || "Người dùng"}</p>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
              <p className="text-[10px] text-indigo-400 mt-1">
                Ảnh đại diện được tạo tự động từ tên nếu bạn không nhập URL.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Họ và tên *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#161620] border border-[#27273a] focus:border-indigo-500/60 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-muted-foreground outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                URL ảnh đại diện (tùy chọn)
              </label>
              <input
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full bg-[#161620] border border-[#27273a] focus:border-indigo-500/60 rounded-xl py-2.5 px-4 text-sm text-white placeholder-muted-foreground outline-none transition-all"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-[10px] text-muted-foreground">
                Email:{" "}
                <span className="text-neutral-300">{profile?.email}</span>
                <span className="ml-2 text-neutral-600">(không thể thay đổi)</span>
              </p>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 text-white font-medium text-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : success ? (
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
      </main>
    </div>
  );
}
