"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Terminal, Kanban, FileText, Link2, Activity, ArrowRight, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex-grow flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <Terminal className="w-10 h-10 text-[#6366f1] animate-spin" />
          <span className="text-muted-foreground text-sm">Đang tải...</span>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: <Kanban className="w-5 h-5 text-indigo-400" />,
      title: "Bảng Kanban Nhiệm vụ",
      desc: "Kéo thả trực quan, quản lý ưu tiên, tiến độ và phân công công việc dễ dàng."
    },
    {
      icon: <FileText className="w-5 h-5 text-purple-400" />,
      title: "Ghi chú Cộng tác",
      desc: "Lưu giữ tài liệu cuộc họp, biên bản thảo luận hay brainstorm nhanh chóng."
    },
    {
      icon: <Link2 className="w-5 h-5 text-cyan-400" />,
      title: "Kho Tài Nguyên Hub",
      desc: "Tập hợp các liên kết Figma, GitHub, Google Drive ngăn nắp tại một nơi duy nhất."
    },
    {
      icon: <Activity className="w-5 h-5 text-emerald-400" />,
      title: "Dòng Hoạt Động Mượt Mà",
      desc: "Theo dõi cập nhật tức thì của các thành viên trong nhóm mà không gây phiền hà."
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#6366f1]/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-[#8b5cf6]/5 rounded-full blur-[100px] -z-10" />

      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#6366f1]">
            <Terminal className="w-5 h-5" />
            <span className="text-sm font-bold tracking-wider text-white">PROJECT SPACE</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-white transition-colors">
              Đăng nhập
            </Link>
            <Link href="/register" className="px-4 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-all cursor-pointer">
              Đăng ký
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main className="flex-grow max-w-5xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/20 text-xs font-medium text-[#6366f1] mb-2">
            <Star className="w-3 h-3 fill-current" />
            <span>Dành cho các Nhóm Nhỏ & Dự án Sinh Viên</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
            Một không gian gọn nhẹ.<br />
            <span className="bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-cyan-400 bg-clip-text text-transparent">
              Mọi thứ cho dự án ở đây.
            </span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Thay thế các cuộc đối thoại hỗn loạn, các tài liệu thất lạc và bảng quản lý dự án cồng kềnh bằng một trung tâm cộng tác tinh gọn, nhanh chóng và mượt mà.
          </p>

          <div className="flex items-center justify-center space-x-4 pt-4">
            <Link
              href="/register"
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#5558e6] hover:to-[#7c4df2] text-white font-medium text-sm transition-all shadow-lg shadow-[#6366f1]/20 cursor-pointer"
            >
              <span>Bắt đầu miễn phí</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mt-24"
        >
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="glass-panel p-6 rounded-2xl border border-border/40 hover:border-indigo-500/20 text-left transition-all group"
            >
              <div className="p-2.5 rounded-xl bg-neutral-900 border border-border w-fit mb-4 group-hover:bg-[#6366f1]/10 group-hover:border-[#6366f1]/20 transition-all">
                {feat.icon}
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{feat.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
        <p>© 2026 Project Space. Bản quyền thuộc về Phuong Nguyen Huu Coding.</p>
      </footer>
    </div>
  );
}
