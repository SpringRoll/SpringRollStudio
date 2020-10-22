<template>
  <div class="caption__studio" :class="{'--explorerHidden': explorerHidden}">
    <v-icon @click="() => explorerHidden = !explorerHidden" class="caption__hide-sidebar">{{ explorerHidden ? 'arrow_forward_ios' : 'arrow_back_ios' }}</v-icon>
    <FileExplorer :class="{'--explorerHidden': explorerHidden}"/>
    <div class="caption__container" :class="{'--disabled': !enabled}">
      <div class="caption__element">
        <label class="caption__label" for="c-sound">Sound Preview</label>
        <WaveSurfer id="c-sound" class="caption__component" />
      </div>
      <div class="caption__element">
        <label class="caption__label" for="c-preview">Text Preview</label>
        <CaptionPreview id="c-preview" class="caption__component" />
      </div>
      <div class="caption__element-wrapper">
        <div class="caption__element">
          <label class="caption__label" for="c-edtior">Text Editor</label>
          <TextEditor id="c-editor" class="caption__component" />
        </div>
        <div class="caption__element">
          <label class="caption__label" for="c-code">JSON Preview</label>
          <JsonPreview id="c-code" class="caption__component" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { EventBus } from '@/renderer/class/EventBus';

import FileExplorer from '@/renderer/components/FileExplorer';
import WaveSurfer from '@/renderer/components/WaveSurfer';
import TextEditor from '@/renderer/components/TextEditor';
import JsonPreview from '@/renderer/components/JsonPreview';
import CaptionPreview from '@/renderer/components/CaptionPreview';
import FileProcessor from '@/renderer/class/FileProcessor';

export default {
  components: {
    FileExplorer,
    WaveSurfer,
    TextEditor,
    JsonPreview,
    CaptionPreview
  },
  /**
   *
   */
  data() {
    return {
      enabled: FileProcessor.hasFiles,
      explorerHidden: false,
    };
  },
  /**
   *
   */
  mounted() {
    EventBus.$on('file_selected', this.isEnabled);
    EventBus.$on('caption_reset', () => (this.enabled = false));

    if (this.enabled) {
      EventBus.$emit('caption_emit');
    }
  },
  /**
   *
   */
  destroyed() {
    EventBus.$off('file_selected', this.isEnabled);
    EventBus.$off('caption_reset', () => (this.enabled = false));
  },
  methods: {
    /**
     *
     */
    isEnabled($event) {
      this.enabled = $event.file instanceof File;
    },
  },
};
</script>

<style lang="scss">
@import '~@/renderer/scss/colors';
.caption {
  &__studio {
    display: flex;

    &.--explorerHidden {
      .caption__container {
        padding: 3.75rem 3rem 0 3rem;
      }
      .caption__hide-sidebar {
        left: 0;

        &:hover {
          left: 0.5rem;
        }
      }
    }
  }

  &__hide-sidebar {
    position: fixed !important;
    top: 50%;
    left: 26.5rem;
    transition: left 0.4s !important;
    z-index: 3;

    &:hover {
      left: 26rem;
    }
  }

  &__container {
    padding: 3.75rem 3rem 0 32rem;
    width: 100%;
    transition: padding 0.5s;

    &.--disabled {
      pointer-events: none;
      opacity: 0.4;
    }
  }

  &__element-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    margin-bottom: 5rem;

    .caption__element {
      margin: 2.3rem 1rem 0;
    }
  }

  &__element {
    margin-top: 2.3rem;
    flex: 1 1 50rem;
  }

  &__label {
    color: $light-label;
    padding-bottom: 4rem;
  }

  &__component {
    margin-top: 0.8rem;
  }
}
</style>


