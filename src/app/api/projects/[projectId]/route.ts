import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
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

    // Check membership
    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Bạn không có quyền truy cập dự án này." },
        { status: 403 }
      );
    }

    // Get project with all details
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
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
        },
        tasks: {
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
          orderBy: {
            createdAt: "asc",
          },
        },
        notes: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
        resources: {
          orderBy: {
            createdAt: "desc",
          },
        },
        activities: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 30, // Last 30 activities
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Dự án không tồn tại." },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error("Lỗi lấy chi tiết dự án:", error);
    return NextResponse.json(
      { error: "Không thể tải thông tin dự án." },
      { status: 500 }
    );
  }
}
