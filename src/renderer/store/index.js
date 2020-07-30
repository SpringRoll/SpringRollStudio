import Vue from 'vue';
import Vuex from 'vuex';

import persistentState from './storage/PersistentState';
import storageBridge from './storage/StorageBridge';

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
    }),
    storageBridge()
  ]
});