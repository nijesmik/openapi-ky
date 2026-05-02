import baseConfig from "@nijesmik/eslint-config";
import type { Linter } from "eslint";

const config: Linter.Config[] = [
  ...baseConfig,
  {
    rules: {
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

export default config;
