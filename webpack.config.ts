import * as webpack from "webpack";
import path = require("path");
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
import ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
import MiniCssExtractPlugin = require("mini-css-extract-plugin");
import CopyWebpackPlugin = require("copy-webpack-plugin");

const r = (file: string) => path.resolve(__dirname, file);

module.exports = (env: any) => {
	const useCdnForMonaco = !!env["use-cdn-for-monaco"];
	return {
		entry: {
			"content-script": r("./src/content-script"),
			"content-script-main": r("./src/content-script-main/index"),
			options: r("./src/options"),
			styles: r("./src/styles.scss"),
		},
		output: {
			path: r("./dist"),
			filename: "[name].js",
		},
		devtool: "inline-source-map", // Use inline-source-map 
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
					use: [
						MiniCssExtractPlugin.loader,
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
		plugins: [
			new MiniCssExtractPlugin(),
			new CleanWebpackPlugin(),
			new webpack.EnvironmentPlugin({
				USE_CDN_FOR_MONACO: useCdnForMonaco ? "1" : "0",
			}),
			new ForkTsCheckerWebpackPlugin(),
			new CopyWebpackPlugin({
				patterns: [
					{
						from: "./src/options/index.html",
						to: "./options.html",
					},
				],
			}),
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
