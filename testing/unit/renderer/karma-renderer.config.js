const path = require('path');
const baseConfig = require('../../webpack-testing.config');

module.exports = (config) => {
  config.set({
    failOnEmptyTestSuite: false,
    colors: true,
    autoWatch: true,
    singleRun: true,

    files: ['./index.js'],

    client: {
      useIframe: false
    },

    frameworks: ['mocha', 'chai'],
    preprocessors: {
      './index.js': ['webpack', 'sourcemap']
    },

    webpack: {
      ...baseConfig,
    
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../../../src/renderer')
        }
      },
    
      target: 'electron-renderer'
    },
    webpackMiddleware: {
      stats: 'errors-only'
    },

    logLevel: config.LOG_INFO,
    reporters: ['progress'],

    customLaunchers: {
      VisibleElectron: {
        base: 'Electron',
        browserWindowOptions: {
          show: true,
          webPreferences: {
            nodeIntegration: true
          }
        }
      }
    },

    browsers: ['VisibleElectron']
  })
};
