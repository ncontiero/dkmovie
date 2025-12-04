import { ncontiero } from "@ncontiero/eslint-config";

export default ncontiero(
  {
    ignores: ["dkmovie/templates/emails/**", "**/routeTree.gen.ts"],
    javascript: {
      overrides: {
        "node/no-unsupported-features/node-builtins": [
          "error",
          { allowExperimental: true },
        ],
      },
    },
    html: {
      overrides: {
        "html/require-title": "off",
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
  {
    files: ["dkmovie/src/layouts/**"],
    rules: {
      "import/no-default-export": "off",
    },
  },
);
