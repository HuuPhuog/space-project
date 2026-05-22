"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Terminal, Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Đã xảy ra lỗi kết nối.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-radial from-[#12121c] to-background">
      <div className="w-full max-w-md">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2 text-[#6366f1]">
            <div className="p-3 rounded-2xl bg-[#6366f1]/10 border border-[#6366f1]/20">
              <Terminal className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              PROJECT SPACE
            </span>
          </div>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel p-8 rounded-2xl shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6366f1] to-transparent opacity-50" />
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Chào mừng trở lại</h1>
            <p className="text-sm text-muted-foreground">
              Đăng nhập để tiếp tục làm việc cùng nhóm của bạn.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#161620] border border-[#27273a] focus:border-[#6366f1]/60 focus:ring-1 focus:ring-[#6366f1]/60 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-muted-foreground outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#161620] border border-[#27273a] focus:border-[#6366f1]/60 focus:ring-1 focus:ring-[#6366f1]/60 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-muted-foreground outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#5558e6] hover:to-[#7c4df2] text-white font-medium text-sm transition-all shadow-md shadow-[#6366f1]/20 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-[#6366f1] hover:underline font-medium">
              Đăng ký ngay
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
