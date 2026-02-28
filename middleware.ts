import { createServerClient } from "@supabase/ssr";
import { NextResponse, NextRequest } from "next/server";
import {
  createGuestId,
  GUEST_COOKIE_NAME,
} from "@/lib/guest-cookie";

type RateLimitRule = {
  path: string;
  limit: number;
  windowMs: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_RULES: RateLimitRule[] = [
  { path: "/api/chat", limit: 20, windowMs: 10 * 60 * 1000 },
  { path: "/api/archive/search", limit: 40, windowMs: 60 * 1000 },
  { path: "/api/upload/image", limit: 10, windowMs: 10 * 60 * 1000 },
  { path: "/api/title", limit: 20, windowMs: 10 * 60 * 1000 },
  { path: "/api/archive/import", limit: 5, windowMs: 10 * 60 * 1000 },
  { path: "/api/guest/wipe", limit: 5, windowMs: 10 * 60 * 1000 },
  { path: "/api/sessions/touch", limit: 30, windowMs: 60 * 1000 },
];

const GLOBAL_API_RATE_LIMIT = { limit: 120, windowMs: 60 * 1000 };

const globalRateLimitStore = globalThis as typeof globalThis & {
  __dbRateLimitBuckets?: Map<string, RateLimitBucket>;
};

const rateLimitBuckets =
  globalRateLimitStore.__dbRateLimitBuckets ??
  (globalRateLimitStore.__dbRateLimitBuckets = new Map<string, RateLimitBucket>());

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

function resolveRateLimitRule(pathname: string): RateLimitRule | null {
  for (const rule of RATE_LIMIT_RULES) {
    if (pathname === rule.path || pathname.startsWith(`${rule.path}/`)) {
      return rule;
    }
  }
  return null;
}

function enforceRateLimit(rule: RateLimitRule, ip: string): number | null {
  const now = Date.now();
  const key = `${rule.path}:${ip}`;
  const existing = rateLimitBuckets.get(key);

  if (!existing || now >= existing.resetAt) {
    rateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + rule.windowMs,
    });
  } else {
    if (existing.count >= rule.limit) {
      return Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    }
    existing.count += 1;
    rateLimitBuckets.set(key, existing);
  }

  // Opportunistic cleanup so the in-memory map doesn't grow forever.
  if (rateLimitBuckets.size > 5000) {
    for (const [bucketKey, bucket] of rateLimitBuckets.entries()) {
      if (bucket.resetAt <= now) {
        rateLimitBuckets.delete(bucketKey);
      }
    }
  }

  return null;
}

function normalizeClientGuestId(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Legacy/sessionStorage guest ids look like: guest-<timestamp>-<random>
  // Keep this strict enough to reject garbage while allowing older values.
  if (!/^guest-[a-z0-9-]{8,128}$/i.test(trimmed)) return null;
  return trimmed;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);

  const clientGuestId = normalizeClientGuestId(request.headers.get("x-guest-id"));
  const guestIdForRequest = clientGuestId ?? createGuestId();

  // Trusted, server-controlled guest identity for this request.
  requestHeaders.set("x-db-guest-id", guestIdForRequest);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getSession();

  // Remove legacy guest cookie so guest identity is tab-scoped again (sessionStorage header).
  if (request.cookies.has(GUEST_COOKIE_NAME)) {
    response.cookies.set({
      name: GUEST_COOKIE_NAME,
      value: "",
      maxAge: 0,
      path: "/",
    });
  }

  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(request);

    // Per-route limit (specific endpoints)
    const rule = resolveRateLimitRule(pathname);
    if (rule) {
      const retryAfterSec = enforceRateLimit(rule, ip);
      if (retryAfterSec !== null) {
        return new NextResponse(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": String(retryAfterSec),
            },
          }
        );
      }
    }

    // Global per-IP limit across all API routes (120 req/min)
    const globalRetry = enforceRateLimit(
      { path: "/api/*", limit: GLOBAL_API_RATE_LIMIT.limit, windowMs: GLOBAL_API_RATE_LIMIT.windowMs },
      ip
    );
    if (globalRetry !== null) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please slow down." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(globalRetry),
          },
        }
      );
    }
  }

  // No auth redirect logic needed - just refresh cookies
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
