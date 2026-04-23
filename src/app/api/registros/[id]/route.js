import { NextResponse } from 'next/server';
import { getPrisma } from "@/lib/prisma";
import { purify } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const rid = parseInt(id);

    if (isNaN(rid)) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    }

    const registro = await getPrisma().registroDiario.findUnique({
      where: { id: rid },
      include: {
        vehiculo: true,
        sucursales: true
      }
    });

    if (!registro) {
      return NextResponse.json({ success: false, error: "Registro no encontrado" }, { status: 404 });
    }

    return NextResponse.json(purify({ success: true, data: registro }));
  } catch (error) {
    console.error("❌ ERROR GET REGISTRO:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
