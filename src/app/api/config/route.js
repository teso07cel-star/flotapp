import { getPrisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

let cachedConfig = null;
let lastFetch = 0;
const CACHE_TTL = 300000; // 5 minutos de blindaje

export async function GET() {
  try {
    const now = Date.now();
    if (cachedConfig && (now - lastFetch < CACHE_TTL)) {
       return NextResponse.json({ success: true, data: cachedConfig });
    }

    const prisma = getPrisma();
    const config = await prisma.configLogistica.findMany();
    
    cachedConfig = config;
    lastFetch = now;
    
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    // Si falla la DB, usar fallbacks tácticos absolutos
    return NextResponse.json({ 
      success: true, 
      data: [
        { key: "PHONE_NORTE", value: "5491180591342" },
        { key: "PHONE_SANTELMO", value: "5491128620002" }
      ] 
    });
  }
}
