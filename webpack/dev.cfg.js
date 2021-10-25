const MiniCSS = require("mini-css-extract-plugin");
const HtmlWebpack = require("html-webpack-plugin");
const BrowserSync = require("browser-sync-webpack-plugin");
const { resolve, join } = require("path");
const fs = require("fs");
const { DefinePlugin } = require("webpack");
process.env.NODE_ENV = "development";
const src = resolve(__dirname, "..", "src");

module.exports = {
  mode: "development",
  name: "client",
  entry: [resolve(src, "app", "index.js")],
  output: {
    path: resolve(src, "server", "dist"),
    publicPath: "/",
    filename: "[contenthash].js",
    chunkFilename: "[contenthash].chunk.js",
  },
  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      assets: resolve(src, "app", "assets"),
    },
  },
  optimization: {
    minimize: false,
    minimizer: [],
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
        include: resolve(src, "app"),
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
        test: /\.(png|jpg|gif|webp|eot|woff|woff2|ttf|otf)$/,
        use: ["file-loader"],
      },
      { test: /\.svg$/, use: ["@svgr/webpack"] },
    ],
  },
  plugins: [
    new HtmlWebpack({
      template: resolve(src, "app", "index.html"),
      filename: "index.html",
    }),
    new MiniCSS({
      filename: "[contenthash].css",
      chunkFilename: "[contenthash].chunk.css",
    }),
    new DefinePlugin({
      __PAYPAL_ENV__: '"sandbox"',
    }),

    {
      apply: (compiler) => {
        compiler.hooks.compile.tap("miscFiles", () => {
          const appDir = resolve(src, "app");
          const buildDir = resolve(src, "server", "dist");
          const appFile = fs.readFileSync(resolve(appDir, "App.jsx"), "utf8");
          const sitemapTemplate = fs.readFileSync(
            resolve(appDir, "sitemap.xml"),
            "utf8"
          );
          let sitemapLocations;
          for (const [, match] of appFile.matchAll(/path="(.?)"/g)) {
            sitemapLocations += `<url><loc>https://site.com${match}</loc></url>`;
          }

          fs.writeFileSync(
            resolve(buildDir, "sitemap.xml"),
            sitemapTemplate.replace("$locations", sitemapLocations)
          );
          fs.copyFileSync(
            resolve(appDir, "robots.txt"),
            resolve(buildDir, "robots.txt")
          );
        });
      },
    },
  ],
};