const VueLoaderPlugin = require('vue-loader/lib/plugin'); // vue-loader @15版本及以上必写
const CopyWebpackPlugin = require('copy-webpack-plugin') // 用于拷贝文件

const path = require('path')
const srcDir = path.resolve(__dirname, './src')
module.exports = {
    // 入口
    entry: './src/main.js',

    // 出口
    output: {
        filename: 'js/[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },

    // 模块
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.(css|scss)$/,
                exclude: /node_modules/,
                use: ['style-loader', 'css-loader', 'sass-loader',
                    {
                        loader: 'px2rem-loader',
                        options: {
                            remUni: 75
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [require("autoprefixer")("last 100 versions")]
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                use: ["url-loader?limit=8192&name=images/[hash:8].[name].[ext]"]
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                //打包除这个文件之外的文件
                exclude: path.resolve(__dirname,"./node_modules"),
                //打包包括的文件
                include: path.resolve(__dirname, "./src"),
                options: {
                    'presets': ['latest']
                }
            }
        ]
    },

    // 插件
    plugins: [
        new VueLoaderPlugin(),
        new CopyWebpackPlugin([
            {
                from : './index.html',
                to: './'
            }
        ]),
    ],

    resolve: {
        alias: {
            '@': srcDir
        },
        extensions: ['.ts', '.js', '.json']
    },

    devServer: {
        port: 9900, // 端口
        host: '192.168.52.120'
    }
}