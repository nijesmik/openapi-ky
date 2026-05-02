import baseConfig from "@nijesmik/eslint-config";

export default [
  ...baseConfig,
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    rules: {
      "import/no-duplicates": ["error", { "prefer-inline": false }],
      "perfectionist/sort-intersection-types": [
        "error",
        {
          type: "unsorted",
          groups: ["named", "unknown"],
        },
      ],
    },
  },
];
