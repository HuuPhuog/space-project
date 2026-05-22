import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string; taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Chưa xác thực." }, { status: 401 });
    }

    const { projectId, taskId } = await params;
    const userId = (session.user as any).id;
    const body = await request.json();

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
        { error: "Bạn không có quyền chỉnh sửa công việc." },
        { status: 403 }
      );
    }

    // 2. Fetch original task to detect status or assignee change
    const originalTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!originalTask || originalTask.projectId !== projectId) {
      return NextResponse.json(
        { error: "Không tìm thấy công việc này." },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.assignedToId !== undefined) updateData.assignedToId = body.assignedToId;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;

    // 3. Update and log
    const updatedTask = await prisma.$transaction(async (tx) => {
      const task = await tx.task.update({
        where: { id: taskId },
        data: updateData,
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      // Construct activity description
      let actionStr = "";
      if (body.status && body.status !== originalTask.status) {
        const statusLabels: Record<string, string> = {
          TODO: "Cần làm",
          IN_PROGRESS: "Đang làm",
          REVIEW: "Đánh giá",
          DONE: "Hoàn thành",
        };
        actionStr = `đã chuyển công việc "${task.title}" sang cột "${statusLabels[body.status]}"`;
      } else if (body.assignedToId !== undefined && body.assignedToId !== originalTask.assignedToId) {
        if (body.assignedToId) {
          const assignedUser = await tx.user.findUnique({
            where: { id: body.assignedToId },
            select: { name: true, email: true },
          });
          actionStr = `đã giao công việc "${task.title}" cho "${assignedUser?.name || assignedUser?.email}"`;
        } else {
          actionStr = `đã hủy giao công việc "${task.title}"`;
        }
      } else {
        actionStr = `đã cập nhật công việc "${task.title}"`;
      }

      await tx.activity.create({
        data: {
          projectId,
          userId,
          action: actionStr,
        },
      });

      return task;
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error: any) {
    console.error("Lỗi cập nhật công việc:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật công việc." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string; taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Chưa xác thực." }, { status: 401 });
    }

    const { projectId, taskId } = await params;
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
        { error: "Bạn không có quyền xóa công việc." },
        { status: 403 }
      );
    }

    // 2. Fetch task details to get title for activity log
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.projectId !== projectId) {
      return NextResponse.json(
        { error: "Không tìm thấy công việc này." },
        { status: 404 }
      );
    }

    // 3. Delete and log
    await prisma.$transaction(async (tx) => {
      await tx.task.delete({
        where: { id: taskId },
      });

      await tx.activity.create({
        data: {
          projectId,
          userId,
          action: `đã xóa công việc "${task.title}"`,
        },
      });
    });

    return NextResponse.json({ message: "Đã xóa công việc thành công." });
  } catch (error: any) {
    console.error("Lỗi xóa công việc:", error);
    return NextResponse.json(
      { error: "Không thể xóa công việc." },
      { status: 500 }
    );
  }
}
