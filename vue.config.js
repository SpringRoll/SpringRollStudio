const path = require('path');

module.exports = {

  configureWebpack: {
    entry: {
      app: path.resolve(__dirname, 'src/renderer/main.js')
    }
  },

  pluginOptions: {

    electronBuilder: {
      nodeIntegration: true,

      mainProcessFile: path.resolve(__dirname, 'src/main/index.js'),

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