import { NextResponse } from 'next/server';
import { getPrisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const prisma = getPrisma();
    
    // Test de conectividad básica
    const startTime = Date.now();
    const [vehiclesCount, driversCount] = await Promise.all([
      prisma.vehiculo.count(),
      prisma.chofer.count()
    ]);
    const duration = Date.now() - startTime;

    // Obtener variables de entorno presentes (sin valores sensibles completos)
    const envStatus = {
      DATABASE_URL: process.env.DATABASE_URL ? "Presente (Enmascarada: " + process.env.DATABASE_URL.substring(0, 15) + "...)" : "AUSENTE",
      POSTGRES_URL: process.env.POSTGRES_URL ? "Presente" : "AUSENTE",
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV || "Local"
    };

    return NextResponse.json({
      status: "ONLINE",
      version: "6.2.1-RESCUE",
      stats: {
        vehicles: vehiclesCount,
        drivers: driversCount,
        responseTimeMs: duration
      },
      environment: envStatus,
      message: "Si ve vehicles > 0, la restauracin ha sido exitosa."
    });
  } catch (error) {
    return NextResponse.json({
      status: "OFFLINE / ERROR",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
