import path from "node:path";
import { defineConfig } from "@rspack/cli";
import { type SwcLoaderOptions, rspack } from "@rspack/core";
import { tanstackRouter } from "@tanstack/router-plugin/rspack";
import BundleTracker from "webpack-bundle-tracker";

// Target browsers, see: https://github.com/browserslist/browserslist
const BROWSER_TARGETS = [
  "chrome >= 87",
  "edge >= 88",
  "firefox >= 78",
  "safari >= 14",
];

const BASE_PATH = path.join(import.meta.dirname, "../");
const PROJECT_PATH = path.join(BASE_PATH, "dkmovie");
const SRC_PATH = path.join(PROJECT_PATH, "src");

const isDev = process.env.NODE_ENV === "development";

export const commonConfig = defineConfig({
  target: "web",
  context: BASE_PATH,
  entry: path.resolve(PROJECT_PATH, "src/index.tsx"),
  output: {
    path: path.resolve(PROJECT_PATH, "static/bundles/"),
    publicPath: "/static/bundles/",
    assetModuleFilename: "assets/[name][ext]",
    clean: true,
  },
  plugins: [
    new BundleTracker({
      path: path.resolve(BASE_PATH),
      filename: "webpack-stats.json",
    }),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: path.resolve(SRC_PATH, "routes"),
      generatedRouteTree: path.resolve(SRC_PATH, "routeTree.gen.ts"),
      quoteStyle: "double",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "builtin:swc-loader",
            options: {
              jsc: {
                parser: { syntax: "typescript", tsx: true },
                transform: {
                  react: {
                    runtime: "automatic",
                    development: isDev,
                    refresh: isDev,
                  },
                },
              },
              env: { targets: BROWSER_TARGETS },
            } satisfies SwcLoaderOptions,
          },
        ],
        type: "javascript/auto",
      },
      {
        test: /\.css$/,
        type: "css",
        use: ["postcss-loader"],
      },
      {
        test: /\.svg$/,
        type: "asset/resource",
      },
    ],
  },
  optimization: {
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin(),
      new rspack.LightningCssMinimizerRspackPlugin({
        minimizerOptions: { targets: BROWSER_TARGETS },
      }),
    ],
  },
  resolve: {
    modules: ["node_modules"],
    extensions: ["...", ".ts", ".tsx"],
    alias: {
      "@": path.resolve(PROJECT_PATH, "src"),
    },
  },
  experiments: {
    css: true,
  },
});
