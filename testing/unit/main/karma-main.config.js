const path = require('path');
const baseConfig = require('../../webpack-testing.config');

module.exports = (config) => {
  config.set({
    failOnEmptyTestSuite: false,
    colors: true,
    autoWatch: true,
    singleRun: true,

    files: ['specs/**/*.spec.js'],

    client: {
      useIframe: false
    },

    frameworks: ['mocha', 'chai'],
    preprocessors: {
      'specs/**/*.spec.js': ['webpack', 'electron', 'sourcemap']
    },

    webpack: {
      ...baseConfig,

      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../../../src/main')
        }
      },

      target: 'electron-main'
    },
    webpackMiddleware: {
      stats: 'errors-only'
    },

    colors: true,
    autoWatch: true,
    singleRun: true,

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
  });
};
