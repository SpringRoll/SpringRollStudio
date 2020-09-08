import Vue from 'vue';

import router from './router';
import store from './store';

import App from './App.vue';
import { ipcRenderer } from 'electron';
import { EVENTS } from '../contents';

Vue.config.productionTip = false;

const vm = new Vue({
  components: { App },
  store,
  router,
  template: '<App/>'
}).$mount('#app');

ipcRenderer.on(EVENTS.NAVIGATE, (event, path) => router.push({ path }));
