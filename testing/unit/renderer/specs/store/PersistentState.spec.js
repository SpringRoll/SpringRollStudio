import Vue from 'vue';
import Vuex from 'vuex';
import App from '@/App.vue';
import persistentState from '@/store/storage/PersistentState';
import projectInfo from '@/store/modules/ProjectInfo';

describe('PersistentState.js', () => {
  Vue.use(Vuex);

  const createVue = () => {
    return new Vue({ 
      store: new Vuex.Store({
        modules: {
          projectInfo
        },
        plugins: [
          persistentState({
            name: 'studioConfig',
            key: 'studio'
          })
        ]
      }), 
      render: h => h(App) 
    });
  };

  it('should successfully persist the Vuex state between Vue sessions', () => {
    let vm = createVue().$mount();
    vm.$store.commit('test', { test: 123 });

    vm.$destroy();
    vm = createVue().$mount();

    expect(vm.$store.state.projectInfo.test).to.equal(123);
  });
});