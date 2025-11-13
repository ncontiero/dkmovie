import { ncontiero } from "@ncontiero/eslint-config";

export default ncontiero(
  {
    javascript: {
      overrides: {
        "node/no-unsupported-features/node-builtins": [
          "error",
          { allowExperimental: true },
        ],
      },
    },
  },
  {
    files: ["emails/**"],
    rules: {
      "import/no-default-export": "off",
      "tailwindcss/enforce-consistent-line-wrapping": "off",
    },
  },
);
