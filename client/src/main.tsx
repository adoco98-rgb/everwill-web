import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import { LanguageProvider } from "./contexts/LanguageContext";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

// 도메인별 자동 리다이렉트 (everwillus.com → /country/us, everwilljp.com → /country/jp)
const DOMAIN_REDIRECT_MAP: Record<string, string> = {
  "everwillus.com": "/country/us",
  "www.everwillus.com": "/country/us",
  "everwillusa.com": "/country/us",
  "www.everwillusa.com": "/country/us",
  "everwilljp.com": "/country/jp",
  "www.everwilljp.com": "/country/jp",
};

// 현재 도메인이 리다이렉트 대상이면 해당 국가 페이지로 이동
// 이미 해당 경로에 있으면 리다이렉트 안 함
if (typeof window !== "undefined") {
  const hostname = window.location.hostname;
  const targetPath = DOMAIN_REDIRECT_MAP[hostname];
  if (targetPath && !window.location.pathname.startsWith(targetPath)) {
    window.location.replace(targetPath);
  }
}

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = "/login";
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </QueryClientProvider>
  </trpc.Provider>
);
