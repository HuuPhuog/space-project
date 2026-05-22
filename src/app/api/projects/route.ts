import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Chưa xác thực." }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get all projects where user is a member
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
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
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
    });

    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error("Lỗi lấy danh sách dự án:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách dự án." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Chưa xác thực." }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userName = session.user.name || "Thành viên";
    const { title, description } = await request.json();

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Tiêu đề dự án không được bỏ trống." },
        { status: 400 }
      );
    }

    // Create project, membership, and activity inside a transaction
    const project = await prisma.$transaction(async (tx) => {
      // 1. Create project
      const proj = await tx.project.create({
        data: {
          title,
          description,
          ownerId: userId,
        },
      });

      // 2. Add owner to members
      await tx.projectMember.create({
        data: {
          projectId: proj.id,
          userId: userId,
          role: "OWNER",
        },
      });

      // 3. Create activity log
      await tx.activity.create({
        data: {
          projectId: proj.id,
          userId: userId,
          action: `đã tạo dự án "${title}"`,
        },
      });

      return proj;
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error: any) {
    console.error("Lỗi tạo dự án:", error);
    return NextResponse.json(
      { error: "Không thể tạo dự án mới." },
      { status: 500 }
    );
  }
}
