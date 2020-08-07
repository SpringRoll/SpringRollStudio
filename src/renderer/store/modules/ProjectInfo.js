export default {
  state: {
    location: undefined
  },

  mutations: {
    location: (state, payload) => state.location = payload.location
  },

  actions: {
    setProjectLocation: (store, payload) => store.commit('location', payload)
  }
};