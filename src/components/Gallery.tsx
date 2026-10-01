"use client";
import { useState } from "react";

export default function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  if (images.length === 0) {
    return <div className="flex aspect-[3/4] items-center justify-center rounded bg-stone-100 text-stone-400">No photo</div>;
  }
  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[i]} alt={alt} className="aspect-[3/4] w-full rounded bg-stone-100 object-cover" />
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((src, idx) => (
            <button key={src} onClick={() => setI(idx)} aria-label={`Show photo ${idx + 1}`}
              className={`h-20 w-16 shrink-0 overflow-hidden rounded border-2 ${idx === i ? "border-moss" : "border-transparent"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
