import { createVue } from '../../utils/VueUtils';
import CaptionStudio from '@/renderer/components/pages/CaptionStudio.vue';

describe('CaptionStudio.vue', () => {

  it('should mount and render', () => {
    const wrapper = createVue(CaptionStudio);
    wrapper.vm.$store.commit('audioLocation', { audioLocation: 'this/is/also/a/test' });
    expect(wrapper.vm.enabled).to.be.false;
  });

  it('hide button should properly set the state to hidden', () => {
    const wrapper = createVue(CaptionStudio);

    expect(wrapper.vm.explorerHidden).to.be.false;
    wrapper.find('.caption__hide-sidebar').trigger('click');
    expect(wrapper.vm.explorerHidden).to.be.true;
  });
});