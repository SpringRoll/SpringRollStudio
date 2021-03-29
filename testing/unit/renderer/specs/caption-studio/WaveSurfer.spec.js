import { createVue } from '../../utils/VueUtils';
import WaveSurfer from '@/renderer/components/caption-studio/WaveSurfer.vue';

describe('WaveSurfer.vue', () => {

  //WaveSurfer.vue mostly acts as a wrapper for Wavesurfer.js.
  it('should mount successfully', () => {
    const wrapper = createVue(WaveSurfer);

    expect(wrapper.vm.wave).to.not.be.null;
    expect(wrapper.vm.isPlaying).to.be.false,
    expect(wrapper.vm.hasFile).to.be.false,
    expect(wrapper.vm.currentTime).to.equal(0);
  });

});