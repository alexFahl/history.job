import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.jsx";

/**
 * QueryClient configuration
 * staleTime: 60s — data fetched within the last minute won't trigger a refetch (stay in cache)
 * retry: 1       — on failure, TanStack Query retries once before showing an error
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* QueryClientProvider: makes the query client available to all components */}
    <QueryClientProvider client={queryClient}>
      {/* BrowserRouter: enables client-side routing via React Router */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
