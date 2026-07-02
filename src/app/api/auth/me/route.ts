import { NextResponse, NextRequest } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';

// This is a get request which is used to get the patients details exclusively for deep dive into the patients details in admin
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.type !== 'access') {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const patient = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true }
    });

    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    return NextResponse.json(patient, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
