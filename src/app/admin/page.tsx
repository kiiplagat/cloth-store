"use client";
import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { CATEGORIES, TYPES, formatPrice } from "@/lib/constants";
import type { Product } from "@/types";

const MAX_MB = 5;
const BUCKET_MARKER = "/storage/v1/object/public/products/";

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // upload form
  const [formKey, setFormKey] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0].slug);
  const [type, setType] = useState(TYPES[0]);
  const [inStock, setInStock] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const [products, setProducts] = useState<Product[]>([]);

  const loadProducts = useCallback(async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts((data as Product[]) ?? []);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(false); return; }
    supabase.from("admins").select("user_id").eq("user_id", session.user.id).maybeSingle()
      .then(({ data }) => { setIsAdmin(!!data); if (data) loadProducts(); });
  }, [session, loadProducts]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError("Wrong email or password.");
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (files.length === 0) { setMsg("Add at least one photo."); return; }
    if (files.some((f) => f.size > MAX_MB * 1024 * 1024)) { setMsg(`Each photo must be under ${MAX_MB} MB.`); return; }
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${category}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("products")
          .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
        if (error) throw error;
        urls.push(supabase.storage.from("products").getPublicUrl(path).data.publicUrl);
      }
      const { error } = await supabase.from("products").insert({
        name: name.trim(), description: description.trim() || null, price: Number(price),
        category, type, images: urls, in_stock: inStock,
      });
      if (error) throw error;
      setName(""); setDescription(""); setPrice(""); setFiles([]); setInStock(true);
      setFormKey((k) => k + 1);
      setMsg("Item published.");
      loadProducts();
    } catch (err) {
      setMsg("Upload failed: " + (err instanceof Error ? err.message : "unknown error"));
    } finally {
      setBusy(false);
    }
  }

  async function toggleStock(p: Product) {
    await supabase.from("products").update({ in_stock: !p.in_stock }).eq("id", p.id);
    loadProducts();
  }

  async function remove(p: Product) {
    if (!confirm(`Delete "${p.name}"? This also deletes its feedback.`)) return;
    const paths = p.images.map((u) => u.split(BUCKET_MARKER)[1]).filter(Boolean);
    if (paths.length) await supabase.storage.from("products").remove(paths);
    await supabase.from("products").delete().eq("id", p.id);
    loadProducts();
  }

  if (!ready) return <p>Loading...</p>;

  if (!session) {
    return (
      <form onSubmit={login} className="mx-auto grid max-w-sm gap-3">
        <h1 className="font-serif text-2xl">Admin sign in</h1>
        <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {authError && <p className="text-sm text-red-700">{authError}</p>}
        <button className="btn">Sign in</button>
      </form>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-sm">
        <p>This account is not an admin.</p>
        <button className="btn mt-3" onClick={() => supabase.auth.signOut()}>Sign out</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Admin</h1>
        <button className="text-sm underline" onClick={() => supabase.auth.signOut()}>Sign out</button>
      </div>

      <form key={formKey} onSubmit={addProduct} className="mt-6 grid max-w-xl gap-3">
        <h2 className="font-serif text-xl">Add an item</h2>
        <input className="input" placeholder="Item name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
        <textarea className="input" rows={3} placeholder="Description (size, material, colour)" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input className="input" type="number" min="0" step="0.01" placeholder={`Price (${formatPrice(0).split(" ")[0]})`} value={price} onChange={(e) => setPrice(e.target.value)} required />
        <div className="grid grid-cols-2 gap-3">
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
            {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
          </select>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)} aria-label="Type of clothing">
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <input className="text-sm" type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} /> In stock
        </label>
        {msg && <p className="text-sm">{msg}</p>}
        <button className="btn w-fit" disabled={busy}>{busy ? "Publishing..." : "Publish item"}</button>
      </form>

      <h2 className="mt-12 font-serif text-xl">Listed items ({products.length})</h2>
      <ul className="mt-4 divide-y divide-stone-200">
        {products.map((p) => (
          <li key={p.id} className="flex items-center gap-4 py-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {p.images[0] && <img src={p.images[0]} alt="" className="h-16 w-12 rounded object-cover" />}
            <div className="flex-1 text-sm">
              <p className="font-medium">{p.name}</p>
              <p className="capitalize text-stone-500">{p.category} · {p.type} · {formatPrice(p.price)}</p>
            </div>
            <button className="text-sm underline" onClick={() => toggleStock(p)}>{p.in_stock ? "Mark sold out" : "Mark in stock"}</button>
            <button className="text-sm text-red-700 underline" onClick={() => remove(p)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
