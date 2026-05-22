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
    const { title, content } = await request.json();

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Tiêu đề ghi chú không được bỏ trống." },
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
        { error: "Bạn không có quyền tạo ghi chú." },
        { status: 403 }
      );
    }

    // 2. Create note & activity
    const note = await prisma.$transaction(async (tx) => {
      const n = await tx.note.create({
        data: {
          projectId,
          authorId: userId,
          title,
          content: content || "",
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      await tx.activity.create({
        data: {
          projectId,
          userId,
          action: `đã tạo ghi chú mới "${title}"`,
        },
      });

      return n;
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error: any) {
    console.error("Lỗi tạo ghi chú:", error);
    return NextResponse.json(
      { error: "Không thể tạo ghi chú mới." },
      { status: 500 }
    );
  }
}
