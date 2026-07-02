import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, verifyToken, getTokenFromRequest } from '@/lib/auth';

// This function is to get all the patients used by the Admin
export async function GET(request: NextRequest) {
  try {
    let queryOptions: any = {
      select: { name: true, email: true, id: true }
    };

    const token = getTokenFromRequest(request);
    if (token) {
      const payload = await verifyToken(token);
      if (payload && payload.type === 'access') {
        queryOptions.where = { id: payload.userId };
      }
    }

    const patients = await prisma.user.findMany(queryOptions);
    return NextResponse.json(patients);
  } catch (error) {
    console.error("[GET /api/patients] Error:", error);
    return NextResponse.json({
      error: "Failed to fetch patients",
    }, { status: 500 });
  }
}

// This function is to create a new patient used by the Admin
export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name is required and must be a string' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'email is required and must be a valid email address' }, { status: 400 });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'password is required and must be at least 6 characters long' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    return NextResponse.json({ message: "Success" }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/patients] Error:", error);
    return NextResponse.json({
      error: "Failed to create patient",
    }, { status: 500 });
  }
}