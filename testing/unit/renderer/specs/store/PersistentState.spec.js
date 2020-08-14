import { createVue } from '../../utils/VueUtils';

describe('PersistentState.js', () => {

  it('should successfully persist the Vuex state between Vue sessions', () => {
    let vm = createVue().$mount();
    vm.$store.commit('location', { location: 'path/to/test' });

    vm.$destroy();
    vm = createVue().$mount();

    expect(vm.$store.state.projectInfo.location).to.equal('path/to/test');
  });
});