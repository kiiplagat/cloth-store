"use client";
import { useEffect, useState } from "react";
import type { Product } from "@/types";
import { formatPrice, whatsappLink } from "@/lib/constants";

export default function OrderButton({ product }: { product: Product }) {
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(window.location.href), []);

  if (!product.in_stock) {
    return <p className="rounded border border-stone-300 px-4 py-3 text-sm text-stone-600">This item is sold out.</p>;
  }
  const msg = `Hi, I'd like to order: ${product.name} (${product.category}, ${product.type}) - ${formatPrice(product.price)}\n${url}`;
  return (
    <a href={whatsappLink(msg)} target="_blank" rel="noopener noreferrer" className="btn text-center">
      Order on WhatsApp
    </a>
  );
}
