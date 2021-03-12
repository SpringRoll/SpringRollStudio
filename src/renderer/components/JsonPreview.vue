<template>
  <div class="json">
    <v-jsoneditor ref="jsonEditor" class="json__editor" :options="options" :plus="false" height="400px" />
    <div class="json__button-group">
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
    ipcRenderer.off(EVENTS.SAVE_CAPTION_DATA, this.onSave);
    ipcRenderer.off(EVENTS.CLEAR_CAPTION_DATA, this.onMenuClear);
    ipcRenderer.off(EVENTS.OPEN_CAPTION_FILE, this.onCaptionFileOpen);
  },
  methods: {
    /**
     *
     */
    onEdit($event) {
      this.checkErrors($event, this.origin);
      EventBus.$emit('json_update', $event, this.origin);
    },
    /**
     * Handles the save caption event from app menu or keyboard shortcut
     */
    onSave(event, filePath) {
      if (!filePath) {
        filePath = this.captionLocation;
      }
      fs.writeFile(filePath, this.json, err => {
        if (err) {
          throw err;
        }
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

      if ($origin === this.origin) {
        return;
      }

      this.data = this.cleanData(data);
      this.$refs.jsonEditor.editor.update(this.data);
      this.json = JSON.stringify(this.data, null, 2);
      this.createBlob();
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
     *
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
      height: calc(100% - #{$menu-height});
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
