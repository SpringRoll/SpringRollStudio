module.exports = (config) => {
  config.set({
    files: ['./index.js'],

    client: {
      useIframe: false
    },

    frameworks: ['mocha', 'chai'],
    preprocessors: {
      './index.js': ['webpack', 'sourcemap']
    },

    webpack: require('../../webpack-renderer.config'),
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
          webPreferences: {
            nodeIntegration: true
          }
        }
      }
    },

    browsers: ['VisibleElectron']
  })
};
