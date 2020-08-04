export default {
  state: {
    test: 'Springroll Studio'
  },

  mutations: {
    test: (state, payload) => state.test = payload.test
  },

  actions: {
    setTest: (store, payload) => store.commit('test', payload)
  }
};