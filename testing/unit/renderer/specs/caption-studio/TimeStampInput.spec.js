import { createVue } from '../../utils/VueUtils';
import TimeStampInput from '@/renderer/components/caption-studio/TimeStampInput.vue';

describe('TimeStampInput.vue', () => {

  it('should mount successfully', () => {
    const wrapper = createVue(TimeStampInput);
  });

});