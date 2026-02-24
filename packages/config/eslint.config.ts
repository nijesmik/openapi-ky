import json from "@eslint/json";
import importPlugin from "eslint-plugin-import";
import perfectionist from "eslint-plugin-perfectionist";
import unusedImports from "eslint-plugin-unused-imports";
import { Alphabet } from "eslint-plugin-perfectionist/alphabet";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

const sortOptions = {
  type: "unsorted",
  groups: ["unknown", "method", "callback"],
  customGroups: [
    {
      type: "unsorted",
      groupName: "callback",
      elementNamePattern: "^on[A-Z]",
    },
  ],
} as const;

export default defineConfig([
  {
    ignores: ["**/*.gen.ts"],
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,mts,cts,tsx}"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: process.cwd(),
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { perfectionist, import: importPlugin, "unused-imports": unusedImports },
    rules: {
      "eol-last": ["error", "always"],
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1, maxBOF: 0 }],
      "unused-imports/no-unused-imports": "error",
    },
  },
  {
    files: ["src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    rules: {
      ...perfectionist.configs["recommended-alphabetical"].rules,
      "perfectionist/sort-switch-case": "off",
      "perfectionist/sort-classes": "off",
      "perfectionist/sort-interfaces": ["error", sortOptions],
      "perfectionist/sort-modules": "off",
      "perfectionist/sort-jsx-props": "off",
      "perfectionist/sort-exports": [
        "error",
        {
          partitionByNewLine: true,
          groups: ["unknown", "type-export"],
        },
      ],
      "perfectionist/sort-objects": [
        "error",
        {
          type: "unsorted",
          useConfigurationIf: {
            objectType: "non-destructured",
          },
        },
      ],
      "perfectionist/sort-union-types": [
        "error",
        {
          type: "unsorted",
          groups: ["unknown", "nullish"],
        },
      ],
      "perfectionist/sort-object-types": ["error", sortOptions],
      "perfectionist/sort-intersection-types": [
        "error",
        {
          groups: ["named", "unknown"],
        },
      ],
      "perfectionist/sort-imports": [
        "error",
        {
          type: "alphabetical",
          groups: [
            ["type-import", "type-internal", "type-parent", "type-sibling", "type-index"],
            ["value-builtin", "value-external"],
            "value-internal",
            ["value-parent", "value-sibling", "value-index"],
            "ts-equals-import",
            "unknown",
          ],
        },
      ],
      "import/no-duplicates": ["error", { "prefer-inline": true }],
      curly: ["error", "all"],
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    rules: {
      "perfectionist/sort-named-imports": [
        "error",
        {
          type: "custom",
          alphabet: Alphabet.generateRecommendedAlphabet()
            .sortByLocaleCompare("en-US")
            .placeAllWithCaseBeforeAllWithOtherCase("lowercase")
            .getCharacters(),
          ignoreCase: false,
          groups: ["value-import", { newlinesBetween: 0 }, "type-import"],
        },
      ],
    },
  },
  {
    files: ["**/*.json"],
    ignores: ["**/tsconfig.json", "**/tsconfig.*.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"],
  },
  {
    files: ["**/tsconfig.json", "**/tsconfig.*.json"],
    plugins: { json },
    language: "json/jsonc",
    extends: ["json/recommended"],
  },
]);
