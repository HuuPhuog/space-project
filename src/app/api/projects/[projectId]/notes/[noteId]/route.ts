import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string; noteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Chưa xác thực." }, { status: 401 });
    }

    const { projectId, noteId } = await params;
    const userId = (session.user as any).id;
    const { title, content } = await request.json();

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
        { error: "Bạn không có quyền chỉnh sửa ghi chú." },
        { status: 403 }
      );
    }

    // 2. Fetch original note
    const originalNote = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!originalNote || originalNote.projectId !== projectId) {
      return NextResponse.json(
        { error: "Không tìm thấy ghi chú này." },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;

    // 3. Update note (we don't flood the activities on every keypress)
    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: updateData,
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

    return NextResponse.json({ note: updatedNote });
  } catch (error: any) {
    console.error("Lỗi cập nhật ghi chú:", error);
    return NextResponse.json(
      { error: "Không thể lưu ghi chú." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string; noteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Chưa xác thực." }, { status: 401 });
    }

    const { projectId, noteId } = await params;
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
        { error: "Bạn không có quyền xóa ghi chú." },
        { status: 403 }
      );
    }

    // 2. Fetch note details
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note || note.projectId !== projectId) {
      return NextResponse.json(
        { error: "Không tìm thấy ghi chú này." },
        { status: 404 }
      );
    }

    // 3. Delete and log
    await prisma.$transaction(async (tx) => {
      await tx.note.delete({
        where: { id: noteId },
      });

      await tx.activity.create({
        data: {
          projectId,
          userId,
          action: `đã xóa ghi chú "${note.title}"`,
        },
      });
    });

    return NextResponse.json({ message: "Đã xóa ghi chú thành công." });
  } catch (error: any) {
    console.error("Lỗi xóa ghi chú:", error);
    return NextResponse.json(
      { error: "Không thể xóa ghi chú." },
      { status: 500 }
    );
  }
}
