import { defineConfig } from "vite";

export default defineConfig({
    esbuild: {
        charset: "ascii",
    },
    build: {
        emptyOutDir: true,
        outDir: "dist",
        rollupOptions: {
            input: "src/background.ts",
            output: {
                format: "es",
                entryFileNames: "background.js",
                inlineDynamicImports: true,
            },
        },
    },
});
