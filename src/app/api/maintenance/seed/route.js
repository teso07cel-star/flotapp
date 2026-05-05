import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const prismaModule = await import('@/lib/prisma');
    const prisma = prismaModule.getPrisma ? prismaModule.getPrisma() : prismaModule.default;
    
    if (!prisma || !prisma.chofer) {
      return NextResponse.json({ success: false, error: 'STILL FAILING. Keys: ' + Object.keys(prisma).join(',') });
    }

    const defaultDrivers = [
      "Brian Lopez", "Christian González", "David f", "Diego r", "Esteban diaz", "GONZALO", 
      "Gali Nelson", "Gally Nelson", "Gerardo v", "Iván Santillán", "Jonathan v", 
      "Juan Cruz Hidalgo", "Lucio Bello", "MARIANO", "Matías Chaile", "Miguel c", 
      "Tomas C", "Tomás Casco", "Vega Jorge Daniel", "VideoTest"
    ];
    let driversLoaded = 0;
    for (const name of defaultDrivers) {
      const existing = await prisma.chofer.findFirst({ where: { nombre: name } });
      if (!existing) await prisma.chofer.create({ data: { nombre: name } });
      driversLoaded++;
    }

    return NextResponse.json({ success: true, message: "¡TODO SOLUCIONADO!", driversLoaded });
  } catch (error) { return NextResponse.json({ success: false, error: error.message }); }
}
