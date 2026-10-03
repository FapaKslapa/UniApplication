"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { domMax, LazyMotion, MotionConfig } from "framer-motion";
import { type ReactNode, useEffect, useState } from "react";
import superjson from "superjson";
import { api } from "./api";
import { authClient } from "./auth-client";
import { useAppStore } from "./store";

export function TRPCProvider({ children }: { children: ReactNode }) {
  const setIsAdmin = useAppStore((state) => state.setIsAdmin);

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      setIsAdmin(!!data?.user);
    });
  }, [setIsAdmin]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 30,
            gcTime: 1000 * 60 * 60,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
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
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <api.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </api.Provider>
      </MotionConfig>
    </LazyMotion>
  );
}
