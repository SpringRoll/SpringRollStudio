import Vue from 'vue';
import Vuex from 'vuex';

import persistentState from './storage/PersistentState';
import projectInfo from './modules/ProjectInfo';
import gamePreview from './modules/GamePreview';
import captionInfo from './modules/CaptionInfo';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    projectInfo,
    gamePreview,
    captionInfo
  },

  plugins: [
    persistentState({
      name: 'studioConfig',
      key: 'studio'
    })
  ]
});