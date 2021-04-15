import webpack from "webpack";
import config, { chromeExtensionBoilerplate } from "../webpack.config";

delete chromeExtensionBoilerplate;

webpack(
  config,
  function (err) { if (err) throw err; }
);