import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createCourseSchema } from "@/lib/schemas/course,schema";
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

    //Declaration Data
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const thumbnail = formData.get("thumbnail") as File;

    //Validate Request
    const validation = createCourseSchema.safeParse({ title, description, price });
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    if (!thumbnail) {
      return NextResponse.json({ error: "Thumbnail file required" }, { status: 400 });
    }

    // Upload file ke Supabase Storage
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

    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        price,
        thumbnail: publicUrl,
      },
    });

    return NextResponse.json(
      { data: newCourse, message: "Course created successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error, message: "Course creation failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    //Declare searchParams for searching bar
    const { searchParams } = new URL(req.url);

    // 3 parameter: search, pagination, dan sortBy
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const skip = (page - 1) * limit;

    // Count total data
    const total = await prisma.course.count({
      where: {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
    });

    // Get data courses
    const courses = await prisma.course.findMany({
      where: {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
      include: {
        mentor: true, // include mentor relation if needed
      },
    });

    return NextResponse.json({
      data: courses,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({ error, message: "Get course data failed" }, { status: 500 });
  }
}
