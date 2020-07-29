import Vue from 'vue';

Vue.config.devtools = false;
Vue.config.productionTip = false;

const testsContext = require.context('./specs', true, /\.spec$/);
testsContext.keys().forEach(testsContext);

// const srcContext = require.context('../../../src/renderer', true);
// srcContext.keys().forEach(srcContext);