import { mount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';

import persistentState from '@/renderer/store/storage/PersistentState';
import projectInfo from '@/renderer/store/modules/ProjectInfo';
import gamePreview from '@/renderer/store/modules/GamePreview';
import captionInfo from '@/renderer/store/modules/CaptionInfo';

const localVue = createLocalVue();

localVue.use(Vuex);

export const createVue = (component, options = {}) => {
  return mount(component, {
    ...options,
    localVue,

    store: new Vuex.Store({
      modules: {
        projectInfo,
        gamePreview,
        captionInfo,
      }
    })
  });
};