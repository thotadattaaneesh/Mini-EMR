import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

// Get all the appointments for a user used by admin
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointmentId = parseInt(id);

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const token = getTokenFromRequest(request);
    if (token) {
      const payload = await verifyToken(token);
      if (payload && payload.type === 'access' && payload.userId !== appointment.userId) {
        return NextResponse.json({ error: "Unauthorized: You can only view your own details" }, { status: 403 });
      }
    }

    return NextResponse.json(appointment, { status: 200 });
  } catch (error) {
    console.error("[GET /api/appointments/[id]] Error:", error);
    return NextResponse.json({
      error: "Failed to fetch appointment details",
    }, { status: 500 });
  }
}

// edit the appointment used by admin ( admin will only be able to edit ) 
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointmentId = parseInt(id);
    const body = await request.json();

    const existing = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const token = getTokenFromRequest(request);
    if (token) {
      return NextResponse.json({ error: "Forbidden: Patients cannot modify appointments" }, { status: 403 });
    }

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        provider: body.provider,
        datetime: body.datetime ? new Date(body.datetime) : undefined,
        repeat: body.repeat,
        userId: body.userId ? parseInt(body.userId) : undefined,
      },
    });

    return NextResponse.json(appointment, { status: 200 });
  } catch (error) {
    console.error("[PATCH /api/appointments/[id]] Error:", error);
    return NextResponse.json({
      error: "Failed to update appointment",
    }, { status: 500 });
  }
}

// Delete the appointment used by admin 
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointmentId = parseInt(id);

    const existing = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const token = getTokenFromRequest(request);
    if (token) {
      return NextResponse.json({ error: "Forbidden: Patients cannot delete appointments" }, { status: 403 });
    }

    await prisma.appointment.delete({
      where: { id: appointmentId },
    });
    return NextResponse.json({ message: "Appointment deleted" }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/appointments/[id]] Error:", error);
    return NextResponse.json({
      error: "Failed to delete appointment",
    }, { status: 500 });
  }
}
