import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const counts = await Promise.all([
      prisma.vehiculo.count(),
      prisma.chofer.count(),
      prisma.sucursal.count(),
      prisma.registroDiario.count()
    ]);

    const url = process.env.DATABASE_URL || "MISSING";
    const maskedUrl = url.replace(/:[^:@]+@/, ":****@");

    return NextResponse.json({
      success: true,
      data: {
        vehiculos: counts[0],
        choferes: counts[1],
        sucursales: counts[2],
        registros: counts[3]
      },
      env: {
        databaseUrl: maskedUrl,
        isCloud: url.includes("prisma.io") || url.includes("supabase")
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack?.split("\n").slice(0, 3)
    }, { status: 500 });
  }
}
