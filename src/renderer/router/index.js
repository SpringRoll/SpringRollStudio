import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('../components/pages/LandingPage').default
    },
    {
      path: '/preview',
      name: 'preview-page',
      component: require('../components/pages/PreviewPage').default
    },
    {
      path: '/preview-error',
      name: 'preview-error-page',
      component: require('../components/pages/PreviewErrorPage').default
    }
  ]
});