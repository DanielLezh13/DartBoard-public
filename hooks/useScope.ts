"use client";

import { getClientScope, type Scope } from "@/lib/scope-client";
import { getOrCreateGuestIdFromSessionStorage } from "@/lib/guest";
import { setLastUserId, clearLastUserId } from "@/lib/railCache";
import { devLog } from "@/lib/devLog";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/browser";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

const supabase = createClient();

function logScopeSet(scope: Scope, reason: string) {
  const id = scope.kind === "user" ? scope.userId : scope.guestId;
  devLog("[SCOPE] set kind=" + scope.kind + " id=" + id + " reason=" + reason);
}

function sameScope(a: Scope | null, b: Scope): boolean {
  if (!a) return false;
  if (a.kind !== b.kind) return false;
  if (a.kind === "user" && b.kind === "user") return a.userId === b.userId;
  if (a.kind === "guest" && b.kind === "guest") return a.guestId === b.guestId;
  return false;
}

export function useScope() {
  const [scope, setScope] = useState<Scope | null>(null);
  const [loading, setLoading] = useState(true);
  const scopeRef = useRef<Scope | null>(null);

  useEffect(() => {
    const setScopeIfChanged = (next: Scope, reason: string) => {
      if (sameScope(scopeRef.current, next)) return;
      scopeRef.current = next;
      setScope(next);
      logScopeSet(next, reason);
    };

    // Initial scope
    const loadScope = async () => {
      try {
        const initialScope = await getClientScope();
        setScopeIfChanged(initialScope, "init");
        if (initialScope.kind === "user") setLastUserId(initialScope.userId);
      } catch {
        const fallback = { kind: "guest" as const, guestId: getOrCreateGuestIdFromSessionStorage() };
        setScopeIfChanged(fallback, "init");
      } finally {
        setLoading(false);
      }
    };

    loadScope();

    // Cross-tab storage sync
    const handleStorageChange = (event: StorageEvent) => {
      // Only auth-related localStorage keys should affect scope.
      if (event.storageArea !== localStorage) return;
      if (event.key && !/^sb-|supabase/i.test(event.key)) return;

      getClientScope().then((s) => {
        setScopeIfChanged(s, "storage");
      }).catch(() => {
        const fallback = { kind: "guest" as const, guestId: getOrCreateGuestIdFromSessionStorage() };
        setScopeIfChanged(fallback, "storage");
      });
    };

    // Auth: set scope from event/session immediately; do not use getClientScope() after sign-out (stale user)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (event === "SIGNED_OUT" || session == null) {
        clearLastUserId();
        const guestScope = { kind: "guest" as const, guestId: getOrCreateGuestIdFromSessionStorage() };
        setScopeIfChanged(guestScope, event ?? "auth_event");
        return;
      }
      if (event === "SIGNED_IN" && session?.user) {
        const userScope = { kind: "user" as const, userId: session.user.id };
        setLastUserId(session.user.id);
        setScopeIfChanged(userScope, event);
        return;
      }
      // INITIAL_SESSION, TOKEN_REFRESHED, etc.: derive from session
      if (session?.user) {
        const userScope = { kind: "user" as const, userId: session.user.id };
        setLastUserId(session.user.id);
        setScopeIfChanged(userScope, event ?? "auth_event");
      } else {
        const guestScope = { kind: "guest" as const, guestId: getOrCreateGuestIdFromSessionStorage() };
        setScopeIfChanged(guestScope, event ?? "auth_event");
      }
    });

    window.addEventListener('storage', handleStorageChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { scope, loading };
}
