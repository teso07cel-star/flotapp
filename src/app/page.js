import { Suspense } from "react";
import { cookies } from "next/headers";
import HomePageClient from "@/components/HomePageClient";

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const success = params.success;

  const cookieStore = await cookies();
  const rawDriverName = cookieStore.get("driver_name")?.value;
  const hasDriver = !!rawDriverName;

  return (
    <Suspense>
      <HomePageClient success={success} hasDriver={hasDriver} />
    </Suspense>
  );
}
