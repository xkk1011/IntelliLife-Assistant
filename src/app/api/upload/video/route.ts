import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getBeijingTime } from "@/lib/utils";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { ALLOWED_VIDEO_TYPES, MAX_VIDEO_SIZE } from "@/types/fitness-plan";

// 上传视频文件
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("video") as File;

    if (!file) {
      return NextResponse.json({ error: "请选择视频文件" }, { status: 400 });
    }

    // 验证文件类型
    if (
      !ALLOWED_VIDEO_TYPES.includes(
        file.type as (typeof ALLOWED_VIDEO_TYPES)[number]
      )
    ) {
      return NextResponse.json(
        {
          error:
            "不支持的文件类型，请上传 MP4、WebM、AVI、MOV 或 WMV 格式的视频",
        },
        { status: 400 }
      );
    }

    // 验证文件大小
    if (file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        {
          error: "文件大小不能超过 300MB",
        },
        { status: 400 }
      );
    }

    // 生成文件路径
    const fileId = uuidv4();
    const extension = file.name.split(".").pop();
    const fileName = `${file.name.split(".")[0]}-${fileId}.${extension}`;

    const currentDate = getBeijingTime();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");

    const uploadDir = join(
      process.cwd(),
      "public",
      "uploads",
      "videos",
      year.toString(),
      month,
      session.user.id
    );
    const filePath = join(uploadDir, fileName);
    const publicUrl = `/uploads/videos/${year}/${month}/${session.user.id}/${fileName}`;

    try {
      // 创建目录并保存文件
      await mkdir(uploadDir, { recursive: true });
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // 保存到数据库
      const videoRecord = await prisma.userVideo.create({
        data: {
          userId: session.user.id,
          filename: fileName,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          path: filePath,
          url: publicUrl,
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: videoRecord,
          message: "视频上传成功",
        },
        { status: 201 }
      );
    } catch (fileError) {
      console.error("文件保存错误:", fileError);
      return NextResponse.json(
        {
          error: "文件保存失败，请重试",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("视频上传错误:", error);
    return NextResponse.json({ error: "视频上传失败" }, { status: 500 });
  }
}

// 获取用户的视频列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    // 获取视频列表
    const [videos, total] = await Promise.all([
      prisma.userVideo.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          _count: {
            select: {
              fitnessItems: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.userVideo.count({
        where: {
          userId: session.user.id,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        videos,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("获取视频列表错误:", error);
    return NextResponse.json({ error: "获取视频列表失败" }, { status: 500 });
  }
}
