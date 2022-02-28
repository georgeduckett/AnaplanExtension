import * as webpack from "webpack";
import path = require("path");
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
import ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
import MiniCssExtractPlugin = require("mini-css-extract-plugin");
import TerserPlugin = require("terser-webpack-plugin");

const r = (file: string) => path.resolve(__dirname, file);

module.exports = (env: any, argv: any) => {
	const useCdnForMonaco = !!env["use-cdn-for-monaco"];
	return {
		entry: {
			"content-script": r("./src/content-script"),
			"content-script-main": r("./src/content-script-main/index"),
			styles: r("./src/styles.scss"),
		},
		output: {
			path: r("./bin"),
			filename: "[name].js",
			publicPath: '',
		},
		devtool: argv.mode === "production" ? false : "inline-source-map", // Use inline-source-map 
		externals: {
			vscode: "commonjs vscode",
		},
		resolve: {
			extensions: [".ts", ".js"],
			fallback: {
				assert: require.resolve("assert/"),
				util: require.resolve("util/")
			}
		},
		module: {
			rules: [
				{
					test: /\.css$/,
					rules: [
						{ loader: "style-loader" },
						{ loader: "css-loader" },
					],
				},
				{
					test: /\.scss$/,
					use: [{
						loader: MiniCssExtractPlugin.loader,
						options: {
							publicPath: ''
						}
					},
						"css-loader",
						"sass-loader",
					],
				},
				{
					test: /\.(jpe?g|png|gif|eot|ttf|svg|woff|woff2|md)$/i,
					loader: "file-loader",
				},
				{
					test: /\.tsx?$/,
					exclude: /node_modules/,
					loader: "ts-loader",
					options: { transpileOnly: true },
				},
			],
		},
		optimization: {
			splitChunks: { // TODO: Try and get the below working, so we can split the content-script-main script up in case it gets too large for firefox
				// Maybe we have to try and split up index.ts to have different entry points / be different files and try and reduce the size that way
				/*cacheGroups: { // Splitting up like this doesn't work, even when we include all chunks in contet-script.ts
					entrypoints: {
						name: 'entry',
						chunks: 'initial',
						maxSize: 4000000,
						maxInitialSize: 4000000,
						minSize: 3000000,
						minRemainingSize: 3000000,
					},
				},*/
			},
			minimize: true,
			minimizer: [new TerserPlugin({
				test: /\.js$/,
				terserOptions: {
					compress: true,
				}
			})]
		},
		plugins: [
			new MiniCssExtractPlugin(),
			new CleanWebpackPlugin(),
			new webpack.EnvironmentPlugin({
				USE_CDN_FOR_MONACO: useCdnForMonaco ? "1" : "0",
			}),
			new ForkTsCheckerWebpackPlugin(),
			new CleanWebpackPlugin(),
			...(useCdnForMonaco
				? []
				: [
					new MonacoWebpackPlugin({
						languages: ["markdown"],
					}),
				]),
			new webpack.ProvidePlugin({
				process: 'process/browser',
			}),
		],
	} as webpack.Configuration;
};
