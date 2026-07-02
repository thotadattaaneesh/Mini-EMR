import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, hashPassword, verifyPassword, getTokenFromRequest } from '@/lib/auth';

// This function is to get the patient by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patientId = parseInt(id);

    const token = getTokenFromRequest(request);
    if (token) {
      const payload = await verifyToken(token);
      if (payload && payload.type === 'access' && payload.userId !== patientId) {
        return NextResponse.json({ error: "Unauthorized: You can only view your own details" }, { status: 403 });
      }
    }

    const patient = await prisma.user.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        name: true,
        email: true,
        appointments: true,
        prescriptions: true,
      }
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json(patient, { status: 200 });
  } catch (error) {
    console.error("[GET /api/patients/[id]] Error:", error);
    return NextResponse.json({
      error: "Failed to fetch patient details",
    }, { status: 500 });
  }
}

// This function is to update the patient by ID used by the Admin 
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patientId = parseInt(id);
    const body = await request.json();

    const token = getTokenFromRequest(request);
    if (token) {
      const payload = await verifyToken(token);
      if (!payload || payload.type !== 'access' || payload.userId !== patientId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      
      if (body.password) {
        if (!body.oldPassword) {
          return NextResponse.json({ error: "oldPassword is required to change password" }, { status: 400 });
        }
        const currentUser = await prisma.user.findUnique({ where: { id: patientId } });
        const isValid = await verifyPassword(body.oldPassword, currentUser!.password);
        if (!isValid) {
          return NextResponse.json({ error: "Invalid old password" }, { status: 400 });
        }
        body.password = await hashPassword(body.password);
      }
    } else {
      // Admin bypass
      if (body.password) {
        body.password = await hashPassword(body.password);
      }
    }

    const patient = await prisma.user.update({
      where: { id: patientId },
      data: {
        name: body.name,
        email: body.email,
        password: body.password,
      },
    });

    return NextResponse.json(patient, { status: 200 });
  } catch (error) {
    console.error("[PATCH /api/patients/[id]] Error:", error);
    return NextResponse.json({
      error: "Failed to update patient",
    }, { status: 500 });
  }
}

// This function is to delete the patient by ID used by admin÷÷
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patientId = parseInt(id);

    const token = getTokenFromRequest(request);
    if (token) {
      const payload = await verifyToken(token);
      if (!payload || payload.type !== 'access' || payload.userId !== patientId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    await prisma.user.delete({
      where: { id: patientId },
    });
    return NextResponse.json({ message: "Patient deleted" }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/patients/[id]] Error:", error);
    return NextResponse.json({
      error: "Failed to delete patient",
    }, { status: 500 });
  }
}
