import {
    Configuration
} from 'webpack';
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

module.exports = function() {
    const config: Configuration = {
        entry: './src/index',
        output: {
            path: __dirname + '/dist',
            filename: 'jwt.js',
            library: 'jwt',
            libraryTarget: 'umd'
        },
        mode: 'production',
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
                    exclude: /node_modules/
                }
            ]
        },
        plugins: [
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
    return config;
};
