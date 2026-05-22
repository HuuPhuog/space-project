import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Chưa xác thực." }, { status: 401 });
    }

    const { projectId } = await params;
    const currentUserId = (session.user as any).id;
    const { email, role } = await request.json();

    if (!email || email.trim() === "") {
      return NextResponse.json(
        { error: "Vui lòng cung cấp địa chỉ email." },
        { status: 400 }
      );
    }

    // 1. Verify current user is a member/owner of the project
    const currentMembership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: currentUserId,
        },
      },
    });

    if (!currentMembership || currentMembership.role === "VIEWER") {
      return NextResponse.json(
        { error: "Bạn không có quyền mời thành viên mới vào dự án này." },
        { status: 403 }
      );
    }

    // 2. Find target user by email
    const targetUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng có email này. Hãy chắc chắn họ đã đăng ký." },
        { status: 404 }
      );
    }

    // 3. Check if user is already a member
    const existingMembership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: targetUser.id,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "Người dùng này đã là thành viên của dự án." },
        { status: 400 }
      );
    }

    // 4. Create new member & activity
    const newMember = await prisma.$transaction(async (tx) => {
      const member = await tx.projectMember.create({
        data: {
          projectId,
          userId: targetUser.id,
          role: role || "MEMBER",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      });

      await tx.activity.create({
        data: {
          projectId,
          userId: currentUserId,
          action: `đã thêm thành viên "${targetUser.name || targetUser.email}" vào dự án`,
        },
      });

      return member;
    });

    return NextResponse.json({ member: newMember }, { status: 201 });
  } catch (error: any) {
    console.error("Lỗi thêm thành viên:", error);
    return NextResponse.json(
      { error: "Không thể thêm thành viên." },
      { status: 500 }
    );
  }
}
