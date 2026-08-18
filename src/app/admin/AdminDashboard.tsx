"use client";

import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, ImagePlus, LogOut, Plus, Save, Search, Trash2, X } from "lucide-react";
import Image from "next/image";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { AppSettings, Item, ItemFormValues, ItemImage, ItemStatus } from "@/lib/types";
import { calculateDiscountPercent, calculateSavings, formatMoney } from "@/lib/pricing";

type RawItem = Omit<Item, "images"> & {
  item_images?: ItemImage[];
};

const blankItem: ItemFormValues = {
  title: "",
  slug: "",
  category: "Furniture",
  brand: "",
  model: "",
  description: "",
  condition: "",
  original_purchase_price: null,
  current_retail_price: null,
  selling_price: 0,
  currency: "DKK",
  retailer_name: "",
  reference_url: "",
  retail_price_checked_at: null,
  status: "Available",
  featured: false,
  visible: true,
  sort_order: 100
};

const statuses: ItemStatus[] = ["Available", "Reserved", "Sold"];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeItem(item: RawItem): Item {
  return {
    ...item,
    images: [...(item.item_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  };
}

function nullableNumber(value: FormDataEntryValue | null) {
  if (value === null || value === "") return null;
  return Number(value);
}

function nullableString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length ? text : null;
}

async function optimizeImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const maxSide = 1800;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not prepare image canvas");
  }

  context.drawImage(bitmap, 0, 0, width, height);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error("Could not optimize image"));
    }, "image/jpeg", 0.82);
  });

  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg" });
}

