import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CATEGORIES } from "@/lib/constants";
import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params, searchParams,
}: {
  params: { category: string };
  searchParams: { type?: string };
}) {
  const cat = CATEGORIES.find((c) => c.slug === params.category);
  if (!cat) notFound();

  const { data } = await supabase
    .from("products").select("*").eq("category", cat.slug).order("created_at", { ascending: false });
  const all = (data as Product[]) ?? [];
  const types = Array.from(new Set(all.map((p) => p.type))).sort();
  const active = searchParams.type;
  const products = active ? all.filter((p) => p.type === active) : all;

  const chip = (on: boolean) =>
    `rounded-full border px-3 py-1 text-sm ${on ? "border-moss bg-moss text-white" : "border-stone-300 hover:border-moss"}`;

  return (
    <div>
      <h1 className="font-serif text-3xl">{cat.label}</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/${cat.slug}`} className={chip(!active)}>All</Link>
        {types.map((t) => (
          <Link key={t} href={`/${cat.slug}?type=${encodeURIComponent(t)}`} className={chip(active === t)}>{t}</Link>
        ))}
      </div>
      {products.length === 0 ? (
        <p className="mt-8 text-stone-500">No items here yet.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
