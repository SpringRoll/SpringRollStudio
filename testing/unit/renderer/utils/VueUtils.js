import Vue from 'vue';
import Vuex from 'vuex';
import persistentState from '@/renderer/store/storage/PersistentState';
import projectInfo from '@/renderer/store/modules/ProjectInfo';

Vue.use(Vuex);

export const createVue = (options = {}) => {
  return new Vue({
    ...options,

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
    })
  });
};