import Store from 'electron-store';
import merge from 'deepmerge';

/**
 *
 * @class PersistentState
 */
class PersistentState {
  /**
   *
   * @readonly
   * @memberof PersistentState
   */
  get state() { return this.storage.get(this.key); }
  /**
   *
   * @memberof PersistentState
   */
  set state(value) { this.storage.set(this.key, value) }

  /**
   * Creates an instance of PersistentState.
   * @param {*} options
   * @param {*} vuexStore
   * @memberof PersistentState
   */
  constructor(options, vuexStore) {
    this.key = options.key || 'state';

    this.storage = new Store(options);
    this.vuexStore = vuexStore;

    if (this.state) {
      this.vuexStore.replaceState(merge(this.vuexStore.state, this.state));
    }
    else {
      this.state = this.vuexStore.state;
    }
    this.vuexStore.subscribe((mutation, state) => this.state = state);
  }
}

export default (options = {}) => vuexStore => new PersistentState(options, vuexStore);