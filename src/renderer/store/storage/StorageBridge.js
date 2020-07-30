/**
 *
 * @class StorageBridge
 */
class StorageBridge {
  /**
   * Creates an instance of StorageBridge.
   * @param {*} options
   * @param {*} vuexStore
   * @memberof StorageBridge
   */
  constructor(options, vuexStore) {

  }
}

export default (options = {}) => vuexStore => new StorageBridge(options, vuexStore);