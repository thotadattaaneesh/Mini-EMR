import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

// Getting all the appointments for a user used by admin 
export async function GET(request: NextRequest) {
  try {
    let queryOptions: any = {
      include: { user: { select: { id: true, name: true, email: true } } }
    };

    const token = getTokenFromRequest(request);
    if (token) {
      const payload = await verifyToken(token);
      if (payload && payload.type === 'access') {
        queryOptions.where = { userId: payload.userId };
      }
    }

    const appointments = await prisma.appointment.findMany(queryOptions);
    return NextResponse.json(appointments);
  } catch (error) {
    console.error("[GET /api/appointments] Error:", error);
    return NextResponse.json({
      error: "Failed to fetch appointments",
    }, { status: 500 });
  }
}


// Posting an appointment for a patient used by admin and also the portal for booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.provider || typeof body.provider !== 'string') {
      return NextResponse.json({ error: "provider is required and must be a string" }, { status: 400 });
    }
    if (!body.datetime || isNaN(Date.parse(body.datetime))) {
      return NextResponse.json({ error: "datetime is required and must be a valid date string" }, { status: 400 });
    }
    if (!body.userId || isNaN(parseInt(body.userId))) {
      return NextResponse.json({ error: "userId is required and must be a valid ID" }, { status: 400 });
    }

    const token = getTokenFromRequest(request);
    if (token) {
      const payload = await verifyToken(token);
      if (payload && payload.type === 'access') {
        if (body.userId && parseInt(body.userId) !== payload.userId) {
          return NextResponse.json({ error: "Unauthorized: Cannot create appointment for another user" }, { status: 403 });
        }
        body.userId = payload.userId; // Enforce their own ID
      }
    }

    const appointment = await prisma.appointment.create({
      data: {
        provider: body.provider,
        datetime: new Date(body.datetime),
        repeat: body.repeat || "none",
        userId: parseInt(body.userId),
      },
    });
    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("[POST /api/appointments] Error:", error);
    return NextResponse.json({
      error: "Failed to create appointment",
    }, { status: 500 });
  }
}