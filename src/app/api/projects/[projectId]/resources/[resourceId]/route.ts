import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string; resourceId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Chưa xác thực." }, { status: 401 });
    }

    const { projectId, resourceId } = await params;
    const userId = (session.user as any).id;

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
        { error: "Bạn không có quyền xóa tài nguyên." },
        { status: 403 }
      );
    }

    // 2. Fetch resource details
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource || resource.projectId !== projectId) {
      return NextResponse.json(
        { error: "Không tìm thấy liên kết tài nguyên này." },
        { status: 404 }
      );
    }

    // 3. Delete and log
    await prisma.$transaction(async (tx) => {
      await tx.resource.delete({
        where: { id: resourceId },
      });

      await tx.activity.create({
        data: {
          projectId,
          userId,
          action: `đã xóa liên kết tài nguyên "${resource.title}"`,
        },
      });
    });

    return NextResponse.json({ message: "Đã xóa tài nguyên thành công." });
  } catch (error: any) {
    console.error("Lỗi xóa tài nguyên:", error);
    return NextResponse.json(
      { error: "Không thể xóa tài nguyên." },
      { status: 500 }
    );
  }
}
