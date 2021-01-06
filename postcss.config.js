const tailwindcss = require("tailwindcss")
const postcssImport = require("postcss-import")
const postcssPresetEnv = require("postcss-preset-env")
const postcssNested = require("postcss-nested")

module.exports = {
    plugins: [
        tailwindcss,
        postcssImport,
        postcssNested,
        postcssPresetEnv,
    ]
}
