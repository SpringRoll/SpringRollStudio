import { createVue } from '../../utils/VueUtils';
import TimeStamp from '@/renderer/components/caption-studio/TimeStamp.vue';

describe('TimeStamp.vue', () => {

  it('should mount successfully', () => {
    const wrapper = createVue(TimeStamp);
  });

});