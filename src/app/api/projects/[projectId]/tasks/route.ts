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
    const userId = (session.user as any).id;
    const { title, description, priority, assignedToId, dueDate } = await request.json();

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Tiêu đề công việc không được bỏ trống." },
        { status: 400 }
      );
    }

    // 1. Verify membership
    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (!membership || membership.role === "VIEWER") {
      return NextResponse.json(
        { error: "Bạn không có quyền thêm công việc." },
        { status: 403 }
      );
    }

    // 2. Create task and log activity
    const task = await prisma.$transaction(async (tx) => {
      const t = await tx.task.create({
        data: {
          projectId,
          title,
          description,
          priority: priority || "MEDIUM",
          assignedToId: assignedToId || null,
          dueDate: dueDate ? new Date(dueDate) : null,
          status: "TODO",
        },
        include: {
          assignedTo: {
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
          userId,
          action: `đã tạo công việc "${title}"`,
        },
      });

      return t;
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error: any) {
    console.error("Lỗi tạo công việc:", error);
    return NextResponse.json(
      { error: "Không thể tạo công việc mới." },
      { status: 500 }
    );
  }
}
