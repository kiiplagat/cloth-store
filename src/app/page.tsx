import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CATEGORIES } from "@/lib/constants";
import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data } = await supabase
    .from("products").select("*").order("created_at", { ascending: false }).limit(8);
  const products = (data as Product[]) ?? [];

  return (
    <div>
      <section className="grid gap-4 sm:grid-cols-3">
        {CATEGORIES.map((c) => (
          <Link key={c.slug} href={`/${c.slug}`}
            className="flex h-40 items-end rounded bg-moss p-5 font-serif text-2xl text-white hover:bg-ink">
            {c.label}
          </Link>
        ))}
      </section>

      <h2 className="mb-4 mt-12 font-serif text-2xl">New in</h2>
      {products.length === 0 ? (
        <p className="text-stone-500">Nothing listed yet. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
