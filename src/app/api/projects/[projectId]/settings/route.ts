import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Chưa xác thực." }, { status: 401 });
    }

    const { projectId } = await params;
    const userId = (session.user as any).id;
    const { title, description } = await request.json();

    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "Tên dự án không được bỏ trống." }, { status: 400 });
    }

    // Only OWNER can update project settings
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!membership || membership.role !== "OWNER") {
      return NextResponse.json({ error: "Chỉ trưởng nhóm mới có thể chỉnh sửa dự án." }, { status: 403 });
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: { title: title.trim(), description: description?.trim() || null },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("PUT /api/projects/[projectId] error:", error);
    return NextResponse.json({ error: "Không thể cập nhật dự án." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Chưa xác thực." }, { status: 401 });
    }

    const { projectId } = await params;
    const userId = (session.user as any).id;

    // Only OWNER can delete project
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!membership || membership.role !== "OWNER") {
      return NextResponse.json({ error: "Chỉ trưởng nhóm mới có thể xóa dự án." }, { status: 403 });
    }

    // Cascade delete handled by Prisma schema (onDelete: Cascade)
    await prisma.project.delete({ where: { id: projectId } });

    return NextResponse.json({ message: "Đã xóa dự án thành công." });
  } catch (error) {
    console.error("DELETE /api/projects/[projectId] error:", error);
    return NextResponse.json({ error: "Không thể xóa dự án." }, { status: 500 });
  }
}
