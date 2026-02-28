import { getOrCreateGuestIdFromSessionStorage } from './guest'
import { createClient } from './supabase/browser'

const supabase = createClient()

export type Scope = 
  | { kind: "user"; userId: string }
  | { kind: "guest"; guestId: string }

/**
 * Client-side: Get scope from localStorage (user) or memory (guest)
 */
export async function getClientScope(): Promise<Scope> {
  if (typeof window === 'undefined') {
    throw new Error('getClientScope can only be used on client')
  }
  
  // Check if we have a user session using Supabase client
  try {
    const { data, error } = await supabase.auth.getUser()
    if (!error && data.user) {
      return { kind: "user", userId: data.user.id }
    }
  } catch {
    // Failed to get user, fall back to guest
  }
  
  // Guest mode - stable per-tab id from sessionStorage
  return { kind: "guest", guestId: getOrCreateGuestIdFromSessionStorage() }
}

/**
 * Convert scope to WHERE clause and params for SQL queries
 */
export function scopeToWhereClause(scope: Scope): { clause: string; params: any[] } {
  if (scope.kind === "user") {
    return {
      clause: "user_id = ?",
      params: [scope.userId]
    }
  } else {
    return {
      clause: "guest_id = ?",
      params: [scope.guestId]
    }
  }
}

/**
 * Get auth headers based on scope
 */
export function getHeadersForScope(_scope: Scope): HeadersInit {
  const base: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (_scope.kind === "guest" && _scope.guestId) {
    return {
      ...base,
      "x-guest-id": _scope.guestId,
    };
  }

  return base;
}
