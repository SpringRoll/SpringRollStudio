<template>
  <div class="explorer">
    <v-btn id="btnHome" color="white" class="btn btn-controls" icon @click="onHomeClick()"><v-icon class="controls-icon">home</v-icon></v-btn>
    <v-text-field
      class="explorer__search"
      prepend-inner-icon="search"
      placeholder="Search file names"
      solo
      @input="filter"
    />
    <h3 class="font-28 font-semi-bold explorer__header">Files</h3>
    <div class="explorer__dir">
      <FileDirectory
        v-for="(value, key) in directory.dir"
        :key="key"
        :directory="value"
        :name="key"
        :active="active"
      />
    </div>
    <!-- <div color="accent" class="v-btn accent explorer__input --file font-semi-bold font-16">
      <span>Import Files</span>
      <input class="explorer__file-input" type="file" webkitdirectory="" multiple="multiple" @change="loadFiles" />
    </div>
    <v-dialog v-model="dialog" width="500">
      Loading files
    </v-dialog> -->
  </div>
</template>

<script>
import FileProcessor from '@/renderer/class/FileProcessor';
import FileDirectory from '@/renderer/components/FileDirectory';
import { EventBus } from '@/renderer/class/EventBus';
import { mapState } from 'vuex';
const fs = require('fs');


export default {
  components: {
    FileDirectory
  },
  /**
   *
   */
  data() {
    return {
      directory: FileProcessor.getDirectory(),
      rawFiles: null,
      active: null,
      dialog: false,
    };
  },
  computed: {
    ...mapState({

      /**
       * Returns the path for the current project audio files
       */
      audioLocation: function(state) {
        return state.captionInfo.audioLocation;
      }
    })
  },
  /**
   *
   */
  async mounted() {
    EventBus.$on('caption_changed', this.setActive);
    //console.log(this.audioLocation);
    //console.log(this.$store.state.projectInfo.location);
    //console.log(fs.readdirSync(this.audioLocation, {withFileTypes: true}));
    //this.loadFiles(fs.readdirSync(this.audioLocation));
    //this.directory = FileProcessor.generateDirectories();
    this.directory = await FileProcessor.generateDirectories();
  },
  /**
   *
   */
  destroyed() {
    EventBus.$off('caption_changed', this.setActive);
  },
  methods: {
    /**
     * Handler for clicking the home button.
     */
    onHomeClick: function() {
      this.$router.push({ path: '/' });
    },
    /**
     *
     */
    filter($event) {
      FileProcessor.setNameFilter($event);
      this.directory = FileProcessor.generateDirectories(this.rawFiles);
    },
    /**
     *
     */
    setActive($event) {
      if (null !== $event.file) {
        this.active = $event.file;
      }
    }
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
        border-left: 1px solid rgba(0,0,0,.6);
        vertical-align: baseline;
        position: absolute;
        top: 0;
        left: 0;

        &.--toggle {
          width: 10%;
          border-left: 1px solid rgba(0,0,0,.1);

          &.--disabled {
            display: none;
          }
        }
      }
    }
}
</style>


