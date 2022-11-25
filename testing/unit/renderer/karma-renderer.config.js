const path = require('path');
const baseConfig = require('../../webpack-testing.config');

module.exports = (config) => {
  config.set({
    failOnEmptyTestSuite: false,
    colors: true,
    autoWatch: true,
    singleRun: true,
    files: ['specs/class/*.spec.js','specs/caption-studio/*.spec.js','specs/dialogs/*.spec.js','specs/store/*.spec.js','specs/pages/LandingPage.spec.js'],
    client: {
      useIframe: false
    },
    browserDisconnectTimeout: 100000,
    browserNoActivityTimeout: 100000,
    browserDisconnectTolerance: 10,
    frameworks: ['mocha', 'chai'],
    preprocessors: {
      'specs/**/*.spec.js': ['webpack']
    },

    webpack: {
      ...baseConfig,

      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../../../src')
        },
        extensions: ['.js', '.vue']
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
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
          }
        }
      }
    },

    browsers: ['VisibleElectron']
  });
};
