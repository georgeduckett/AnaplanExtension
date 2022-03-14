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
			// If the below still doesn't make the file small enough for firefox,
			// maybe we have to try and split up index.ts to have different entry points / be different files and try and reduce the size that way
			minimize: argv.mode === "production",
			minimizer: [new TerserPlugin({
				test: /\.js$/,
				terserOptions: {
					compress: argv.mode === "production",
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
