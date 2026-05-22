import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ email và mật khẩu." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email này đã được sử dụng." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    // Generate standard avatar url using initial if none provided
    const nameInitial = name ? name.charAt(0).toUpperCase() : email.charAt(0).toUpperCase();
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameInitial)}&backgroundColor=2e1065&textColor=f3e8ff`;

    const user = await prisma.user.create({
      data: {
        name: name || email.split("@")[0],
        email,
        password: hashedPassword,
        avatar: avatarUrl,
      },
    });

    return NextResponse.json(
      {
        message: "Đăng ký thành công!",
        user: { id: user.id, email: user.email, name: user.name },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Lỗi đăng ký:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi hệ thống trong quá trình đăng ký." },
      { status: 500 }
    );
  }
}
