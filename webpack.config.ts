'use strict';

const path = require('path');

import webpack, {
    LoaderOptionsPlugin,
    DefinePlugin,
    optimize
} from 'webpack';
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

module.exports = function(options) {
    const config: webpack.Configuration = {
        entry: './src/index',
        output: {
            path: __dirname + '/dist',
            filename: options.filename,
            library: 'jwt',
            libraryTarget: 'umd'
        },
        module: {
            noParse: /node_modules\/localforage\/dist\/localforage.js/,
            rules: [
                {
                    test: /\.ts$/,
                    enforce: 'pre',
                    loader: 'tslint-loader'
                },
                {
                    test: /\.ts$/,
                    loader: 'ts-loader',
                    exclude: [
                        path.resolve(__dirname, 'node_modules'),
                        '*.test.ts'
                    ]
                }
            ]
        },
        plugins: [
            new LoaderOptionsPlugin({
                minimize: false,
                debug: false
            }),
            new DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('production')
                }
            }),
            new HtmlWebpackPlugin({
                filename: 're-login-Iframe.html',
                template: './src/re-login-Iframe.html',
                inject: true,
                inlineSource: '.(js|css)$'
            }),
            new HtmlWebpackInlineSourcePlugin()
        ],
        resolve: {
            extensions: ['.js', '.ts']
        }
    };

    if (options.minified) {
        config.plugins.push(
            new LoaderOptionsPlugin({
                minimize: false,
                debug: false
            })
        );
        config.plugins.push(
            new optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            })
        )
    }

    return config;
};
