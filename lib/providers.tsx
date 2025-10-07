"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import type React from "react";
import { useState } from "react";
import superjson from "superjson";
import { api } from "./api";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache i dati per 30 minuti
            staleTime: 1000 * 60 * 30,
            // Mantieni i dati in cache per 1 ora
            gcTime: 1000 * 60 * 60,
            // Riutilizza i dati mentre ricarica in background
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            // Riprova in caso di errore
            retry: 2,
            retryDelay: 1000,
          },
        },
      }),
  );
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
}
