import baseConfig from "@nijesmik/eslint-config";

export default [
  ...baseConfig,
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },
];
