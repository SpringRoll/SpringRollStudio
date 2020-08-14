import { createVue } from '../../utils/VueUtils';
import LandingPage from '@/renderer/components/pages/LandingPage.vue';

describe('PersistentState.js', () => {

  it('should persist the project location', () => {
    let wrapper = createVue(LandingPage);
    wrapper.vm.$store.commit('location', { location: 'path/to/test' });

    wrapper.destroy();
    wrapper = createVue(LandingPage);

    expect(wrapper.vm.$store.state.projectInfo.location).to.equal('path/to/test');
  });

  it('should persist the preview target', () => {
    let wrapper = createVue(LandingPage);
    wrapper.vm.$store.commit('previewTarget', { previewTarget: 'deploy' });

    wrapper.destroy();
    wrapper = createVue(LandingPage);

    expect(wrapper.vm.$store.state.gamePreview.previewTarget).to.equal('deploy');
  });

  it('should persist the preview url', () => {
    let wrapper = createVue(LandingPage);
    wrapper.vm.$store.commit('previewURL', { previewURL: 'this/is/a/test' });

    wrapper.destroy();
    wrapper = createVue(LandingPage);

    expect(wrapper.vm.$store.state.gamePreview.previewURL).to.equal('this/is/a/test');
  });
});