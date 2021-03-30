export default {
  state: {
    audioLocation: undefined,
    captionLocation: undefined,
    isUnsavedChanges: false,
  },

  mutations: {
    audioLocation: (state, payload) => state.audioLocation = payload.audioLocation,
    captionLocation: (state, payload) => state.captionLocation = payload.captionLocation,
    isUnsavedChanges: (state, payload) => state.isUnsavedChanges = payload.isUnsavedChanges,
  },

  actions: {
    setAudioLocation: (store, payload) => store.commit('audioLocation', payload),
    setCaptionLocation: (store, payload) => store.commit('captionLocation', payload),
    setIsUnsavedChanges: (store, payload) => store.commit('isUnsavedChanges', payload),
  }
};