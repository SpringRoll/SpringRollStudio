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