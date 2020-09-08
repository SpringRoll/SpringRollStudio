import store from '../../../renderer/store';

/**
 *
 * @class GamePreview
 */
class GamePreview {
  /**
   *
   * @readonly
   * @memberof GamePreview
   */
  get previewTarget() { return store.state.gamePreview.previewTarget; }
  /**
   *
   * @memberof GamePreview
   */
  set previewTarget(val) {
    if (typeof val !== 'string') {
      throw new Error(`[GamePreview] Preview target must be a string. [val = ${typeof val}]`);
    }
    store.dispatch('setPreviewTarget', { previewTarget: val });
  }

  /**
   *
   * @memberof GamePreview
   */
  get previewURL() { return store.state.gamePreview.previewURL; }
  /**
   *
   * @memberof GamePreview
   */
  set previewURL(val) {
    if (typeof val !== 'string') {
      throw new Error(`[GamePreview] Preview URL must be a string. [val = ${typeof val}]`);
    }
    store.dispatch('setPreviewURL', { previewURL: val });
  }
}

/**
 * 
 */
export const gamePreview = new GamePreview();