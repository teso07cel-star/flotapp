import { NextResponse } from "next/server";
import { autoCloseInternalShifts } from "@/lib/appActions";

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/close-shifts
 * Llamado por Vercel Cron Jobs o un sistema externo para cerrar turnos abiertos del día anterior.
 * Protegido por CRON_SECRET si está definido.
 */
export async function GET(req) {
  if (process.env.CRON_SECRET) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const result = await autoCloseInternalShifts();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error en cron close-shifts:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
