const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Metro compiles global css into native styles
module.exports = withNativeWind(config, { input: "./global.css" });
