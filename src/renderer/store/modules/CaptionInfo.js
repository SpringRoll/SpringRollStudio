export default {
  state: {
    audioLocation: undefined,
    captionLocation: undefined
  },

  mutations: {
    audioLocation: (state, payload) => state.audioLocation = payload.audioLocation,
    captionLocation: (state, payload) => state.captionLocation = payload.captionLocation
  },

  actions: {
    setAudioLocation: (store, payload) => store.commit('audioLocation', payload),
    setCaptionLocation: (store, payload) => store.commit('captionLocation', payload)
  }
};