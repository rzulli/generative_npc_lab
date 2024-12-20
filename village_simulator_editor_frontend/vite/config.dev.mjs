import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath, URL } from "url";

// https://vitejs.dev/config/
export default defineConfig({
    base: "./",
    plugins: [react()],
    server: {
        port: 8080,
    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("../src", import.meta.url)),
            "@/hooks": fileURLToPath(new URL("../src/hooks", import.meta.url)),
        },
    },
});

