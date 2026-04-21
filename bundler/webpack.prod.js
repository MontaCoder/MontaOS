const { merge } = require('webpack-merge')
const commonConfiguration = require('./webpack.common.js')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = merge(
    commonConfiguration,
    {
        mode: 'production',
        devtool: false,
        performance: {
            assetFilter: (assetFilename) => {
                return !/\.(mp4|mp3|ogg|wav|jpg|jpeg|png|gif|svg|wasm)$/i.test(
                    assetFilename
                );
            },
            maxAssetSize: 2 * 1024 * 1024,
            maxEntrypointSize: 2 * 1024 * 1024,
        },
        optimization: {
            moduleIds: 'deterministic',
            chunkIds: 'deterministic',
            runtimeChunk: 'single',
            usedExports: true,
            sideEffects: true,
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    three: {
                        test: /[\\/]node_modules[\\/]three[\\/]/,
                        name: 'three-vendor',
                        priority: 30,
                        enforce: true,
                    },
                    ui: {
                        test: /[\\/]node_modules[\\/](react|react-dom|framer-motion|popmotion|framesync|style-value-types|hey-listen|tslib)[\\/]/,
                        name: 'ui-vendor',
                        priority: 20,
                        enforce: true,
                    },
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendor',
                        priority: 10,
                        reuseExistingChunk: true,
                    },
                },
            },
        },
        plugins:
        [
            new CleanWebpackPlugin()
        ]
    }
)
