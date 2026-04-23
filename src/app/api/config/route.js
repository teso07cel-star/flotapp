import { getPrisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const prisma = getPrisma();
    const config = await prisma.configLogistica.findMany();
    // Devolver como array para compatibilidad con el reducer del frontend
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    return NextResponse.json({ 
      success: true, 
      data: [
        { key: "PHONE_NORTE", value: "5491180591342" },
        { key: "PHONE_SANTELMO", value: "5491128620002" }
      ] 
    });
  }
}
