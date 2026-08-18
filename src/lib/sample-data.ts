import type { AppSettings, Item } from "./types";

const now = new Date().toISOString();

export const sampleItems: Item[] = [
  {
    id: "sample-1",
    title: "HAY About A Chair",
    slug: "hay-about-a-chair",
    category: "Furniture",
    brand: "HAY",
    model: "AAC 22",
    description: "Comfortable dining chair in good condition, bought in Copenhagen and cared for in a smoke-free home.",
    condition: "Good, light everyday wear",
    original_purchase_price: 2400,
    current_retail_price: 2299,
    selling_price: 950,
    currency: "DKK",
    retailer_name: "HAY",
    reference_url: "https://www.hay.com/",
    retail_price_checked_at: "2026-08-01",
    status: "Available",
    featured: true,
    visible: true,
    sort_order: 1,
    created_at: now,
    updated_at: now,
    images: [
      {
        id: "sample-img-1",
        item_id: "sample-1",
        storage_path: null,
        image_url: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=80",
        alt_text: "Wooden chair in a bright apartment",
        sort_order: 1,
        is_primary: true,
        created_at: now
      }
    ]
  },
  {
    id: "sample-2",
    title: "Muuto Around Coffee Table",
    slug: "muuto-around-coffee-table",
    category: "Furniture",
    brand: "Muuto",
    model: "Around small",
    description: "Small coffee table with a soft Scandinavian profile. Easy pickup near central Copenhagen.",
    condition: "Very good",
    original_purchase_price: 3200,
    current_retail_price: 2995,
    selling_price: 1400,
    currency: "DKK",
    retailer_name: "Illums Bolighus",
    reference_url: "https://www.illumsbolighus.com/",
    retail_price_checked_at: "2026-08-05",
    status: "Reserved",
    featured: false,
    visible: true,
    sort_order: 2,
    created_at: now,
    updated_at: now,
    images: [
      {
        id: "sample-img-2",
        item_id: "sample-2",
        storage_path: null,
        image_url: "https://images.unsplash.com/photo-1532372320978-9d4d615e4a11?auto=format&fit=crop&w=1200&q=80",
        alt_text: "Round coffee table in a minimal living room",
        sort_order: 1,
        is_primary: true,
        created_at: now
      }
    ]
  }
];

export const sampleSettings: AppSettings = {
  hide_sold_homepage: false
};
