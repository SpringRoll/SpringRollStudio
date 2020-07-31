import Vue from 'vue';
import Vuex from 'vuex';

import persistentState from './storage/PersistentState';
import projectInfo from './modules/ProjectInfo';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    projectInfo
  },

  plugins: [
    persistentState({
      name: 'studioConfig',
      key: 'studio'
    })
  ]
});