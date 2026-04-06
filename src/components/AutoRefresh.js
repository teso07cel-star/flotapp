"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutoRefresh({ interval = 10000 }) {
  const router = useRouter();

  useEffect(() => {
    const i = setInterval(() => {
      router.refresh();
      console.log("Admin Console: Synced with Tactical Center.");
    }, interval);
    return () => clearInterval(i);
  }, [router, interval]);

  return null;
}
