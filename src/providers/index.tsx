"use client";

import { QueryProvider } from "./query-provider";
import { SupabaseProvider } from "./supabase-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <QueryProvider>{children}</QueryProvider>
    </SupabaseProvider>
  );
}
