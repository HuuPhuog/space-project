# Project Space 🌌

**Project Space** là một không gian cộng tác (collaborative workspace) tinh gọn, hiện đại và tối giản, được thiết kế đặc biệt dành cho các nhóm sinh viên làm bài tập lớn, đồ án tốt nghiệp, nhóm lập trình viên độc lập (indie developers) hoặc các nhóm dự án nhỏ dưới 10 người.

Sản phẩm được tối ưu nhằm mục đích loại bỏ sự phân mảnh thông tin giữa các kênh chat thông thường (Zalo, Messenger, Discord) và các công cụ quản lý dự án cồng kềnh quá tải tính năng, mang lại trải nghiệm cộng tác mượt mà, trực quan "tất cả trong một".

---

## ✨ Tính Năng Nổi Bật (Core Features)

### 🔑 1. Hệ Thống Xác Thực & Bảo Mật (Auth & Security)
- Đăng ký, đăng nhập và đăng xuất an toàn sử dụng **NextAuth v4** (Credentials Provider).
- Bảo vệ các đường dẫn nhạy cảm (`/dashboard`, `/project/:path*`, `/settings`) bằng lớp phòng thủ **Next.js 16 Proxy layer**.
- Cơ chế bảo mật phân quyền: Chỉ thành viên của dự án mới có quyền truy cập không gian làm việc; chỉ Trưởng nhóm (Owner) mới có quyền truy cập phần Cài đặt dự án và Xóa dự án.

### 📊 2. Không Gian Làm Việc (Workspace Dashboard)
- Tổng quan không gian làm việc cá nhân hiển thị toàn bộ dự án hiện có.
- Hỗ trợ tạo mới dự án với hộp thoại modal giao diện kính mờ (Glassmorphism).
- Hiển thị tóm tắt trực quan số lượng thành viên, tổng số công việc, và danh sách các avatar thành viên trên từng card dự án.

### 📋 3. Bảng Kanban Công Việc (Kanban Task Board)
- Bảng Kanban tương tác kéo thả mượt mà với 4 cột trạng thái chuẩn: **Cần làm (Todo)**, **Đang làm (In Progress)**, **Đánh giá (Review)**, và **Hoàn thành (Done)** dựa trên `@hello-pangea/dnd`.
- **Task Edit Modal:** Cho phép bấm trực tiếp vào thẻ công việc để mở modal chỉnh sửa nhanh các trường thông tin: Tiêu đề, Mô tả, Độ ưu tiên (Thấp, Trung bình, Cao), Người đảm nhận (Assignee), và Hạn hoàn thành.
- Cơ chế cập nhật giao diện thông minh (Optimistic UI updates) giúp trạng thái kéo thả phản hồi ngay lập tức trước khi đồng bộ về cơ sở dữ liệu.

