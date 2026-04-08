"use client";
import dynamicImport from "next/dynamic";

const JourneyMap = dynamicImport(() => import("./JourneyMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[450px] w-full bg-slate-900/40 rounded-[2rem] flex items-center justify-center border border-white/5">
       <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  )
});

export default function MapWrapper({ registros }) {
  return <JourneyMap registros={registros} />;
}
