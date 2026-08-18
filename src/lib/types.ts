export type ItemStatus = "Available" | "Reserved" | "Sold";

export type ItemImage = {
  id: string;
  item_id: string;
  storage_path: string | null;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
};

export type Item = {
  id: string;
  title: string;
  slug: string;
  category: string;
  brand: string | null;
  model: string | null;
  description: string | null;
  condition: string | null;
  original_purchase_price: number | null;
  current_retail_price: number | null;
  selling_price: number;
  currency: string;
  retailer_name: string | null;
  reference_url: string | null;
  retail_price_checked_at: string | null;
  status: ItemStatus;
  featured: boolean;
  visible: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  images: ItemImage[];
};

export type AppSettings = {
  hide_sold_homepage: boolean;
};

export type ItemFormValues = Omit<Item, "id" | "created_at" | "updated_at" | "images">;
