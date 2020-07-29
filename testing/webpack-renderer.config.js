const { VueLoaderPlugin } = require('vue-loader');
const path = require('path');

/**
 * To be used for testing only.
 */
module.exports = {
  devtool: '#inline-source-map',

  plugins: [
    new VueLoaderPlugin()
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader'
      }
    ]
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src/renderer'),
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['.js', '.vue', '.json', '.css', '.node']
  },

  target: 'electron-renderer'
}