const { EnvironmentPlugin } = require("webpack");

const path = require("path")
const { CheckerPlugin } = require("awesome-typescript-loader")
const WebpackAssetsManifest = require("webpack-assets-manifest")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

const TerserJSPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const { TsConfigPathsPlugin } = require("awesome-typescript-loader")

const dotenv = require("dotenv")

// make sure NODE_ENV is always set.
process.env.NODE_ENV = process.env.NODE_ENV || "development"
const prod = process.env.NODE_ENV === "production"

const { parsed: env } = dotenv.config({ path: path.resolve(__dirname, "./.webpack.env") })

module.exports = {
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        alias: {
            "react-dom": prod ? "react-dom" : "@hot-loader/react-dom"
        },
        plugins: [
            new TsConfigPathsPlugin(),
        ]
    },
    context: path.resolve(__dirname, "./app"),
    mode: prod ? "production" : "development",
    entry: [
        "react-hot-loader/patch",
        "core-js/stable",
        "regenerator-runtime/runtime",
        "./index.tsx"
    ],
    output: {
        // TODO: add hash to output file (make studip load the has file)
        filename: "js/bundle.[hash].js",
        chunkFilename: "js/chunk.[chunkhash].js",
        path: path.resolve(__dirname, "./dist"),
        publicPath: `${env.PLUGIN_PATH}/dist/`,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ["babel-loader", "eslint-loader"],
                exclude: /node_modules/,
            },
            {
                test: /\.tsx?$/,
                use: ["babel-loader", "awesome-typescript-loader", "eslint-loader"],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [
                    prod ? MiniCssExtractPlugin.loader : "style-loader",
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
                    prod ? MiniCssExtractPlugin.loader : "style-loader",
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
        }),
        new EnvironmentPlugin([
            'NODE_ENV',
            'PLUGIN_URL_PATH'
        ]),
    ],
    devtool: "source-map",
    watch: !prod,
    optimization: {
        minimizer: [
            new TerserJSPlugin({}),
            new OptimizeCSSAssetsPlugin({})
        ],
    },
    devServer: {
		proxy: {
			[`!${env.PLUGIN_PATH}/dist/**`]: {
				target: env.STUDIP_URL,
				secure: false,
			},
		},

		hot: true,
		inline: true,
		disableHostCheck: true,
	},
};
