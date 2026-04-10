import { NextResponse } from 'next/server';
import { getDailyReport } from '@/lib/actions';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date');
  
  if (!dateStr) return NextResponse.json({ success: false, error: 'Fecha requerida' }, { status: 400 });
  
  const res = await getDailyReport(dateStr);
  return NextResponse.json(res);
}
