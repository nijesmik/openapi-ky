import type { Config } from "prettier";

export default {
  arrowParens: "always",
  bracketSameLine: false,
  bracketSpacing: true,
  endOfLine: "lf",
  jsxSingleQuote: false,
  printWidth: 100,
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "all",
  useTabs: false,

  plugins: ["prettier-plugin-tailwindcss"],
  tailwindAttributes: ["className", "classNames"],
  tailwindFunctions: ["cn", "tv"],
} satisfies Config;
