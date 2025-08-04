import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { registerSchema } from "@/lib/schemas/user.schema";

// POST /api/register
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    const { username, email, password } = registerSchema
      .omit({ confirmPassword: true })
      .parse(body);

    // Check if email already exists
    const existingUserByEmail = await prisma.users.findUnique({
      where: { email },
    });
    if (existingUserByEmail) {
      return NextResponse.json(
        { user: null, message: "Email is already registered." },
        { status: 409 }
      );
    }

    // Check if username already exists
    const existingUserByUsername = await prisma.users.findUnique({
      where: { username },
    });
    if (existingUserByUsername) {
      return NextResponse.json(
        { user: null, message: "Username is already taken." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const newUser = await prisma.users.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { user: newUser, message: "User created successfully." },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error, message: "User Creation Failed." }, { status: 500 });
  }
}