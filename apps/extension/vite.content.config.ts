import { defineConfig } from "vite";

export default defineConfig({
    esbuild: {
        charset: "ascii",
    },
    build: {
        emptyOutDir: false,
        outDir: "dist",
        rollupOptions: {
            input: "src/content.ts",
            output: {
                format: "iife",
                entryFileNames: "content.js",
                inlineDynamicImports: true,
            },
        },
    },
});
