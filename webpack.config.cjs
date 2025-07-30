const webpack = require("webpack");

console.log("Node ENV:", process.env.NODE_ENV);

module.exports = {
    entry: "./dist/index.js",
    output: {
        path: __dirname + "/browser/",
        filename: 'pio.' + (process.env.NODE_ENV === "production" ? "prod" : "dev") +  '.js',
        library: {
            name: "PIO",
            type: "umd",
        }
    },
    resolve: {
        fallback: {
            assert: require.resolve('assert'),
            buffer: require.resolve('buffer'),
            process: require.resolve('process/browser'),
            stream: require.resolve('stream-browserify'),
            zlib: require.resolve('browserify-zlib'),
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser'
        })
    ],
    mode: process.env.NODE_ENV === "production" ? "production" : "development"
};