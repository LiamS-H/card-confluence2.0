import { defineConfig } from "vite";

export default defineConfig({
    esbuild: {
        charset: "ascii",
    },
    build: {
        rollupOptions: {
            input: {
                content: "src/content.ts",
                background: "src/background.ts",
            },
            output: {
                entryFileNames: "[name].js",
                chunkFileNames: "[name].js",
                assetFileNames: "[name].[ext]",
            },
        },
        outDir: "dist",
    },
});
