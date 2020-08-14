import Vue from 'vue';

import router from './router';
import store from './store';

import App from './App.vue';

Vue.config.productionTip = false;

new Vue({
  components: { App },
  store,
  router,
  template: '<App/>'
}).$mount('#app');
