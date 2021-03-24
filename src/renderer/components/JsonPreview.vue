<template>
  <div class="json">
    <v-jsoneditor ref="jsonEditor" class="json__editor" :options="options" :plus="false" height="446px" />
    <div class="json__button-group">
      <v-dialog v-model="saveErrorDialog" width="500">
        <v-card>
          <v-card-title class="error" primary-title>
            <h2 class="font-semi-bold json__dialog-title">Warning</h2>
          </v-card-title>
          <v-card-text>
            <span class="font-16">There are errors in the caption JSON. It is recommended you correct those before saving, otherwise your changes to those specific captions will not be saved.</span>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="accent" class="font-semi-bold font-16 --capital" @click="saveErrorDialog = false">
              Cancel
            </v-btn>
            <v-btn color="error" class="font-semi-bold font-16 --capital" @click="onSave(null, null, true)">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="dialog" width="500">
        <template v-slot:activator="{on}">
          <v-btn color="error" class="font-semi-bold font-16 --capital json__button-cancel" v-on="on">
            Clear
          </v-btn>
        </template>
        <v-card>
          <v-card-title class="error" primary-title>
            <h2 class="font-semi-bold json__dialog-title">Warning</h2>
          </v-card-title>
          <v-card-text>
            <span class="font-16">This will clear all captions.</span>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="accent" class="font-semi-bold font-16 --capital" @click="dialog = false">
              Cancel
            </v-btn>
            <v-btn color="error" class="font-semi-bold font-16 --capital" @click="reset">Ok</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-btn download="export.json" target="_blank" :href="blob" color="accent" class="font-semi-bold font-16 --capital json__button-export" :disabled="Object.keys(jsonErrors).length > 0">
        Export Code
      </v-btn>
    </div>
    <ul v-for="(file, index) in jsonErrors" :key="index" class="json__errors">
      <li v-for="(error, LiIndex) in file" :key="LiIndex">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script>
import { EventBus } from '@/renderer/class/EventBus';
import VJsoneditor from 'v-jsoneditor';
import { ipcRenderer, path } from 'electron';
import { mapState } from 'vuex';
import { EVENTS } from '../../contents';

const fs = require('fs');

