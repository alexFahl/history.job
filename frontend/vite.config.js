import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true, // Force Docker à vérifier les modifications
    },
    host: true, // Nécessaire pour que Docker expose le réseau proprement
    strictPort: true,
    port: 5173,
  },
});
