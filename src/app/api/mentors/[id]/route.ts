import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
