import Vue from 'vue';
import Vuex from 'vuex';
import App from '@/App.vue';
import store from '@/store';

describe('App.vue', () => {
  Vue.use(Vuex);

  it('should render correct contents', () => {
    const vm = new Vue({
      el: document.createElement('div'),
      store,
      render: h => h(App)
    }).$mount();

    expect(vm.$el.querySelector('.test').textContent).to.contain('This is a test');
  });
});