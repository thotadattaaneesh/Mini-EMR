import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

// This function is to get the prescription by ID used by the admin exclusively
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prescriptionId = parseInt(id);

    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
    });

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    const token = getTokenFromRequest(request);
    if (token) {
      const payload = await verifyToken(token);
      if (payload && payload.type === 'access' && payload.userId !== prescription.userId) {
        return NextResponse.json({ error: "Unauthorized: You can only view your own details" }, { status: 403 });
      }
    }

    return NextResponse.json(prescription, { status: 200 });
  } catch (error) {
    console.error("[GET /api/prescriptions/[id]] Error:", error);
    return NextResponse.json({
      error: "Failed to fetch prescription details",
    }, { status: 500 });
  }
}

// This function is to update the prescription by ID used by the admin exclusively
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prescriptionId = parseInt(id);
    const body = await request.json();

    const existing = await prisma.prescription.findUnique({ where: { id: prescriptionId } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const token = getTokenFromRequest(request);
    if (token) {
      return NextResponse.json({ error: "Forbidden: Patients cannot modify prescriptions" }, { status: 403 });
    }

    const prescription = await prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        medication: body.medication,
        dosage: body.dosage,
        quantity: body.quantity ? parseInt(body.quantity) : undefined,
        refill_on: body.refill_on ? new Date(body.refill_on) : undefined,
        refill_schedule: body.refill_schedule,
        userId: body.userId ? parseInt(body.userId) : undefined,
      },
    });

    return NextResponse.json(prescription, { status: 200 });
  } catch (error) {
    console.error("[PATCH /api/prescriptions/[id]] Error:", error);
    return NextResponse.json({
      error: "Failed to update prescription",
    }, { status: 500 });
  }
}

// This function is to delete the prescription by ID used by the admin exclusively
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prescriptionId = parseInt(id);

    const existing = await prisma.prescription.findUnique({ where: { id: prescriptionId } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const token = getTokenFromRequest(request);
    if (token) {
      return NextResponse.json({ error: "Forbidden: Patients cannot delete prescriptions" }, { status: 403 });
    }

    await prisma.prescription.delete({
      where: { id: prescriptionId },
    });
    return NextResponse.json({ message: "Prescription deleted" }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/prescriptions/[id]] Error:", error);
    return NextResponse.json({
      error: "Failed to delete prescription",
    }, { status: 500 });
  }
}
