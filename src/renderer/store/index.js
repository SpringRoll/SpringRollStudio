import Vue from 'vue';
import Vuex from 'vuex';

import persistentState from './storage/PersistentState';
import projectInfo from './modules/ProjectInfo';
import gamePreview from './modules/GamePreview';

Vue.use(Vuex);

export default new Vuex.Store({
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
});