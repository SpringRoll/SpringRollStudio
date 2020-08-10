import Vue from 'vue';
import VueMaterial from 'vue-material';
import 'vue-material/dist/vue-material.min.css';

import router from './router';
import store from './store';

import App from './App.vue';

Vue.use(VueMaterial);
Vue.config.productionTip = false;

new Vue({
  components: { App },
  store,
  router,
  template: '<App/>'
}).$mount('#app');
