import Vue from 'vue';
import vuetify from './plugins/vuetify'; // path to vuetify export
import 'material-design-icons-iconfont/dist/material-design-icons.css';

import router from './router';
import store from './store';

import App from './App.vue';
import { ipcRenderer } from 'electron';
import { EVENTS } from '../contents';

// Plugins
import './plugins';

// Styles
import './scss/main.scss';

// State
import './class/CaptionManager';

Vue.config.productionTip = false;

const vm = new Vue({
  components: { App },
  vuetify,
  store,
  router,
  template: '<App/>'
}).$mount('#app');

ipcRenderer.on(EVENTS.NAVIGATE, (event, path) => router.push({ path }));
