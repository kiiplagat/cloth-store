"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Feedback } from "@/types";

export default function FeedbackSection({ productId }: { productId: string }) {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [website, setWebsite] = useState(""); // honeypot: real people leave this empty
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("feedback").select("*").eq("product_id", productId)
      .order("created_at", { ascending: false });
    setItems((data as Feedback[]) ?? []);
    setLoading(false);
  }, [productId]);

  useEffect(() => { load(); }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (website) return;
    setBusy(true);
    setError("");
    const { error } = await supabase.from("feedback").insert({
      product_id: productId, name: name.trim(), rating, comment: comment.trim(),
    });
    setBusy(false);
    if (error) { setError("Could not send your feedback. Please try again."); return; }
    setName(""); setComment(""); setRating(5);
    load();
  }

  const avg = items.length ? (items.reduce((s, f) => s + f.rating, 0) / items.length).toFixed(1) : null;

  return (
    <section className="mt-12 border-t border-stone-200 pt-8">
      <h2 className="font-serif text-2xl">Feedback{avg && <span className="ml-3 text-base text-stone-500">{avg} / 5 from {items.length}</span>}</h2>

      <form onSubmit={submit} className="mt-4 grid max-w-xl gap-3">
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <input className="input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} />
          <select className="input" value={rating} onChange={(e) => setRating(Number(e.target.value))} aria-label="Rating">
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
          </select>
        </div>
        <textarea className="input" rows={3} placeholder="What do you think of this item?" value={comment}
          onChange={(e) => setComment(e.target.value)} required maxLength={1000} />
        <input className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={(e) => setWebsite(e.target.value)} />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button className="btn w-fit" disabled={busy}>{busy ? "Sending..." : "Post feedback"}</button>
      </form>

      <ul className="mt-8 grid gap-5">
        {loading && <li className="text-sm text-stone-500">Loading feedback...</li>}
        {!loading && items.length === 0 && <li className="text-sm text-stone-500">No feedback yet. Be the first to share.</li>}
        {items.map((f) => (
          <li key={f.id}>
            <p className="text-sm"><span className="font-medium">{f.name}</span>
              <span className="ml-2 text-moss" aria-label={`${f.rating} out of 5`}>{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</span>
              <span className="ml-2 text-xs text-stone-500">{new Date(f.created_at).toLocaleDateString()}</span></p>
            <p className="mt-1 whitespace-pre-line text-sm text-stone-700">{f.comment}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
