export const CATEGORIES = [
  { slug: "women", label: "Women" },
  { slug: "men", label: "Men" },
  { slug: "children", label: "Children" },
] as const;

// Edit this list to match what you sell.
export const TYPES = [
  "Shirt", "T-shirt", "Top", "Blouse", "Dress", "Skirt", "Trousers", "Jeans",
  "Shorts", "Jacket", "Sweater", "Suit", "Shoes", "Accessories", "Other",
];

export const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME ?? "My Clothing Store";
export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY ?? "USD";
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export const formatPrice = (n: number) => `${CURRENCY} ${Number(n).toLocaleString()}`;

export const whatsappLink = (text: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
