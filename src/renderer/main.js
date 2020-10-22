import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
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
Vue.use(Vuetify);

const vm = new Vue({
  components: { App },
  store,
  router,
  template: '<App/>'
}).$mount('#app');

ipcRenderer.on(EVENTS.NAVIGATE, (event, path) => router.push({ path }));
