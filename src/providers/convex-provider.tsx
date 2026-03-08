"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useEffect, useState } from "react";

/**
 * Hostname → Convex URL mapping:
 *   app.franchiseen.com      → NEXT_PUBLIC_CONVEX_URL_PRODUCTION
 *   game.franchiseen.com     → NEXT_PUBLIC_CONVEX_URL_STAGING
 *   localhost / any other    → NEXT_PUBLIC_CONVEX_URL_STAGING  (safe dev default)
 */
function getConvexUrl(): string {
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const isProduction = hostname === "franchiseen.vercel.app";

  const url = isProduction
    ? process.env.NEXT_PUBLIC_CONVEX_URL_PRODUCTION
    : process.env.NEXT_PUBLIC_CONVEX_URL_STAGING;

  if (!url) {
    console.error(
      `[Convex] Missing env var: ${isProduction ? "NEXT_PUBLIC_CONVEX_URL_PRODUCTION" : "NEXT_PUBLIC_CONVEX_URL_STAGING"}`
    );
  }

  return url || "";
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ConvexReactClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const convexUrl = getConvexUrl();

    if (!convexUrl) {
      console.error("[Convex] No URL configured — check your environment variables.");
      setIsLoading(false);
      return;
    }

    const env = convexUrl.includes("neat-raccoon") ? "STAGING" : "PRODUCTION";
    console.log(`[Convex] Environment: ${env}`);
    console.log(`[Convex] URL: ${convexUrl}`);

    const newClient = new ConvexReactClient(convexUrl);
    setClient(newClient);
    setIsLoading(false);

    return () => {
      newClient.close();
    };
  }, []); // Only run once on mount

  if (isLoading || !client) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50 dark:bg-stone-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Connecting to database...</p>
        </div>
      </div>
    );
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
