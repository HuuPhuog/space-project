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
    const { title, url, type } = await request.json();

    if (!title || title.trim() === "" || !url || url.trim() === "") {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ tiêu đề và liên kết URL." },
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
        { error: "Bạn không có quyền thêm tài nguyên." },
        { status: 403 }
      );
    }

    // 2. Create resource & activity
    const resource = await prisma.$transaction(async (tx) => {
      const r = await tx.resource.create({
        data: {
          projectId,
          title,
          url,
          type: type || "OTHER",
        },
      });

      await tx.activity.create({
        data: {
          projectId,
          userId,
          action: `đã thêm tài nguyên mới "${title}"`,
        },
      });

      return r;
    });

    return NextResponse.json({ resource }, { status: 201 });
  } catch (error: any) {
    console.error("Lỗi thêm tài nguyên:", error);
    return NextResponse.json(
      { error: "Không thể thêm tài nguyên mới." },
      { status: 500 }
    );
  }
}
