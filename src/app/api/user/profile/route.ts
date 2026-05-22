import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Chưa xác thực." }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatar: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng." }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Chưa xác thực." }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { name, avatar } = await request.json();

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Tên không được bỏ trống." }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        avatar: avatar?.trim() || null,
      },
      select: { id: true, name: true, email: true, avatar: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("PUT /api/user/profile error:", error);
    return NextResponse.json({ error: "Không thể cập nhật hồ sơ." }, { status: 500 });
  }
}
