import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function getSupabaseHost() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    return null;
  }

  try {
    return new URL(url).hostname;
  } catch {
    return "invalid-url";
  }
}

function getProjectRef(hostname: string | null) {
  if (!hostname || hostname === "invalid-url") {
    return null;
  }

  return hostname.endsWith(".supabase.co") ? hostname.split(".")[0] : null;
}

export function GET() {
  const hostname = getSupabaseHost();

  return NextResponse.json(
    {
      supabase: {
        hostname,
        projectRef: getProjectRef(hostname),
        env: {
          NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
          NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
        }
      },
      route: {
        dynamic,
        revalidate,
        fetchCache
      }
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    }
  );
}
