import { createVue } from '../../utils/VueUtils';
import WaveSurfer from '@/renderer/components/caption-studio/WaveSurfer.vue';

describe('WaveSurfer.vue', () => {

  //WaveSurfer.vue mostly acts as a wrapper for Wavesurfer.js.
  it('should mount successfully', () => {
    const wrapper = createVue(WaveSurfer);
  });

});