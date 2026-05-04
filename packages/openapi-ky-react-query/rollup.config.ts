import { fileURLToPath } from "node:url";

import alias from "@rollup/plugin-alias";
import nodeResolve from "@rollup/plugin-node-resolve";
import { defineConfig } from "rollup";
import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";

const src = fileURLToPath(new URL("src", import.meta.url));
const openapiKyInternal = fileURLToPath(new URL("../openapi-ky/src/internal.ts", import.meta.url));
const aliases = alias({
  entries: [
    { find: "@openapi-ky/internal", replacement: openapiKyInternal },
    { find: /^@\/(.*)$/, replacement: `${src}/$1` },
  ],
});
const resolve = nodeResolve({ extensions: [".ts", ".js"] });

const external = [/^@nijesmik\/openapi-ky$/, /^@tanstack\/react-query/];

export default defineConfig([
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "esm",
      sourcemap: true,
    },
    external,
    plugins: [aliases, resolve, esbuild({ target: "es2020" })],
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.d.ts",
      format: "esm",
    },
    external,
    plugins: [aliases, resolve, dts({ respectExternal: true })],
  },
]);
