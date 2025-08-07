import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { CreateCourseInput, createCourseSchema } from "@/lib/schemas/course.schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { message: "Unauthorized: Only admin users can add course" },
      { status: 403 }
    );
  }

  try {
    const formData = await req.formData();

    // Get Main Data
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const thumbnail = formData.get("thumbnail") as File;
    const lessonsJson = formData.get("lessons") as string;

    if (!thumbnail || !lessonsJson) {
      return NextResponse.json({ error: "Thumbnail and lessons are required" }, { status: 400 });
    }

    const lessons = JSON.parse(lessonsJson);

    // Schema Validation
    const validation = createCourseSchema.safeParse({ title, description, price, lessons });

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Upload Thumbnail to Bucket
    const fileExt = thumbnail.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const bucketName = "skillplus";

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, thumbnail, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const publicUrl = supabase.storage.from(bucketName).getPublicUrl(uploadData.path)
      .data.publicUrl;

    if (!lessons || !Array.isArray(lessons)) {
      return NextResponse.json({ message: "Lessons tidak valid" }, { status: 400 });
    }

    // Save Data to Prisma
    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        price,
        thumbnail: publicUrl,
        Lesson: {
          create: (lessons as CreateCourseInput["lessons"]).map(
            (lesson: CreateCourseInput["lessons"][number], lessonIndex: number) => ({
              title: lesson.title,
              order: lesson.order ?? lessonIndex + 1,
              Module: {
                create: (lesson.modules as CreateCourseInput["lessons"][number]["modules"]).map(
                  (module: CreateCourseInput["lessons"][number]["modules"][number], moduleIndex: number) => ({
                    title: module.title,
                    content: module.content,
                    video_url: module.video_url?.trim() || null,
                    order: module.order ?? moduleIndex + 1,
                  })
                ),
              },
            })
          ),
        },
      },
      include: {
        Lesson: {
          include: {
            Module: true,
          },
        },
      },
    });


    return NextResponse.json(
      { data: newCourse, message: "Course created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/course error:", error);
    return NextResponse.json({ error, message: "Course creation failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 9;
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Count Data Total
    const total = await prisma.course.count({
      where: {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
    });

    // Get Course Data
    const courses = await prisma.course.findMany({
      where: {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      orderBy: {
        createAt: "desc",
      },
      skip,
      take: limit,
      include: {
        mentor: true,
        Lesson: {
          include: {
            Module: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/course error:", error);
    return NextResponse.json(
      { success: false, message: "Get course data failed", error },
      { status: 500 }
    );
  }
}
