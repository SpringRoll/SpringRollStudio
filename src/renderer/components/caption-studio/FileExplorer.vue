<template>
  <div class="explorer">
    <v-btn v-show="!isUnsavedChanges" id="btnHome" color="white" class="btn btn-controls" icon @click="onHomeClick">
      <v-icon class="controls-icon">home</v-icon>
    </v-btn>
    <v-dialog v-model="dialog" width="500">
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-show="isUnsavedChanges" id="btnHome" color="white" class="btn btn-controls" icon v-bind="attrs" v-on="on">
          <v-icon class="controls-icon">home</v-icon>
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="headline grey lighten-2">
          Save Changes
        </v-card-title>
        <v-card-text></v-card-text>
        <v-card-text class="font-16">
          You have unsaved changes. Would you like to save?
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" class="font-16 text-capitalize" @click="() => {
            onSaveClick();
            onHomeClick();
          }"
          >
            Save
          </v-btn>
          <v-btn class="font-16 text-capitalize" @click="onHomeClick()">
            Don't Save
          </v-btn>
          <v-btn class="font-16 text-capitalize" @click="dialog = false">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-text-field class="explorer__search" prepend-inner-icon="search" placeholder="Search file names" solo @input="filter" />
    <h3 class="font-28 font-semi-bold explorer__header">Files</h3>
    <div class="explorer__dir">
      <FileDirectory v-for="(value, key) in directory.dir" :key="key" :directory="value" :name="key" :active="active" />
    </div>
    <v-btn class="v-btn accent explorer__input --file font-semi-bold font-16" :loading="loadingFiles" @click="sendEvent('openDialog', 'audioLocationSetter')">
      Change Audio Directory
    </v-btn>
  </div>
</template>

<script>
import FileProcessor from '@/renderer/class/FileProcessor';
import FileDirectory from '@/renderer/components/caption-studio/FileDirectory';
import {
  EventBus
} from '@/renderer/class/EventBus';
import {
  mapState
} from 'vuex';
import {
  ipcRenderer
} from 'electron';
import {
  EVENTS
} from '@/constants';

export default {
  components: {
    FileDirectory
  },
  /**
   * Data object
   */
  data() {
    return {
      directory: FileProcessor.getDirectory(),
      active: null,
      dialog: false,
      loadingFiles: false,
    };
  },
  computed: {
    ...mapState({

      /**
       * Returns the path for the current project audio files
       */
      audioLocation: function (state) {
        return state.captionInfo.audioLocation;
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
   * mounted life cycle hook
   */
  async mounted() {
    EventBus.$on('caption_changed', this.setActive);
    ipcRenderer.on(EVENTS.UPDATE_AUDIO_LOCATION, this.onAudioLocationUpdate);
    this.loadingFiles = true;
    this.directory = await FileProcessor.generateDirectories();
    this.loadingFiles = false;
  },
  /**
   * destroyed life cycle hook
   */
  destroyed() {
    EventBus.$off('caption_changed', this.setActive);
    ipcRenderer.removeListener(EVENTS.UPDATE_AUDIO_LOCATION, this.onAudioLocationUpdate);
    FileProcessor.clear();
  },
  methods: {
    /**
     * Button click handler that will send and event through the ipcRenderer.
     */
    sendEvent: function (event, ...args) {
      ipcRenderer.send.apply(ipcRenderer, [event].concat(args));
    },
    /**
     * Sends message internally through renderer
     */
    onSaveClick() {
      EventBus.$emit(EVENTS.SAVE_CAPTION_DATA);
    },
    /**
     * Event handler for the project audio file directory changing. Re-builds the directory list with new direction location
     */
    onAudioLocationUpdate: async function () {
      this.loadingFiles = true;
      this.directory = await FileProcessor.generateDirectories();
      this.loadingFiles = false;
    },
    /**
     * Handler for clicking the home button.
     */
    onHomeClick: function () {
      this.dialog = false;

      ipcRenderer.send('captionStudio', false);
      this.$router.push({
        path: '/'
      });
    },
    /**
     * Handler for the filter input field
     * @param {Object} $event event object
     */
    filter($event) {
      FileProcessor.setNameFilter($event);
      this.directory = FileProcessor.generateDirectories();
    },
    /**
     * Sets the currently selected file
     * @param {Object} $event event object
     */
    setActive($event) {
      if (null !== $event.file) {
        this.active = $event.file;
      }
    },
  }
};
</script>

<style lang="scss">
@import '~@/renderer/scss/colors';

.explorer {
  width: 28.2rem;
  min-width: 28.2rem;
  background-color: $white-background;
  padding: 4.5rem 0 0;
  position: fixed;
  //height: calc(100vh - 5.7rem);
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  transition: transform 0.5s;

  .v-list-item__content {
    padding: 0;
  }

  &.--explorerHidden {
    transform: translateX(-100%);
  }

  &__input {
    width: 24.2rem;
    height: 3.6rem;
    text-transform: capitalize;
    position: relative;
    margin: 3rem 0 !important;
    flex: end;

    &.--directory {
      margin: 3rem 0 1rem 0 !important;
    }

    &.--file {
      margin: 0 0 3rem 0 !important;
    }

    &.--dialog {
      width: 15.8rem;
      height: 3.6rem;
      margin: 0 0 3rem 1rem !important;
    }
  }

  &__header {
    align-self: flex-start;
    padding-left: 4.2rem;
    margin-bottom: 0.8rem;
    color: $secondary;
  }

  &__search {
    width: 23.4rem;
    margin-bottom: 1.9rem !important;
    max-height: 5.5rem;
    min-height: 5.5rem;
  }

  &__dir {
    overflow: auto;
    flex-grow: 1;
    position: relative;
    width: 100%;
  }

  &__file-input {
    width: 100%;
    height: 100%;
    position: absolute;
    opacity: 0;
  }

  .btn {
    cursor: pointer;
    background-color: #337ab7;
    color: white;
    outline: 0;
    border: 0;
    border-radius: 0;
    padding: 0;
    text-transform: none;
    letter-spacing: normal;

    &:hover {
      background-color: #286090;
    }

    &.btn-controls {
      height: 4rem;
      width: 4rem;
      border-left: 1px solid rgba(0, 0, 0, .6);
      vertical-align: baseline;
      position: absolute;
      top: 0;
      left: 0;

      &.--toggle {
        width: 10%;
        border-left: 1px solid rgba(0, 0, 0, .1);

        &.--disabled {
          display: none;
        }
      }
    }
  }
}
</style>
