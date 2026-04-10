import DailyReportClient from "@/components/DailyReportClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DailyReport({ searchParams }) {
  const params = await searchParams;
  const initialDate = params.date || new Date().toISOString().split('T')[0];

  return <DailyReportClient initialDate={initialDate} />;
}
