'use strict';

const webpack = require('webpack');
const path = require('path');

module.exports = function(options) {
    const config = {
        entry: './src/index',
        output: {
            filename: options.filename,
            library: 'jwt',
            libraryTarget: 'umd'
        },
        module: {
            loaders: [{
                test: /\.ts$/,
                loader: 'ts',
                exclude: [
                    path.resolve(__dirname, 'node_modules'),
                    '*.test.ts'
                ]
            }],
            preLoaders: [{
                test: /\.ts$/,
                loader: 'tslint-loader'
            }]
        },
        plugins: [
            new webpack.optimize.OccurenceOrderPlugin(),
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('production')
                }
            })
        ],
        resolve: {
            extensions: ['', '.js', '.ts']
        }
    };

    if (options.minified) {
        config.plugins.push(
            new webpack.optimize.UglifyJsPlugin({
                compressor: {
                    warnings: false
                }
            })
        )
    }

    return config;
};
