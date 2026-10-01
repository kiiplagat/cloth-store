import Link from "next/link";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/constants";

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link href={`/product/${p.id}`} className="block">
      <div className="relative aspect-[3/4] overflow-hidden rounded bg-stone-100">
        {p.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-stone-400">No photo</div>
        )}
        {!p.in_stock && (
          <span className="absolute left-2 top-2 rounded bg-ink px-2 py-1 text-xs text-white">Sold out</span>
        )}
      </div>
      <p className="mt-2 text-xs capitalize text-stone-500">{p.category} · {p.type}</p>
      <p className="font-medium">{p.name}</p>
      <p className="text-sm">{formatPrice(p.price)}</p>
    </Link>
  );
}
