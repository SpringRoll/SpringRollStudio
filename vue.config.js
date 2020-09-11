const path = require('path');

module.exports = {

  configureWebpack: {
    entry: {
      app: path.resolve(__dirname, 'src/renderer/main.js')
    },

    resolve: {
      alias: {
        vue$: 'vue/dist/vue.esm.js'
      }
    }
  },

  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg');

    svgRule.uses.clear();

    svgRule
      .use('babel-loader')
      .loader('babel-loader')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader');

    const fontsRule = config.module.rule('fonts');

    fontsRule.uses.clear();

    fontsRule
      .test('/\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/')
      .use('file-loader')
      .loader('file-loader');
    // .end();
  },

  pluginOptions: {

    electronBuilder: {
      nodeIntegration: true,
      webviewTag: true,
      webSecurity: false,

      mainProcessFile: 'src/main/index.js',

      // Fix this. This will watch file creation and deletion as well.
      mainProcessWatch: ['src/main/**/*.js'],

      builderOptions: {
        productName: 'SpringrollStudio',
        appId: 'io.springroll.studio',
        artifactName: '${productName}-${os}-${version}-Setup.${ext}',
        directories: {
          output: 'build'
        },
        dmg: {
          contents: [
            { x: 410, y: 150, type: 'link', path: '/Applications' },
            { x: 130, y: 150, type: 'file' }
          ]
        },
        mac: {
          icon: 'build/icons/icon.icns'
        },
        win: {
          icon: 'build/icons/icon.ico'
        }
      }
    }
  }
};