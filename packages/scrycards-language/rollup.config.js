import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import { lezer } from "@lezer/generator/rollup";

export default {
    input: "src/index.ts",
    external: (id) => id != "tslib" && !/^(\.?\/|\w:)/.test(id),
    output: [
        // { file: "dist/index.cjs", format: "cjs" },
        // { dir: "./dist", format: "es" },
        { file: "dist/index.js", format: "es" },
    ],
    plugins: [lezer(), typescript()],
};
