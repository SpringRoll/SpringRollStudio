import store from '../../../renderer/store';

/**
 * Proxy for accessing ProjectInfo store data. This will allow us to avoid 
 * importing and typing 'store.state.projectInfo'
 * @class ProjectInfo
 */
class ProjectInfo {
  /**
   * Returns the project location path from the store.
   * @readonly
   * @memberof ProjectInfo
   */
  get location() { return store.state.projectInfo.location; }
  /**
   * Sets the value of the project location in the store.
   * @memberof ProjectInfo
   */
  set location(val) {
    if (typeof val !== 'string') {
      throw new Error(`[ProjectInfo] Project location must be a string. [val = ${typeof val}]`);
    }
    store.dispatch('setProjectLocation', { location: val });
  }
}

/**
 * Singleton proxy for accessing project info from the store.
 */
export const projectInfo = new ProjectInfo();