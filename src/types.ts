export type Category = "women" | "men" | "children";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: Category;
  type: string;
  images: string[];
  in_stock: boolean;
  created_at: string;
}

export interface Feedback {
  id: string;
  product_id: string;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
}
