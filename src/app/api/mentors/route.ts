import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createMentorsSchema } from "@/lib/schemas/mentors.schema";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { message: "Unauthorized: Only admin users can add mentors" },
      { status: 403 }
    );
  }

  try {
    const formData = await req.formData();

    // Get Main Data
    const name = formData.get("name") as string;
    const company = formData.get("company") as string;
    const specialization = formData.get("specialization") as string;
    const photoUrl = formData.get("photo_url") as File;

    // Ubah ke string atau null
    const companyValue = company ? String(company) : null;
    const specializationValue = specialization ? String(specialization) : null;

    if (!photoUrl) {
      return NextResponse.json({ error: "Photo required" }, { status: 400 });
    }

    // Schema Validation
    const validation = createMentorsSchema.safeParse({ name, company, specialization });

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Upload Photo to Bucket
    const fileExt = photoUrl.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const bucketName = "skillplus";
    const filePath = `mentors/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, photoUrl, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const publicUrl = supabase.storage.from(bucketName).getPublicUrl(filePath).data.publicUrl;

    const newMentors = await prisma.mentor.create({
      data: {
        name,
        company: companyValue,
        specialization: specializationValue,
        photo_url: publicUrl,
      },
    });

    return NextResponse.json(
      { message: "Mentor created successfully", data: newMentors },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating mentor:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
    const total = await prisma.mentor.count({
      where: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    });

    // Get Mentors Data
    const courses = await prisma.mentor.findMany({
      where: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take: limit,
      include: {
        Course: true,
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
    console.error("GET /api/mentors error:", error);
    return NextResponse.json(
      { success: false, message: "Get mentors data failed", error },
      { status: 500 }
    );
  }
}
