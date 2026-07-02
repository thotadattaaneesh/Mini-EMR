import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

// This function is to get all the Prescriptions used by the admin only
export async function GET(request: NextRequest) {
  try {
    let queryOptions: any = {
      include: { user: { select: { id: true, name: true, email: true } } }
    };

    const token = getTokenFromRequest(request);
    if (token) {
      const payload = await verifyToken(token);
      if (payload && payload.type === 'access' && payload.role !== 'admin') {
        queryOptions.where = { userId: payload.userId };
      }
    }

    const prescriptions = await prisma.prescription.findMany(queryOptions);
    return NextResponse.json(prescriptions);
  } catch (error) {
    console.error("[GET /api/prescriptions] Error:", error);
    return NextResponse.json({
      error: "Failed to fetch prescriptions",
    }, { status: 500 });
  }
}

// Add a new medication, used byt he Doctor but since the limitaions of the assignment we are confined it to the Admin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.medication || typeof body.medication !== 'string') {
      return NextResponse.json({ error: "medication is required and must be a string" }, { status: 400 });
    }
    if (!body.dosage || typeof body.dosage !== 'string') {
      return NextResponse.json({ error: "dosage is required and must be a string" }, { status: 400 });
    }
    if (!body.quantity || isNaN(parseInt(body.quantity)) || parseInt(body.quantity) <= 0) {
      return NextResponse.json({ error: "quantity is required and must be a positive number" }, { status: 400 });
    }
    if (!body.refill_on || isNaN(Date.parse(body.refill_on))) {
      return NextResponse.json({ error: "refill_on is required and must be a valid date string" }, { status: 400 });
    }
    if (!body.userId || isNaN(parseInt(body.userId))) {
      return NextResponse.json({ error: "userId is required and must be a valid ID" }, { status: 400 });
    }

    const token = getTokenFromRequest(request);
    if (token) {
      const payload = await verifyToken(token);
      if (payload && payload.type === 'access') {
        if (payload.role !== 'admin' && body.userId && parseInt(body.userId) !== payload.userId) {
          return NextResponse.json({ error: "Unauthorized: Cannot create prescription for another user" }, { status: 403 });
        }
        if (payload.role !== 'admin') {
          body.userId = payload.userId; // Enforce their own ID
        }
      }
    }

    const prescription = await prisma.prescription.create({
      data: {
        medication: body.medication,
        dosage: body.dosage,
        quantity: parseInt(body.quantity),
        refill_on: new Date(body.refill_on),
        refill_schedule: body.refill_schedule || "none",
        userId: parseInt(body.userId),
      },
    });
    return NextResponse.json(prescription, { status: 201 });
  } catch (error) {
    console.error("[POST /api/prescriptions] Error:", error);
    return NextResponse.json({
      error: "Failed to create prescription",
    }, { status: 500 });
  }
}