import store from '../../../renderer/store';

/**
 * Proxy for accessing CaptionInfo store data. This will allow us to avoid
 * importing and typing 'store.state.captionInfo'
 * @class CaptionInfo
 */
class CaptionInfo {
  /**
   * Returns the audio files location path from the store.
   * @readonly
   * @memberof CaptionInfo
   */
  get audioLocation() { return store.state.captionInfo.audioLocation; }
  /**
   * Sets the value of the audio files location in the store.
   * @memberof CaptionInfo
   */
  set audioLocation(val) {
    if (typeof val !== 'string') {
      throw new Error(`[CaptionInfo] Audio directory location must be a string. [val = ${typeof val}]`);
    }
    store.dispatch('setAudioLocation', { audioLocation: val });
  }
  /**
   * Returns the caption file location path from the store.
   * @readonly
   * @memberof CaptionInfo
   */
  get captionLocation() { return store.state.captionInfo.captionLocation; }
  /**
   * Sets the value of the caption file location in the store.
   * @memberof CaptionInfo
   */
  set captionLocation(val) {
    if (typeof val !== 'string') {
      throw new Error(`[CaptionInfo] Caption file location must be a string. [val = ${typeof val}]`);
    }
    store.dispatch('setCaptionLocation', { captionLocation: val });
  }
  /**
   * Returns whether or not there are unsaved changes in caption studio
   * @readonly
   * @memberof CaptionInfo
   */
  get isUnsavedChanges() { return store.state.captionInfo.isUnsavedChanges; }
  /**
   * Sets the value of isUnsavedChanges
   * @memberof CaptionInfo
   */
  set isUnsavedChanges(val) {
    if (typeof val !== 'boolean') {
      throw new Error(`[CaptionInfo] Caption file location must be a boolean. [val = ${typeof val}]`);
    }
    store.dispatch('setIsUnsavedChanges', { isUnsavedChanges: val });
  }
}

/**
 * Singleton proxy for accessing project info from the store.
 */
export const captionInfo = new CaptionInfo();