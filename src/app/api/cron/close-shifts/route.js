import { NextResponse } from "next/server";
import { autoCloseInternalShifts } from "@/lib/actions";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Verificación básica de seguridad (opcional, recomendable pasar un token en el header o query)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = await autoCloseInternalShifts();
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
