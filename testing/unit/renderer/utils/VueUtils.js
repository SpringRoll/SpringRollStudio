import { mount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
// import Vuetify from 'vuetify';
import persistentState from '@/renderer/store/storage/PersistentState';
import projectInfo from '@/renderer/store/modules/ProjectInfo';
import gamePreview from '@/renderer/store/modules/GamePreview';

const localVue = createLocalVue();

localVue.use(Vuex);
// localVue.use(Vuetify);

export const createVue = (component, options = {}) => {
  return mount(component, {
    ...options, 
    localVue,

    store: new Vuex.Store({
      modules: {
        projectInfo,
        gamePreview
      },

      plugins: [
        persistentState({
          name: 'studioConfig',
          key: 'studio'
        })
      ]
    })
  });
};