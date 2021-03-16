<template>
  <v-list>
    <v-list-group class="directory" :value="true" prepend-icon="folder">
      <v-list-item slot="activator" class="directory__dir-name">
        <v-list-item-content>
          <v-list-item-title class="directory__name font-semi-bold font-16">{{ name }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item-content v-for="(value, index) in files" :key="index">
        <label class="directory__file">
          <v-icon class="directory__icon" :class="{'--active': value.active}">audiotrack</v-icon>
          <input
            :id="`${index}_${value.file.name}`"
            class="directory__select"
            type="radio"
            name="selectedFile"
            :value="value.file"
            :checked="value.active"
            @change="emit"
          />
          <label
            :for="`${index}_${value.file.name}`"
            class="font-16 directory__label"
          >{{ value.file.name }}</label>
          <v-icon v-show="filesWithCaptions[value.file.name]" class="directory__icon">done</v-icon>
        </label>
      </v-list-item-content>
      <FileDirectory
        v-for="(value, key) in directory.dir"
        :key="key"
        class="directory__nested"
        :directory="value"
        :name="key"
        :sub="true"
        :active="active"
      />
    </v-list-group>
  </v-list>
</template>

<script>
import { EventBus } from '@/renderer/class/EventBus';
export default {
  name: 'FileDirectory',
  props: {
    directory: {
      type: Object,
      required: true
    },
    name: {
      type: String,
      default: ''
    },
    active: {
      type: Object,
      default: null
    },
    sub: {
      type: Boolean,
      default: false
    }
  },
  /**
   * Data object
   */
  data() {
    return {
      hasActive: false,
      origin: 'FileDirectory',
      filesWithCaptions: {}
    };
  },
  computed: {
    /**
     * maps the files in a directory to make iterating easier, also sets the active state if necessary
     * @return Object[]
     */
    files() {
      return this.directory.files.map((file) => {
        return {
          active: this.active?.name === file.name,
          file
        };
      });
    }
  },
  watch: {
    /**
     * watch method for the active file
     */
    directory() {
      if (this.hasActive) {
        this.directory.selectByFile(this.active);
      }
    }
  },
  /**
   * Mounted lifecycle hook
   */
  mounted() {
    EventBus.$on('next_file', this.nextFile);
    EventBus.$on('previous_file', this.previousFile);
    EventBus.$on('file_captioned', this.onFileCaptionChange);
    EventBus.$on('json_file_selected', this.jsonEmit);
  },
  /**
   * destroyed lifecycle hook
   */
  destroyed() {
    EventBus.$off('next_file', this.nextFile);
    EventBus.$off('previous_file', this.previousFile);
    EventBus.$off('file_captioned', this.onFileCaptionChange);
    EventBus.$off('json_file_selected', this.jsonEmit);
    console.log('destroyed!');
  },
  methods: {
    /**
     * Event handler for next_file event. Selects the next file in the directory
     */
    nextFile() {
      if (this.hasActive) {
        EventBus.$emit('file_selected', { file: this.directory.nextFile() }, this.origin);
      }
    },
    /**
     * Event handler for previous_file event. Selects the previous file in the directory
     */
    previousFile() {
      if (this.hasActive) {
        EventBus.$emit('file_selected', {
          file: this.directory.previousFile()
        }, this.origin);
      }
    },
    /**
     * Emits the currently active file when a new file is selected
     */
    emit($event) {
      this.hasActive = $event.target.checked;
      if (this.hasActive) {
        EventBus.$emit('file_selected', {
          file: this.directory.selectByFile($event.target._value)
        }, this.origin);
      }
    },
    /**
     * Sets the new active file whenever the active file is changed via the JSON preview
     */
    jsonEmit($event) {
      const newFile = this.directory.selectByFile($event);
      if (!newFile) {
        return;
      }
      EventBus.$emit('file_selected', {
        file: newFile
      }, this.origin);
    },
    /**
     * Handler for when a caption is set for a file.
     */
    onFileCaptionChange($event) {
      this.$set(this.filesWithCaptions, $event.name, $event.isCaptioned);
    }
  }
};
</script>

<style lang="scss" scoped>
@import '~@/renderer/scss/fonts';
@import '~@/renderer/scss/colors';
.directory {
  $this: &;

  &__name {
    color: $secondary;
  }

  &__icon {
    padding-right: 1.7rem;

    &.--active {
      color: $secondary;
    }
  }

  &__file {
    align-items: center;
    color: $secondary;
    display: flex;
    height: 3.2rem;

    padding-left: 1.5rem;
  }

  &__nested {
    padding-left: 1rem;
  }

  &__select {
    display: flex;
    align-items: center;
    position: absolute;
    width: 100%;
    height: 100%;
    height: 3.2rem;
    opacity: 0;

    &:checked + #{$this}__label::before {
      position: absolute;
      content: ' ';
      z-index: 0;
      left: -10rem;
      right: -10rem;
      height: 3.2rem;
      background-color: rgba(153, 153, 153, 0.2);
    }
  }

  &__label {
    @extend .font-14;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 100%;
  }
}

.v-list__tile {
  padding: 0 0.5rem !important;
}

.v-list,
.theme--light .v-list,
.application
  .theme--light.v-list
  .theme--light
  .v-list
  .v-list__group--active:before,
.application .theme--light.v-list .v-list__group--active:before,
.theme--light .v-list .v-list__group--active:after,
.application .theme--light.v-list .v-list__group--active:after {
  background: transparent !important;
  color: $black !important;
}

.theme--light .v-list .v-list__group--active:before,
.application .theme--light.v-list .v-list__group--active:before,
.theme--light .v-list .v-list__group--active:after,
.application .theme--light.v-list .v-list__group--active:after {
  background: transparent !important;
}
</style>


