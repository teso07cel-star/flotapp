import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';
export async function GET() {
    try {
        const activeDrivers = ['VideoTest', 'MIGUEL CEJAS', 'LUIS']; // Fallback drivers
        for (const driver of activeDrivers) {
            try {
                await prisma.registroDiario.create({
                    data: {
                        nombreConductor: driver,
                        kmActual: 0,
                        novedades: 'CIERRE AUTOMATIZADO 20:00HS'
                    }
                });
            } catch (e) { console.error('Error driver:', driver, e.message); }
        }
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
