const tailwindcss = require("tailwindcss")
const postcssImport = require("postcss-import")
const postcssPresetEnv = require("postcss-preset-env")

module.exports = {
    plugins: [
        tailwindcss,
        postcssImport,
        postcssPresetEnv,
    ]
}
