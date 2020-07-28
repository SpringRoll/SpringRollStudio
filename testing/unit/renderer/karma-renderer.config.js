module.exports = (config) => {
  config.set({
    files: ['./index.js'],

    customLaunchers: {
      VisibleElectron: {
        base: 'Electron',
        flags: ['--show']
      }
    },

    frameworks: ['mocha', 'chai'],
    preprocessors: {
      './index.js': ['webpack', 'electron', 'sourcemap']
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

    browsers: ['Electron']
  })
};
