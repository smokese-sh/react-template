const MiniCSS = require("mini-css-extract-plugin");
const Terser = require("terser-webpack-plugin");
const OptimizeCSSAssets = require("optimize-css-assets-webpack-plugin");
const HtmlWebpack = require("html-webpack-plugin");
const fs = require("fs");
const path = require("path");
const Workbox = require("workbox-webpack-plugin");
const { DefinePlugin } = require("webpack");
require("string.prototype.matchall").shim();
process.env.NODE_ENV = "production";
const src = path.resolve(__dirname, "..", "src");

module.exports = {
  mode: "production",
  name: "client",
  entry: [path.resolve(src, "app", "index.js")],
  output: {
    path: path.resolve(src, "server", "dist"),
    publicPath: "/",
    filename: "[contenthash:8].js",
    chunkFilename: "[contenthash:8].chunk.js",
  },
  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      assets: path.resolve(src, "app", "assets"),
    },
  },
  optimization: {
    minimize: true,
    minimizer: [
      new Terser({
        terserOptions: {
          parse: { ecma: 8 },
          compress: { ecma: 8, warnings: false, inline: 2 },
          output: { ecma: 8, comments: false, ascii_only: true },
        },
        parallel: true,
        cache: true,
      }),
      new OptimizeCSSAssets({
        cssProcessorOptions: {
          map: false,
        },
      }),
    ],
    splitChunks: {
      chunks: "all",
    },
  },
  module: {
    strictExportPresence: true,
    rules: [
      { parser: { requireEnsure: false } },
      {
        test: /\.(js|jsx)$/,
        include: path.resolve(src, "app"),
        loader: "babel-loader",
        options: {
          cacheDirectory: true,
          cacheCompression: true,
          compact: true,
          presets: ["@babel/preset-react"],
          plugins: [
            "@babel/plugin-syntax-dynamic-import",
            "@babel/plugin-proposal-class-properties",
            "@babel/plugin-proposal-export-default-from",
            "@babel/plugin-proposal-object-rest-spread",
          ],
        },
      },
      {
        test: /\.s?css$/,
        use: [
          MiniCSS.loader,
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
            },
          },
        ],
      },
      {
        test: /\.(png|gif|jpg|webp|eot|woff|woff2|ttf|otf)$/,
        use: ["file-loader"],
      },
      { test: /\.svg$/, use: ["@svgr/webpack"] },
    ],
  },
  plugins: [
    new HtmlWebpack({
      template: path.resolve(src, "app", "index.html"),
      filename: "index.html",
    }),
    new MiniCSS({
      filename: "[contenthash:8].css",
      chunkFilename: "[contenthash:8].chunk.css",
    }),
    new DefinePlugin({
      __PAYPAL_ENV__: '"production"',
    }),
    new Workbox.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
    }),
    {
      apply: (compiler) => {
        compiler.hooks.compile.tap("miscFiles", () => {
          const appDir = path.resolve(src, "app");
          const buildDir = path.resolve(src, "server", "dist");
          const appFile = fs.readFileSync(
            path.resolve(appDir, "App.jsx"),
            "utf8"
          );

          const sitemapTemplate = fs.readFileSync(
            path.resolve(appDir, "sitemap.xml"),
            "utf8"
          );
          let sitemapLocations = "";
          for (const [, match] of appFile.matchAll(/path=".*?"/g)) {
            sitemapLocations += `<url><loc>https://site.com${match}</url></loc>`;
          }

          fs.writeFileSync(
            path.resolve(buildDir, "sitemap.xml"),
            sitemapTemplate.replace("$locations", sitemapLocations)
          );
          fs.copyFileSync(
            path.resolve(appDir, "robots.txt"),
            path.resolve(buildDir, "robots.txt")
          );
        });
      },
    },
  ],
};