### 📝 4. Hệ Thống Ghi Chú Tài Liệu (Markdown Notes)
- Trình soạn thảo văn bản tích hợp thư viện **`react-markdown`** kết hợp **`remark-gfm`** hỗ trợ đầy đủ các định dạng như tiêu đề (#), chữ in đậm/nghiêng, trích dẫn, khối mã nguồn (code block), danh sách và bảng biểu.
- Hỗ trợ xem trước định dạng (Preview mode) sử dụng Tailwind CSS Typography (`prose prose-invert`).
- **Live Debounced Auto-save:** Ghi chú tự động lưu xuống database sau 1.2 giây kể từ khi người dùng dừng gõ, hiển thị trạng thái lưu trực quan (Đang lưu, Đã lưu, Chưa lưu).

### 🔗 5. Kho Tài Nguyên (Resource Hub)
- Nơi lưu trữ tập trung các tài liệu quan trọng của nhóm như: GitHub Repository, Figma Design File, Google Drive, hoặc các tài liệu tham khảo khác.
- Phân loại bằng badge và hiển thị logo thương hiệu tùy chọn cho từng loại link.

### 📈 6. Dòng Hoạt Động & Tiến Độ Dự Án (Activity Feed & Metrics)
- Xem nhật ký hoạt động gần đây của dự án (người thực hiện, thời gian thực hiện, hành động cụ thể).
- Mời thành viên mới tham gia dự án bằng email.
- Biểu đồ thanh tiến độ (Progress bar) tự động tính toán tỷ lệ % hoàn thành dự án dựa trên số lượng công việc ở trạng thái DONE.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion (Animation).
- **Markdown Rendering:** `react-markdown`, `remark-gfm`, `@tailwindcss/typography`.
- **State Management & Drag-Drop:** Zustand, `@hello-pangea/dnd`.
- **Backend APIs:** Next.js API Routes, NextAuth.js.
- **Database ORM:** Prisma ORM.
- **Database Hosting:** Supabase PostgreSQL (Connection Pooling).

---

## ⚙️ Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Setup Guide)

### 1. Yêu cầu hệ thống
- Đã cài đặt **Node.js LTS** (khuyên dùng v18 hoặc v20+).
- Một tài khoản hoặc cơ sở dữ liệu **Supabase** trống.

### 2. Tải mã nguồn và cài đặt dependencies
```bash
git clone https://github.com/HuuPhuog/space-project.git
cd space-project
npm install
```

### 3. Thiết lập biến môi trường
Tạo file `.env` tại thư mục gốc của dự án và điền thông tin kết nối từ Supabase:
```env
# Kết nối Supabase thông qua cơ chế Connection Pooling (cổng 6543)
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-1-[YOUR-REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Kết nối trực tiếp đến database dùng cho hoạt động migration (cổng 5432)
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-1-[YOUR-REGION].pooler.supabase.com:5432/postgres"

# NextAuth config (tạo secret bằng lệnh: openssl rand -base64 32)
NEXTAUTH_SECRET="7f8b9e6ad1c3b52479e0f61d258a36c91a3bcf82debc5e10e4a7d65b16e890c2"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Đẩy cấu trúc bảng lên Database (Prisma Migrations)
```bash
# Thực hiện migrate database và cập nhật Client
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Khởi động chế độ nhà phát triển (Development Mode)
```bash
npm run dev
```
Mở trình duyệt truy cập địa chỉ [http://localhost:3000](http://localhost:3000) để bắt đầu trải nghiệm dự án.

---

## 📁 Cấu Trúc Thư Mục (Folder Structure)

```text
/prisma
 ├── schema.prisma       # Định nghĩa các Model Database (PostgreSQL)
 └── migrations/         # Lưu lịch sử migrate cơ sở dữ liệu
/src
 ├── app
 │    ├── api/           # Định nghĩa toàn bộ Route Handler (APIs)
 │    ├── dashboard/     # Trang quản lý dự án cá nhân
 │    ├── login/         # Trang đăng nhập
 │    ├── register/      # Trang đăng ký
 │    ├── settings/      # Trang thiết lập hồ sơ cá nhân
 │    ├── project/[id]/  # Trang Workspace dự án
 │    ├── globals.css    # Thiết lập theme tối và Glassmorphism
 │    └── proxy.ts       # Bảo vệ các route phân quyền
 ├── components
 │    └── project/       # Giao diện con (TaskBoard, NotesSystem, ResourceHub, ActivityFeed)
 ├── lib
 │    ├── auth.ts        # Cấu hình NextAuth Provider
 │    ├── prisma.ts      # Khởi tạo Prisma Client toàn cục
 │    └── utils.ts       # Các hàm helper: cn(), date formatter, avatar generator
 ├── types
 │    └── index.ts       # Khai báo kiểu TypeScript dùng chung toàn bộ dự án
```

---

## 🔒 Bản Quyền (License)
Bản quyền thuộc về **Phuong Nguyen Huu Coding**. Dự án được xây dựng với mục tiêu cộng tác nhóm tối giản, gọn nhẹ và dễ dàng mở rộng.
