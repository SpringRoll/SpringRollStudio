import { EventBus } from './EventBus';
import store from '../store';

/**
 * Class that controls the creation, and management, of captions in the CaptionStudio Component.
 * Acts as the state for the caption data. When a component updates a caption, changes the active caption, deletes a caption, changes files, etc. That
 * choice is emitted to this class, which then emits an event to inform all affected components.
 */
class CaptionManager {
  /**
   *
   */
  constructor() {
    this.data = {}; //All caption data, organized by file name.
    this.activeCaption = undefined; //currently active caption name, created by stripping the file extension of the active file.
    this.activeIndex = 0; //the index of the currently active caption.
    this.file = {}; //Currently active file, selected in the FileDirectory component
    this.currentTime = 0; //current time of the waveform component
    EventBus.$on('caption_update', this.updateActiveCaption.bind(this));
    EventBus.$on('caption_reset', this.reset.bind(this));
    EventBus.$on('caption_add', this.addCaption.bind(this));
    EventBus.$on('caption_add_index', this.addIndex.bind(this));
    EventBus.$on('caption_get', this.emitData.bind(this));
    EventBus.$on('file_selected', this.fileChanged.bind(this));
    EventBus.$on('caption_move_index', this.moveIndex.bind(this));
    EventBus.$on('caption_remove_index', this.removeAtIndex.bind(this));
    EventBus.$on('caption_emit', this.emit.bind(this));
    EventBus.$on('time_current', (e) => this.currentTime = e.time || 0);
    EventBus.$on('json_update', this.onJSONUpdate.bind(this));
  }

  /**
   *
   * @param Object $event the object containing all data emitted by the origin
   * @param String $origin String that contains the component origin. Used on some components to filter out their own updates.
   *
   * Function called when the user selects a new file in the FileDirectory. If no caption exits
   * for that file, it creates a new Caption.
   */
  fileChanged($event, $origin = '') {
    if (!$event.file) {
      return;
    }
    const name = $event.file.name.replace(/.(ogg|mp3|mpeg)$/, '').trim();
    if (!name || name === this.activeCaption) {
      return;
    }

    this.file = $event.file;

    if (!Array.isArray(this.data[name])) {
      this.addCaption(name, $origin);
    } else {
      this.activeCaption = name;
      this.activeIndex = 0;
      this.emitCurrent($origin);
    }
    //used only when the JSON editor updates the selected file
    EventBus.$emit('selected_file_updated');
  }

  /**
   *
   * @param Object $event the object containing all data emitted by the origin
   * @param String $origin String that contains the component origin. Used on some components to filter out their own updates.
   *
   * Called when the JSON in the JsonPreview is edited directly. Since the Json editor only emits
   * the entire JSON structure this method iterates over the entire JSON object and updates every
   * Caption.
   */
  onJSONUpdate($event, $origin = '') {
    store.dispatch('setIsUnsavedChanges', { isUnsavedChanges: true });

    Object.keys($event).forEach((key) => {
      $event[key].forEach((caption, index) => {

        if (!this.data[key]) {
          this.data[key] = [this.template];
        }

        const current = this.data[key];

        this.data[key][index] = {
          content: caption.content || current.content,
          end: 'number' === typeof caption.end ? caption.end : current.end,
          start: 'number' === typeof caption.start ? caption.start : current.start,
        };
      });
    });

    if ($origin === 'userOpen') {
      return;
    }
    this.currentCaptionIndex.edited = true;
    this.emitCurrent($origin);
    this.emitData($origin);
  }
  /**
   *
   * @param String key string that represents the curent active caption
   * @param String $origin String that contains the component origin. Used on some components to filter out their own updates.
   *
   * Creates a new caption entry on the data object and updates the active caption and index to point
   * at this new caption.
   */
  addCaption(key = this.activeCaption, $origin = '') {
    if ('string' !== typeof key || !key) {
      return;
    }

    this.data[key] = [this.template];

    this.activeCaption = key;
    this.activeIndex = 0;

    this.emitCurrent($origin);
    this.emitData($origin);
  }

  /**
   * @param String $origin String that contains the component origin. Used on some components to filter out their own updates.
   *
   * Fired when the user hits the Add Caption Button in TextEditor. Moves the activeIndex forward,
   * and creates a new empty caption. Also "saves" the previously active caption in the data object.
   */
  addIndex($origin = '') {
    store.dispatch('setIsUnsavedChanges', { isUnsavedChanges: true });
    this.data[this.activeCaption].push(this.template);
    this.activeIndex++;
    EventBus.$emit('file_captioned', { name: this.file.name, isCaptioned: true });
    this.emitCurrent($origin);
    this.emitData($origin);
  }

