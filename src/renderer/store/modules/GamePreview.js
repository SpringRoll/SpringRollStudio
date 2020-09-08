export default {
  state: {
    previewTarget: undefined,
    previewURL: undefined
  },

  mutations: {
    previewTarget: (state, payload) => state.previewTarget = payload.previewTarget,
    previewURL: (state, payload) => state.previewURL = payload.previewURL
  },

  actions: {
    setPreviewTarget: (store, payload) => store.commit('previewTarget', payload),
    setPreviewURL: (store, payload) => store.commit('previewURL', payload)
  }
};