export function AdminDashboard() {
  const [supabaseReady, setSupabaseReady] = useState(true);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ hide_sold_homepage: false });
  const [selectedId, setSelectedId] = useState<string | "new">("new");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ItemStatus | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const supabase = useMemo(() => {
    try {
      return createBrowserSupabaseClient();
    } catch {
      setSupabaseReady(false);
      return null;
    }
  }, []);

  const selectedItem = selectedId === "new" ? null : items.find((item) => item.id === selectedId) ?? null;
  const categories = useMemo(() => ["All", ...Array.from(new Set(items.map((item) => item.category))).sort()], [items]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items
      .filter((item) => statusFilter === "All" || item.status === statusFilter)
      .filter((item) => categoryFilter === "All" || item.category === categoryFilter)
      .filter((item) => {
        if (!query) return true;
        return [item.title, item.slug, item.category, item.brand, item.model]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query));
      })
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [categoryFilter, items, search, statusFilter]);

  const loadEverything = useCallback(async () => {
    if (!supabase) return;

    const [{ data: sessionData }, { data: itemRows, error: itemError }, { data: settingsRow }] = await Promise.all([
      supabase.auth.getSession(),
      supabase.from("items").select("*, item_images(*)").order("sort_order", { ascending: true }),
      supabase.from("app_settings").select("hide_sold_homepage").eq("id", 1).maybeSingle()
    ]);

    setSessionEmail(sessionData.session?.user.email ?? null);

    if (itemError) {
      setMessage(itemError.message);
      return;
    }

    setItems(((itemRows ?? []) as RawItem[]).map(normalizeItem));
    if (settingsRow) {
      setSettings(settingsRow);
    }
  }, [supabase]);

  useEffect(() => {
    void loadEverything();
    if (!supabase) return;

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user.email ?? null);
      void loadEverything();
    });

    return () => data.subscription.unsubscribe();
  }, [loadEverything, supabase]);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    setBusy(false);
    setMessage(error ? error.message : "Signed in.");
  }

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);

    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const payload = {
      title,
      slug: String(form.get("slug") || slugify(title)).trim(),
      category: String(form.get("category") ?? "Furniture").trim(),
      brand: nullableString(form.get("brand")),
      model: nullableString(form.get("model")),
      description: nullableString(form.get("description")),
      condition: nullableString(form.get("condition")),
      original_purchase_price: nullableNumber(form.get("original_purchase_price")),
      current_retail_price: nullableNumber(form.get("current_retail_price")),
      selling_price: Number(form.get("selling_price") ?? 0),
      currency: String(form.get("currency") ?? "DKK").trim() || "DKK",
      retailer_name: nullableString(form.get("retailer_name")),
      reference_url: nullableString(form.get("reference_url")),
      retail_price_checked_at: nullableString(form.get("retail_price_checked_at")),
      status: String(form.get("status") ?? "Available") as ItemStatus,
      featured: form.get("featured") === "on",
      visible: form.get("visible") === "on",
      sort_order: Number(form.get("sort_order") ?? 100)
    };

    const response = selectedItem
      ? await supabase.from("items").update(payload).eq("id", selectedItem.id).select("*, item_images(*)").single()
      : await supabase.from("items").insert(payload).select("*, item_images(*)").single();

    setBusy(false);

    if (response.error) {
      setMessage(response.error.message);
      return;
    }

    const saved = normalizeItem(response.data as RawItem);
    setItems((current) => [saved, ...current.filter((item) => item.id !== saved.id)].sort((a, b) => a.sort_order - b.sort_order));
    setSelectedId(saved.id);
    setMessage("Item saved.");
  }

  async function updateItem(id: string, patch: Partial<Item>) {
    if (!supabase) return;
    const { error } = await supabase.from("items").update(patch).eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function deleteItem(id: string) {
    if (!supabase || !window.confirm("Delete this listing and its image rows?")) return;
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setItems((current) => current.filter((item) => item.id !== id));
    setSelectedId("new");
  }

  async function duplicateItem(item: Item) {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("items")
      .insert({
        title: `${item.title} copy`,
        slug: `${item.slug}-copy-${Date.now().toString(36)}`,
        category: item.category,
        brand: item.brand,
        model: item.model,
        description: item.description,
        condition: item.condition,
        original_purchase_price: item.original_purchase_price,
        current_retail_price: item.current_retail_price,
        selling_price: item.selling_price,
        currency: item.currency,
        retailer_name: item.retailer_name,
        reference_url: item.reference_url,
        retail_price_checked_at: item.retail_price_checked_at,
        status: item.status,
        featured: item.featured,
        visible: false,
        sort_order: item.sort_order + 1
      })
      .select("*, item_images(*)")
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    const duplicated = normalizeItem(data as RawItem);
    setItems((current) => [...current, duplicated].sort((a, b) => a.sort_order - b.sort_order));
    setSelectedId(duplicated.id);
    setMessage("Duplicated as a hidden draft.");
  }

  async function moveItem(item: Item, direction: -1 | 1) {
    const index = items.findIndex((entry) => entry.id === item.id);
    const swapWith = items[index + direction];
    if (!swapWith || !supabase) return;

    await Promise.all([
      supabase.from("items").update({ sort_order: swapWith.sort_order }).eq("id", item.id),
      supabase.from("items").update({ sort_order: item.sort_order }).eq("id", swapWith.id)
    ]);

    setItems((current) =>
      current
        .map((entry) => {
          if (entry.id === item.id) return { ...entry, sort_order: swapWith.sort_order };
          if (entry.id === swapWith.id) return { ...entry, sort_order: item.sort_order };
          return entry;
        })
        .sort((a, b) => a.sort_order - b.sort_order)
    );
  }

  async function uploadImages(files: FileList | null) {
    if (!supabase || !selectedItem || !files?.length) return;
    setBusy(true);

    for (const file of Array.from(files)) {
      const optimized = await optimizeImage(file);
      const storagePath = `${selectedItem.id}/${crypto.randomUUID()}.jpg`;
      const upload = await supabase.storage.from("item-images").upload(storagePath, optimized, {
        contentType: "image/jpeg",
        upsert: false
      });

      if (upload.error) {
        setMessage(upload.error.message);
        continue;
      }

      const { data: publicData } = supabase.storage.from("item-images").getPublicUrl(storagePath);
      const { data, error } = await supabase
        .from("item_images")
        .insert({
          item_id: selectedItem.id,
          storage_path: storagePath,
          image_url: publicData.publicUrl,
          alt_text: selectedItem.title,
          sort_order: selectedItem.images.length + 1,
          is_primary: selectedItem.images.length === 0
        })
        .select("*")
        .single();

      if (error) {
        setMessage(error.message);
      } else {
        setItems((current) =>
          current.map((item) =>
            item.id === selectedItem.id ? { ...item, images: [...item.images, data as ItemImage] } : item
          )
        );
      }
    }

    setBusy(false);
    setMessage("Images uploaded.");
  }

  async function deleteImage(image: ItemImage) {
    if (!supabase || !selectedItem) return;
    const { error } = await supabase.from("item_images").delete().eq("id", image.id);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (image.storage_path) {
      await supabase.storage.from("item-images").remove([image.storage_path]);
    }
    setItems((current) =>
      current.map((item) =>
        item.id === selectedItem.id ? { ...item, images: item.images.filter((entry) => entry.id !== image.id) } : item
      )
    );
  }

  async function setPrimaryImage(image: ItemImage) {
    if (!supabase || !selectedItem) return;
    await Promise.all(
      selectedItem.images.map((entry) =>
        supabase.from("item_images").update({ is_primary: entry.id === image.id }).eq("id", entry.id)
      )
    );
    setItems((current) =>
      current.map((item) =>
        item.id === selectedItem.id
          ? { ...item, images: item.images.map((entry) => ({ ...entry, is_primary: entry.id === image.id })) }
          : item
      )
    );
  }

  async function moveImage(image: ItemImage, direction: -1 | 1) {
    if (!supabase || !selectedItem) return;
    const index = selectedItem.images.findIndex((entry) => entry.id === image.id);
    const swapWith = selectedItem.images[index + direction];
    if (!swapWith) return;
    await Promise.all([
      supabase.from("item_images").update({ sort_order: swapWith.sort_order }).eq("id", image.id),
      supabase.from("item_images").update({ sort_order: image.sort_order }).eq("id", swapWith.id)
    ]);
    setItems((current) =>
      current.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              images: item.images
                .map((entry) => {
                  if (entry.id === image.id) return { ...entry, sort_order: swapWith.sort_order };
                  if (entry.id === swapWith.id) return { ...entry, sort_order: image.sort_order };
                  return entry;
                })
                .sort((a, b) => a.sort_order - b.sort_order)
            }
          : item
      )
    );
  }

  async function updateSettings(nextSettings: AppSettings) {
    if (!supabase) return;
    const { error } = await supabase.from("app_settings").upsert({ id: 1, ...nextSettings });
    if (error) {
      setMessage(error.message);
      return;
    }
    setSettings(nextSettings);
  }

  if (!supabaseReady) {
    return (
      <main className="mx-auto grid min-h-screen max-w-xl place-items-center px-4">
        <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
          <h1 className="text-2xl font-bold">Supabase is not configured</h1>
          <p className="mt-3 text-ink/65">Add your Supabase URL and anon key to `.env.local`, then restart the dev server.</p>
        </div>
      </main>
    );
  }

  if (!sessionEmail) {
    return (
      <main className="mx-auto grid min-h-screen max-w-md place-items-center px-4">
        <form onSubmit={signIn} className="grid w-full gap-4 rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-clay">Private dashboard</p>
            <h1 className="mt-2 text-3xl font-black">Admin sign in</h1>
          </div>
          <input
            type="email"
            value={loginEmail}
            onChange={(event) => setLoginEmail(event.target.value)}
            placeholder="Email"
            className="h-11 rounded-md border border-ink/12 px-3 outline-none focus:border-pine"
            required
          />
          <input
            type="password"
            value={loginPassword}
            onChange={(event) => setLoginPassword(event.target.value)}
            placeholder="Password"
            className="h-11 rounded-md border border-ink/12 px-3 outline-none focus:border-pine"
            required
          />
          <button className="h-11 rounded-md bg-pine px-4 font-semibold text-white" disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </button>
          {message && <p className="text-sm text-clay">{message}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-clay">Copenhagen Moving Sale</p>
          <h1 className="text-3xl font-black text-ink">Admin dashboard</h1>
        </div>
        <button
          type="button"
          onClick={() => supabase?.auth.signOut()}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-ink/12 bg-white px-3 text-sm font-semibold"
        >
          <LogOut className="h-4 w-4" />
          {sessionEmail}
        </button>
      </header>

      <section className="grid gap-3 rounded-lg border border-ink/10 bg-white p-4 shadow-soft md:grid-cols-[1fr_auto_auto_auto]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" />
          <span className="sr-only">Search listings</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search listings"
            className="h-10 w-full rounded-md border border-ink/12 pl-10 pr-3 outline-none focus:border-pine"
          />
        </label>
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-10 rounded-md border border-ink/12 px-3">
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ItemStatus | "All")} className="h-10 rounded-md border border-ink/12 px-3">
          <option>All</option>
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <label className="flex h-10 items-center gap-2 rounded-md border border-ink/12 px-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={settings.hide_sold_homepage}
            onChange={(event) => updateSettings({ hide_sold_homepage: event.target.checked })}
          />
          Hide sold on homepage
        </label>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_440px]">
        <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-ink/10 p-3">
            <p className="text-sm font-semibold">{filteredItems.length} listings</p>
            <button
              type="button"
              onClick={() => setSelectedId("new")}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-pine px-3 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Add item
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-linen text-xs uppercase text-ink/55">
                <tr>
                  <th className="px-3 py-3">Item</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">My price</th>
                  <th className="px-3 py-3">Savings</th>
                  <th className="px-3 py-3">Visible</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const savings = calculateSavings(item.current_retail_price, item.selling_price);
                  const discount = calculateDiscountPercent(item.current_retail_price, item.selling_price);
                  return (
                    <tr key={item.id} className="border-t border-ink/8 align-middle">
                      <td className="px-3 py-3">
                        <button type="button" onClick={() => setSelectedId(item.id)} className="text-left font-semibold text-pine hover:text-ink">
                          {item.title}
                        </button>
                        <p className="text-xs text-ink/50">{item.category} / {item.slug}</p>
                      </td>
                      <td className="px-3 py-3">
                        <select value={item.status} onChange={(event) => updateItem(item.id, { status: event.target.value as ItemStatus })} className="h-9 rounded-md border border-ink/12 px-2">
                          {statuses.map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-3 font-bold text-pine">{formatMoney(item.selling_price, item.currency)}</td>
                      <td className="px-3 py-3 text-clay">{formatMoney(savings, item.currency)} {discount !== null && `(${discount}%)`}</td>
                      <td className="px-3 py-3">
                        <button type="button" onClick={() => updateItem(item.id, { visible: !item.visible })} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-ink/12">
                          {item.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1">
                          <button type="button" onClick={() => moveItem(item, -1)} className="grid h-8 w-8 place-items-center rounded-md border border-ink/12"><ArrowUp className="h-4 w-4" /></button>
                          <button type="button" onClick={() => moveItem(item, 1)} className="grid h-8 w-8 place-items-center rounded-md border border-ink/12"><ArrowDown className="h-4 w-4" /></button>
                          <button type="button" onClick={() => duplicateItem(item)} className="grid h-8 w-8 place-items-center rounded-md border border-ink/12"><Copy className="h-4 w-4" /></button>
                          <button type="button" onClick={() => deleteItem(item.id)} className="grid h-8 w-8 place-items-center rounded-md border border-clay/35 text-clay"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="grid gap-4">
          <form key={selectedItem?.id ?? "new"} onSubmit={saveItem} className="grid gap-3 rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold">{selectedItem ? "Edit item" : "Add item"}</h2>
              {selectedItem && (
                <button type="button" onClick={() => setSelectedId("new")} className="grid h-8 w-8 place-items-center rounded-md border border-ink/12">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Field name="title" label="Title" defaultValue={selectedItem?.title ?? blankItem.title} required />
            <Field name="slug" label="Slug" defaultValue={selectedItem?.slug ?? blankItem.slug} placeholder="auto-filled from title if blank" />
            <div className="grid grid-cols-2 gap-3">
              <Field name="category" label="Category" defaultValue={selectedItem?.category ?? blankItem.category} required />
              <Field name="condition" label="Condition" defaultValue={selectedItem?.condition ?? ""} />
              <Field name="brand" label="Brand" defaultValue={selectedItem?.brand ?? ""} />
              <Field name="model" label="Model" defaultValue={selectedItem?.model ?? ""} />
            </div>
            <label className="grid gap-1 text-sm font-semibold">
              Description
              <textarea name="description" defaultValue={selectedItem?.description ?? ""} rows={5} className="rounded-md border border-ink/12 px-3 py-2 font-normal outline-none focus:border-pine" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Field name="selling_price" label="My price" type="number" defaultValue={selectedItem?.selling_price ?? blankItem.selling_price} required />
              <Field name="current_retail_price" label="Current retail price" type="number" defaultValue={selectedItem?.current_retail_price ?? ""} />
              <Field name="original_purchase_price" label="Original purchase price" type="number" defaultValue={selectedItem?.original_purchase_price ?? ""} />
              <Field name="currency" label="Currency" defaultValue={selectedItem?.currency ?? "DKK"} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field name="retailer_name" label="Retailer" defaultValue={selectedItem?.retailer_name ?? ""} />
              <Field name="retail_price_checked_at" label="Price checked" type="date" defaultValue={selectedItem?.retail_price_checked_at ?? ""} />
            </div>
            <Field name="reference_url" label="Reference URL" type="url" defaultValue={selectedItem?.reference_url ?? ""} />
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm font-semibold">
                Status
                <select name="status" defaultValue={selectedItem?.status ?? "Available"} className="h-10 rounded-md border border-ink/12 px-3 font-normal">
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
              <Field name="sort_order" label="Sort order" type="number" defaultValue={selectedItem?.sort_order ?? blankItem.sort_order} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm font-semibold">
              <label className="flex items-center gap-2"><input name="featured" type="checkbox" defaultChecked={selectedItem?.featured ?? false} /> Featured</label>
              <label className="flex items-center gap-2"><input name="visible" type="checkbox" defaultChecked={selectedItem?.visible ?? true} /> Visible</label>
            </div>
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-pine px-4 font-semibold text-white" disabled={busy}>
              <Save className="h-4 w-4" />
              {busy ? "Saving..." : "Save item"}
            </button>
          </form>

          {selectedItem && (
            <div className="grid gap-3 rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
              <h2 className="text-xl font-bold">Photos</h2>
              <label
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  void uploadImages(event.dataTransfer.files);
                }}
                className="grid cursor-pointer place-items-center gap-2 rounded-lg border border-dashed border-pine/35 bg-linen p-6 text-center text-sm font-semibold text-pine"
              >
                <ImagePlus className="h-6 w-6" />
                Drag photos here or choose files
                <input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => uploadImages(event.target.files)} />
              </label>
              <div className="grid gap-2">
                {selectedItem.images.map((image) => (
                  <div key={image.id} className="grid grid-cols-[64px_1fr_auto] items-center gap-3 rounded-md border border-ink/10 p-2">
                    <div className="relative aspect-square overflow-hidden rounded-md bg-oat/35">
                      <Image src={image.image_url} alt={image.alt_text ?? selectedItem.title} fill sizes="64px" className="object-cover" />
                    </div>
                    <button type="button" onClick={() => setPrimaryImage(image)} className="text-left text-sm font-semibold text-pine">
                      {image.is_primary ? "Primary image" : "Make primary"}
                    </button>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => moveImage(image, -1)} className="grid h-8 w-8 place-items-center rounded-md border border-ink/12"><ArrowUp className="h-4 w-4" /></button>
                      <button type="button" onClick={() => moveImage(image, 1)} className="grid h-8 w-8 place-items-center rounded-md border border-ink/12"><ArrowDown className="h-4 w-4" /></button>
                      <button type="button" onClick={() => deleteImage(image)} className="grid h-8 w-8 place-items-center rounded-md border border-clay/35 text-clay"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {message && <p className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white">{message}</p>}
        </aside>
      </section>
    </main>
  );
}

type FieldProps = {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  required?: boolean;
};

function Field({ name, label, type = "text", defaultValue, placeholder, required }: FieldProps) {
  return (
    <label className="grid gap-1 text-sm font-semibold">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
        className="h-10 rounded-md border border-ink/12 px-3 font-normal outline-none focus:border-pine"
      />
    </label>
  );
}
