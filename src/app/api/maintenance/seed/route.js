import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const prismaModule = await import('@/lib/prisma');
    const prisma = prismaModule.getPrisma ? prismaModule.getPrisma() : prismaModule.default;
    
    if (!prisma) {
      return NextResponse.json({ success: false, error: 'Prisma es null o undefined' });
    }

    const keys = Object.keys(prisma).filter(k => !k.startsWith('_'));
    
    return NextResponse.json({ 
      success: false, 
      error: 'DIAGNOSTIC MODE',
      prismaKeys: keys,
      hasChofer: !!prisma.chofer,
      hasAutorizacion: !!prisma.autorizacion
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
