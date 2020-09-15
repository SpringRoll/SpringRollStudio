import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css';

import router from './router';
import store from './store';

import App from './App.vue';
import { ipcRenderer } from 'electron';
import { EVENTS } from '../contents';

Vue.config.productionTip = false;
Vue.use(Vuetify, {
  theme: {
    primary: '#337ab7',
    secondary: '#123550',
    accent: '#0C7AC0',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107'
  }
});

const vm = new Vue({
  components: { App },
  store,
  router,
  template: '<App/>'
}).$mount('#app');

ipcRenderer.on(EVENTS.NAVIGATE, (event, path) => router.push({ path }));
