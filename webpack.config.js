const path = require("path")
const { CheckerPlugin } = require("awesome-typescript-loader")
const WebpackAssetsManifest = require("webpack-assets-manifest")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

const TerserJSPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

const prod = process.env.NODE_ENV === "production"

module.exports = {
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    context: path.resolve(__dirname, "./app"),
    mode: prod ? "production" : "development",
    entry: "./index.tsx",
    output: {
        // TODO: add hash to output file (make studip load the has file)
        filename: "js/bundle.[hash].js",
        path: path.resolve(__dirname, "./dist"),
        publicPath: "/",
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ["babel-loader", "source-map-loader"],
                exclude: /node_modules/,
            },
            {
                test: /\.tsx?$/,
                use: ["babel-loader", "awesome-typescript-loader"],
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 1
                        }
                    },
                    {
                        loader: "postcss-loader"
                    }
                ],
                exclude: /\.module\.css$/
            },
            {
                test: /\.module\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 1,
                            modules: prod ? true : {
                                // nicer class names for dev
                                localIdentName: '[name]__[local]___[hash:base64:8]'
                            },
                        }
                    },
                    {
                        loader: "postcss-loader"
                    }
                ],
            },
        ]
    },
    plugins: [
        CheckerPlugin,
        new WebpackAssetsManifest({
            entrypoints: true,
            integrity: true,
            writeToDisk: true,
            output: "manifest.json",
            customize: entry => {
                // make sure that entry keys match up with the values in the entrypoints
                return {
                    key: entry.value,
                }
            },
        }),
        new MiniCssExtractPlugin({
            filename: 'css/[name].[hash].css',
            chunkFilename: 'css/[id].[hash].css',
        })
    ],
    devtool: prod ? "source-map" : "cheap-module-source-map",
    watch: !prod,
    optimization: {
        minimizer: [
            new TerserJSPlugin({}),
            new OptimizeCSSAssetsPlugin({})
        ],
    },
};
