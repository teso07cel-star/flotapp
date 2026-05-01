"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutoRefresh({ interval = 30000 }) {
  const router = useRouter();

  useEffect(() => {
    const i = setInterval(() => {
      router.refresh();
    }, interval);
    return () => clearInterval(i);
  }, [router, interval]);

  return null;
}
