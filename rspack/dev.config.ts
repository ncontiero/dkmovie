import { ReactRefreshRspackPlugin } from "@rspack/plugin-react-refresh";
import { merge } from "rspack-merge";
import { commonConfig } from "./common.config";

export default merge(commonConfig, {
  mode: "development",
  devtool: "inline-source-map",
  lazyCompilation: false,
  devServer: {
    devMiddleware: { writeToDisk: true },
    port: 3000,
    proxy: [
      {
        context: ["/"],
        target: "http://django:8000",
      },
    ],
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: true,
      },
    },
    watchFiles: ["dkmovie/**/templates/**/*.html"],
  },
  plugins: [new ReactRefreshRspackPlugin()],
});
