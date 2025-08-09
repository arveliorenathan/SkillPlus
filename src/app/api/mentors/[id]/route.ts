import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { editMentorSchema } from "@/lib/schemas/mentors.schema";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { message: "Unauthorized: Only admin users can delete mentors" },
      { status: 403 }
    );
  }
  try {
    const id = params.id;

    const mentor = await prisma.mentor.findUnique({
      where: { id_mentor: id },
    });

    if (!mentor) {
      return NextResponse.json({ message: "Mentor not found" }, { status: 404 });
    }

    await prisma.mentor.delete({
      where: { id_mentor: id },
    });

    return NextResponse.json({ message: "Mentor deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting mentor:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params; // wajib await
  const id = params.id;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { message: "Unauthorized: Only admin users can edit mentors" },
      { status: 403 }
    );
  }
  try {
    const mentor = await prisma.mentor.findUnique({
      where: { id_mentor: id },
    });

    if (!mentor) {
      return NextResponse.json({ message: "Mentor not found" }, { status: 404 });
    }

    const formData = await req.formData();

    const name = formData.get("name") as string | null;
    const company = formData.get("company") as string | null;
    const specialization = formData.get("specialization") as string | null;
    const photoFile = formData.get("photo_url") as File | null;
    const isActiveRaw = formData.get("is_active") as string | null;

    let is_active: boolean | undefined = undefined;
    if (isActiveRaw === "true") is_active = true;
    else if (isActiveRaw === "false") is_active = false;

    const validation = editMentorSchema.partial().safeParse({
      name,
      company,
      specialization,
      is_active
    });

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    let photoUrl: string | undefined;

    // Upload foto jika ada dan ukuran > 0
    if (photoFile && photoFile.size > 0) {
      const ext = photoFile.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;
      const bucket = "skillplus";
      const path = `mentors/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, photoFile, { cacheControl: "3600", upsert: true });

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      photoUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    }

    const updateMentor = await prisma.mentor.update({
      where: { id_mentor: id },
      data: {
        ...(name && { name }),
        ...(company && { company }),
        ...(specialization && { specialization }),
        ...(photoUrl && { photo_url: photoUrl }),
        ...(typeof is_active === "boolean" && { is_active }),
      },
    });

    return NextResponse.json(
      { update: updateMentor, message: "Mentor updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error edit mentor", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
