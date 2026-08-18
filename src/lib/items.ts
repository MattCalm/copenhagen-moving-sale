import { createPublicSupabaseClient } from "./supabase";
import type { AppSettings, Item, ItemImage } from "./types";

type RawItem = Omit<Item, "images"> & {
  item_images?: ItemImage[];
};

function normalizeItem(item: RawItem): Item {
  return {
    ...item,
    images: [...(item.item_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  };
}

export async function getItems(includeHidden = false): Promise<Item[]> {
  const supabase = createPublicSupabaseClient();

  if (!supabase) {
    console.warn("Supabase is not configured; public item data is unavailable.");
    return [];
  }

  let query = supabase
    .from("items")
    .select("*, item_images(*)")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (!includeHidden) {
    query = query.eq("visible", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return [];
  }

  return (data as RawItem[]).map(normalizeItem);
}

export async function getItemBySlug(slug: string): Promise<Item | null> {
  const supabase = createPublicSupabaseClient();

  if (!supabase) {
    console.warn("Supabase is not configured; public item data is unavailable.");
    return null;
  }

  const { data, error } = await supabase
    .from("items")
    .select("*, item_images(*)")
    .eq("slug", slug)
    .eq("visible", true)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data ? normalizeItem(data as RawItem) : null;
}

export async function getAppSettings(): Promise<AppSettings> {
  const supabase = createPublicSupabaseClient();
  const defaultSettings: AppSettings = {
    hide_sold_homepage: false
  };

  if (!supabase) {
    console.warn("Supabase is not configured; public app settings are unavailable.");
    return defaultSettings;
  }

  const { data, error } = await supabase
    .from("app_settings")
    .select("hide_sold_homepage")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    return defaultSettings;
  }

  return data;
}
