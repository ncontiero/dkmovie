import { merge } from "rspack-merge";
import { commonConfig } from "./common.config";

export default merge(commonConfig, {
  mode: "production",
  devtool: "source-map",
  bail: true,
  output: {
    publicPath: "auto",
    filename: "js/[name]-[fullhash].js",
    chunkFilename: "js/[name]-[hash].js",
    cssFilename: "css/[name]-[contenthash].css",
  },
});
