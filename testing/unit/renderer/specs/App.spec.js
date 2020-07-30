import Vue from 'vue';
import App from '@/App.vue';

describe('App.vue', () => {

  it('should render correct contents', () => {
    const vm = new Vue({
      el: document.createElement('div'),
      render: h => h(App)
    }).$mount();

    expect(vm.$el.querySelector('.test').textContent).to.contain('This is a test');
  });
});