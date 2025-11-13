import { merge } from "webpack-merge";
import { commonConfig } from "./common.config";

// This variable should mirror the one from config/settings/production.py
const s3BucketName = process.env.DJANGO_AWS_STORAGE_BUCKET_NAME;
const awsS3Domain =
  process.env.DJANGO_AWS_S3_CUSTOM_DOMAIN || `${s3BucketName}.s3.amazonaws.com`;
const staticUrl = `https://${awsS3Domain}/static/`;

export default merge(commonConfig, {
  mode: "production",
  devtool: "source-map",
  bail: true,
  output: {
    publicPath: `${staticUrl}bundles/`,
    filename: "js/[name]-[fullhash].js",
    chunkFilename: "js/[name]-[hash].js",
    cssFilename: "css/[name]-[contenthash].css",
    assetModuleFilename: "assets/[name]-[hash][ext]",
  },
});