  /**
   * @param String $origin String that contains the component origin. Used on some components to filter out their own updates.
   *
   * Called whenever the TextEditor component updates the content, or start/end times of the caption.
   * simply upates the currently active caption with whatever new data is provided.
   */
  updateActiveCaption({ content, start, end }, $origin = '') {
    store.dispatch('setIsUnsavedChanges', { isUnsavedChanges: true });
    const current = this.currentCaptionIndex;

    this.data[this.activeCaption][this.activeIndex] = {
      content: content || current.content,
      end: 'number' === typeof end ? end : current.end,
      start: 'number' === typeof start ? start : current.start,
      edited: true,
    };

    this.emitCurrent($origin);
  }

  /**
   * Removes all captions from the data object and resets the active caption back to it's initial state.
   */
  reset() {
    store.dispatch('setIsUnsavedChanges', { isUnsavedChanges: true });
    this.data = {};
    this.activeIndex = 0;
    this.activeCaption = '';
  }

  /**
   *
   * @param Number $event Represents how far to move the index that points at the active caption.
   * @param String $origin String that contains the component origin. Used on some components to filter out their own updates.
   *
   * Fired whenever a component needs to update the index that points to the active caption.
   */
  moveIndex( $event, $origin = '') {
    if ('number' === typeof $event) {
      const newIndex = this.activeIndex + $event;
      if (0 > newIndex) {
        this.activeIndex = 0;
      } else if (newIndex > this.lastIndex) {
        this.activeIndex = this.lastIndex;
      } else {
        this.activeIndex = newIndex;
      }
      this.emitCurrent($origin);
    }
  }

  /**
   *
   * @param Number $event the index of the caption to be removed
   * @param String $origin String that contains the component origin. Used on some components to filter out their own updates.
   *
   * Used to delete a single caption. Uses the index to look up which caption should be removed. Almost always will be the current caption.
   */
  removeAtIndex($origin = '') {
    store.dispatch('setIsUnsavedChanges', { isUnsavedChanges: true });
    if ('undefined' === typeof this.currentCaption[this.activeIndex]) {
      return;
    }

    this.currentCaption.splice(this.activeIndex, 1);

    if (0 < this.activeIndex) {
      this.activeIndex--;
    }
    EventBus.$emit('file_captioned', { name: this.file.name, isCaptioned: !!(this.currentCaption.length > 1) });

    this.emitCurrent($origin);
    this.emitData($origin);
  }

  /**
   * Emits the currently active caption data along with index, and file name information.
   * This is used to replicate caption updates, and a change of active caption across all components.
   */
  emitCurrent($origin = '') {
    EventBus.$emit('caption_changed', {
      data: this.currentCaptionIndex,
      file: this.file,
      index: this.activeIndex,
      lastIndex: this.lastIndex,
      name: this.activeCaption,
      time: this.currentTime,
    }, $origin);
  }

  /**
   * Emits the entirety of the current data object, which contains all caption files, and associated captions.
   */
  emitData( $origin = '' ) {
    EventBus.$emit('caption_data', this.data, $origin);
  }

  /**
   * Combines emitCurrent and emitData, as well as emitting the file_selected event.
   * Used for the mounted hook of the CaptionStudio
   */
  emit() {
    this.emitCurrent();
    this.emitData();
    EventBus.$emit('file_selected', { file: this.file });
  }
  /**
   *
   */
  get lastIndex() {
    return this.currentCaption?.length - 1 || 0;
  }

  /**
   *
   */
  get currentCaption() {
    return this.data[this.activeCaption];
  }

  /**
   *
   */
  get currentCaptionIndex() {
    if (this.data[this.activeCaption]) {
      return this.data[this.activeCaption][this.activeIndex];
    }
  }

  /**
   *
   */
  set currentCaption(newArray) {
    if (Array.isArray(newArray)) {
      this.data[this.activeCaption] = newArray;
    }
  }

  /**
   *
   */
  get template() {
    return {
      start: 0,
      end: 0,
      content: ' ',
      edited: false
    };
  }
}

export default new CaptionManager();