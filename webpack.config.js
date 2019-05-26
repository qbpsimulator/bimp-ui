const webpack = require('webpack');
const path = require('path');

module.exports = function (env) {
    const isProduction = env === 'prod';
    const fileSuffix = isProduction ? '.min' : '';

    let plugins;

    if (isProduction) {
        plugins = [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify('production')
            }),
            new webpack.LoaderOptionsPlugin({
                debug: false,
                minimize: true,
            })
        ];
    }
    else {
        plugins = [
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NamedModulesPlugin(),
        ];
    }

    return {
        entry: "./src/index.tsx",
        output: {
            filename: "bimp.bundle" + fileSuffix +".js",
            path: __dirname + "/dist/static",
            publicPath: "/static/",
            // export itself to a global var
            libraryTarget: "var",
            // name of the global var: "Bimp"
            library: "Bimp"
        },

        // Enable sourcemaps for debugging webpack's output.
        devtool: "source-map",
        mode: isProduction ? "production" : "development",

        resolve: {
            // Add '.ts' and '.tsx' as resolvable extensions.
            extensions: [".ts", ".tsx", ".js", ".json", ".css"],
            modules: ['node_modules']
        },

        module: {
            rules: [
                // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
                { test: /\.tsx?$/, loader: "awesome-typescript-loader" },

                // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
                { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },

                {
                    test: /\.css$/,
                    use: [
                        "style-loader",
                        {
                            loader: "css-loader",
                            options: {
                                modules: true,
                                sourceMap: true,
                                importLoaders: 1,
                                localIdentName: "[name]--[local]--[hash:base64:8]"
                            }
                        },
                        "postcss-loader" // has separate config, see postcss.config.js nearby
                    ]
                },
            ]
        },
        plugins: plugins,

        // When importing a module whose path matches one of the following, just
        // assume a corresponding global variable exists and use that instead.
        // This is important because it allows us to avoid bundling all of our
        // dependencies, which allows browsers to cache those libraries between builds.
        externals: {
            // "react": "React",
            // "react-dom": "ReactDOM"
        },
        optimization: {
            minimize: isProduction
        },
        node: {
            fs: "empty",
            child_process: "empty"
        },
        devServer: {
            historyApiFallback: true
        }
    }
};