export default {
  components: {
    VJsoneditor
  },
  /**
   *
   */
  data() {
    const data = {};
    const json = JSON.stringify(data);
    return {
      json,
      data,
      blob: null,
      dialog: false,
      saveErrorDialog: false,
      jsonErrors: false,
      currentIndex: 0,
      origin: 'JsonPreview',
      activeFile: '',
      fileNameMap: {},
      options: {
        onChangeJSON: this.onEdit,
        mode: 'form',
        onEvent: this.onEvent
      },
    };
  },
  computed: {
    ...mapState({

      /**
       * Returns the path for the current project audio files
       */
      captionLocation: function (state) {
        return state.captionInfo.captionLocation;
      },
      /**
       * returns whether or not there are unsaved caption changes
       */
      isUnsavedChanges: function (state) {
        return state.captionInfo.isUnsavedChanges;
      }
    })
  },
  /**
   *
   */
  mounted() {
    this.createBlob();
    EventBus.$on('caption_update', this.onUpdate);
    EventBus.$on('caption_changed', this.onCaptionChange);
    EventBus.$on('caption_data', this.update);
    EventBus.$on('file_list_generated', this.createFileNameMap);
    EventBus.$on(EVENTS.SAVE_CAPTION_DATA, this.onSave);
    ipcRenderer.on(EVENTS.SAVE_CAPTION_DATA, this.onSave);
    ipcRenderer.on(EVENTS.CLEAR_CAPTION_DATA, this.onMenuClear);
    ipcRenderer.on(EVENTS.OPEN_CAPTION_FILE, this.onCaptionFileOpen);

    //If a caption file has been previously saved/opened load it in on caption studio start up
    if (this.captionLocation) {
      this.onCaptionFileOpen(null, this.captionLocation);
    }
  },
  /**
   *
   */
  destroyed() {
    EventBus.$off('caption_update', this.onUpdate);
    EventBus.$off('caption_data', this.update);
    EventBus.$off('caption_changed', this.onCaptionChange);
    ipcRenderer.removeListener(EVENTS.SAVE_CAPTION_DATA, this.onSave);
    ipcRenderer.removeListener(EVENTS.CLEAR_CAPTION_DATA, this.onMenuClear);
    ipcRenderer.removeListener(EVENTS.OPEN_CAPTION_FILE, this.onCaptionFileOpen);
    this.json = '';
  },
  methods: {
    /**
     *
     */
    onEdit($event) {
      this.checkErrors($event, this.origin);
      if (this.jsonErrors) {
        console.log('errors?', this.jsonErrors);
        return;
      }
      EventBus.$emit('json_update', $event, this.origin);
    },
    /**
     * Handles the save caption event from app menu or keyboard shortcut
     */
    onSave(event, filePath, force = false) {

      if (!filePath) {
        filePath = this.captionLocation;
      }

      if (this.jsonErrors && !force) {
        this.saveErrorDialog = true;
        return;
      }
      this.saveErrorDialog = false;

      fs.writeFile(filePath, this.json, err => {
        if (err) {
          throw err;
        }
        this.$store.dispatch('setIsUnsavedChanges', { isUnsavedChanges: false });
        console.log('JSON data is saved.');
      });
    },
    /**
     * Handles opening/loading the user provided caption file
     */
    onCaptionFileOpen(event, filePath) {
      fs.readFile(filePath, 'utf-8', (err, data) => {
        this.update(JSON.parse(data.toString()), 'userOpen');
      });
    },
    /**
     * Handles the clear event sent from the app menu
     */
    onMenuClear() {
      this.dialog = true;
    },
    /**
     *
     */
    onUpdate(data, $origin) {
      //Pass the origin of the original component on through in this call, since that is the origin that matters
      EventBus.$emit('caption_get', $origin);
    },
    /**
     *
     */
    onEvent(node, event) {
      if (event.type !== 'focus') {
        return;
      }

      const file = this.fileNameMap[node.path[0]];
      const index = node.path[1];
      const indexDelta = index - this.currentIndex;

      if (this.activeFile === node.path[0]) {
        EventBus.$emit('caption_move_index', indexDelta, this.origin);
        return;
      }

      EventBus.$emit('json_file_selected', file);

      EventBus.$once('selected_file_updated', () => {
        if (indexDelta !== 0) {
          EventBus.$emit('caption_move_index', indexDelta, this.origin);
        }
      });

    },
    /**
     *
     */
    onCaptionChange({
      index,
      file,
      name
    }) {
      this.activeFile = name;
      this.fileNameMap[name] = file;
      this.currentIndex = index;
    },
    /**
     *
     */
    update(data, $origin) {
      this.checkErrors(data, $origin);

      this.data = this.cleanData(data);
      this.$refs.jsonEditor.editor.update(this.data);
      this.json = JSON.stringify(this.data, null, 2);
      this.createBlob();

      if ($origin === 'userOpen') {
        this.checkErrors(JSON.parse(this.json), this.origin);
        EventBus.$emit('json_update', JSON.parse(this.json), $origin);
      }

    },
    /**
     *
     */
    createFileNameMap($event) {
      if (!Array.isArray($event)) {
        return;
      }

      $event.forEach(file => {
        this.fileNameMap[file.name.replace(/.(ogg|mp3|mpeg)$/, '').trim()] = file;
      });
    },
    /**
     *
     */
    cleanData(data) {
      const key = Object.keys(data);
      const output = {};
      for (let i = 0, l = key.length; i < l; i++) {
        if (!Array.isArray(data[key[i]])) {
          continue;
        }

        const reduced = data[key[i]].reduce((filtered, e) => {
          if ((e.content && e.start < e.end)) {
            if (e.content.trim()) {
              filtered.push({
                content: e.content.replace(/\n$/, ''),
                start: e.start,
                end: e.end
              });
            }
          }
          return filtered;
        }, []);

        if (reduced.length) {
          output[key[i]] = reduced;
        }
      }
      return output;
    },
    /**
     *
     */
    createBlob() {
      this.blob = URL.createObjectURL(
        new Blob([JSON.stringify(this.data)], {
          type: 'application/json'
        })
      );
    },
    /**
     *
     */
    reset() {
      EventBus.$emit('caption_reset');
      this.dialog = false;
      this.update({});
    },
    /**
     * Ensure that each caption line has a value, and has proper time values
     */
    validateJSON(json, $origin) {
      const errors = {};
      Object.keys(json).forEach(key => {
        errors[key] = [];
        const file = json[key];
        file.forEach((caption, index) => {
          if (caption.edited || $origin === this.origin) {
            if (!caption.content || !caption.content.trim()) {
              errors[key].push(`Error at caption [${key}], index [${index}]: Caption content must be non-empty`);
            }
            if ('number' !== typeof caption.start || caption.start < 0) {
              errors[key].push(`Error at caption [${key}], index [${index}]: Caption start must have a positive number value`);
            }
            if ('number' !== typeof caption.end || caption.end < 0) {
              errors[key].push(`Error at caption [${key}], index [${index}]: Caption end must have a positive number value`);
            }
            if (caption.start >= caption.end) {
              errors[key].push(`Error at caption [${key}], index [${index}]: Caption start must be less than the caption end`);
            }
          }
        });

        if (errors[key].length <= 0) {
          delete errors[key];
        }
      });

      return errors;
    },
    /**
     *
     */
    checkErrors(data, $origin) {
      this.jsonErrors = false;
      const errors = this.validateJSON(data, $origin);
      if (Object.keys(errors).length > 0) {
        this.jsonErrors = errors;
      }

      EventBus.$emit('json_errors', this.jsonErrors);
    }
  },
};
</script>

<style lang="scss">
@import '~@/renderer/scss/colors';
@import '~@/renderer/scss/sizes';

$menu-height: 5.6rem;

.json {
  display: flex;
  flex-direction: column;

  &__editor {
    width: 100%;
  }

  .jsoneditor-menu {
    background-color: $accent;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    height: $menu-height;
    padding: 1.5rem;
  }

  .jsoneditor-search {
    margin: 1rem;
  }

  .jsoneditor {
    border: none;

    &-outer.has-main-menu-bar {
      margin-top: 0;
      padding-top: 0;
      height: 100%;
    }
  }

  .jsoneditor-tree {
    background-color: $white-background;
  }

  &__errors {
    position: relative;
    top: 2.25rem;
    color: red;
  }

  &__button {

    &-cancel,
    &-export {
      margin: 0 !important;
    }

    &-cancel {
      border-radius: 0px 0px 0px 10px / 0px 0px 0px 10px !important;
      width: 100%;
    }

    &-export {
      border-radius: 0px 0px 10px 0px !important;
    }

    &-group {
      display: flex;
      width: 100%;
      min-height: 3.6rem;
      align-items: center;
      border-radius: 2rem;

      &>* {
        width: 50%;
      }
    }
  }

  &__dialog-title {
    color: $white;
  }
}
</style>
