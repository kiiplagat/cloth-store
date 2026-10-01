import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/constants";
import type { Product } from "@/types";
import Gallery from "@/components/Gallery";
import OrderButton from "@/components/OrderButton";
import FeedbackSection from "@/components/FeedbackSection";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { data } = await supabase.from("products").select("*").eq("id", params.id).maybeSingle();
  if (!data) notFound();
  const p = data as Product;

  return (
    <div>
      <div className="grid gap-8 md:grid-cols-2">
        <Gallery images={p.images} alt={p.name} />
        <div>
          <p className="text-sm capitalize text-stone-500">{p.category} · {p.type}</p>
          <h1 className="mt-1 font-serif text-3xl">{p.name}</h1>
          <p className="mt-2 text-xl">{formatPrice(p.price)}</p>
          {p.description && <p className="mt-4 max-w-prose whitespace-pre-line text-stone-700">{p.description}</p>}
          <div className="mt-6 grid max-w-xs"><OrderButton product={p} /></div>
        </div>
      </div>
      <FeedbackSection productId={p.id} />
    </div>
  );
}
