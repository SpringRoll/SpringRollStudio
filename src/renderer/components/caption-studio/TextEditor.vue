<template>
  <div class="editor">
    <quill-editor
      id="quill-editor"
      ref="Quill"
      class="editor__quill"
    >
      <div id="toolbar" slot="toolbar">
        <span class="toolbar__wrapper">
          <span class="toolbar__group">
            <select class="ql-font">
              <option selected="selected"></option>
              <option value="serif"></option>
              <option value="monospace"></option>
            </select>
            <select class="ql-size">
              <option
                v-for="size in sizeOptions"
                :key="size.value"
                :value="size.value"
                :selected="size.default"
              >{{ size.label }}</option>
            </select>
            <select class="ql-color">
              <option
                v-for="color in colorOptions"
                :key="color.value"
                :value="color.value"
                :selected="color.default"
              />
            </select>
            <button class="ql-bold">Bold</button>
            <button class="editor__escape-button" @click="escapeString">
              <span v-pre>&#123;&#123; &#125;&#125;</span>
            </button>
          </span>
          <span class="toolbar__group --col">
            <span class="editor__character-count"><span :class="{'yellow--text text--darken-4': characterCount > 40}">{{ characterCount }}</span> / 40</span>
          </span>
        </span>
      </div>
    </quill-editor>
    <div class="editor__controls">
      <div class="editor__controls-error">
        <span v-show="characterCount > 40" class="editor__character-count font-14"><v-icon>warning</v-icon> It is recommended that caption lines are 40 characters or less</span>
        <span v-show="lineCount > 1" class="editor__character-count font-14"><v-icon>warning</v-icon> It is recommended that individual captions be no longer 2 lines</span>
      </div>
      <div class="editor__controls-group">
        <TimeStampInput :default="start" name="start" @time="onStartTimeUpdated" />
        <TimeStampInput :default="end" name="end" @time="onEndTimeUpdated" />
      </div>
    </div>
    <v-btn
      v-if="canRemove"
      :block="true"
      color="accent"
      class="editor__button font-16 font-semi-bold capitalize"
      @click="removeCaption"
    >
      Remove Caption
    </v-btn>
    <v-btn
      v-else
      :disabled="!canAdd"
      :block="true"
      color="accent"
      class="editor__button font-16 font-semi-bold capitalize"
      @click="addCaption"
    >
      Add Caption
    </v-btn>
  </div>
</template>

<script>
import TimeStampInput from './TimeStampInput';
import { EventBus } from '@/renderer/class/EventBus';
export default {
  components: {
    TimeStampInput
  },
  /**
   *
   */
  data() {
    return {
      index: 0,
      content: '',
      fileName: '',
      start: 0,
      end: 0,
      edited: false,
      lastIndex: 0,
      canEmit: false,
      origin: 'TextEditor',
      jsonErrors: false,
      sizeOptions: [
        { value: '10px', label: 'Small', default: false },
        { value: '16px', label: 'Normal', default: true },
        { value: '18px', label: 'Large', default: false },
        { value: '32px', label: 'Huge', default: false }
      ],
      colorOptions: [
        { value: '#000000', default: true },
        { value: '#FFFFFF', default: false },
        { value: '#FF0000', default: false },
        { value: '#00FF00', default: false },
        { value: '#0000FF', default: false },
        { value: '#FFFF00', default: false },
        { value: '#00FFFF', default: false },
        { value: '#FF00FF', default: false }
      ]
    };
  },
  computed: {
    /**
     *
     */
    canAdd() {
      let hasErrors = false;
      if (this.jsonErrors?.[this.fileName] && this.jsonErrors?.[this.fileName].length > 0) {
        hasErrors = true;
      }
      return (this.index >= this.lastIndex) && (!hasErrors) && this.edited;
    },
    /**
     *
     */
    canRemove() {
      return this.index < this.lastIndex;
    },
    /**
     *
     */
    characterCount() {
      return this.content.replace(/\n$/, '').replace(/<br>/g, '').length;
    },
    /**
     *
     */
    lineCount() {
      if (this.content.match(/<br>/g)) {
        return this.content.match(/<br>/g).length;
      } else {
        return 0;
      }
    }
  },
  /**
   *
   */
  mounted() {
    EventBus.$on('caption_changed', this.onUpdate);
    EventBus.$on('caption_reset', this.reset);
    EventBus.$on('json_errors', this.onJsonErrors);
    this.$refs.Quill?.quill?.on('text-change', this.onEdit);
    document.getElementById('quill-editor').addEventListener('paste', catchPasteEvent);
  },
  /**
   *
   */
  destroyed() {
    EventBus.$off('caption_changed', this.onUpdate);
    EventBus.$off('caption_reset', this.reset);
    EventBus.$off('json_errors', this.onJsonErrors);
    this.$refs.Quill?.quill?.off('text-change', this.onEdit);
  },
  methods: {
    /**
     *
     */
    onJsonErrors($event) {
      this.jsonErrors = $event;
    },
    /**
     *
     */
    onEdit(delta, oldContents, source) {
    //onEdit({ quill, html, text }) {
      if (!this.canEmit) {
        return;
      }

      const text = this.formatHTML(this.getInnerHTML());
      this.content = text;
      EventBus.$emit('caption_update', { content: text }, this.origin);
    },
    /**
     *
     */
    onStartTimeUpdated($event) {
      if (!this.canEmit) {
        return;
      }
      EventBus.$emit('caption_update', { start: $event }, this.origin);
    },
    /**
     *
     */
    onEndTimeUpdated($event) {
      if (!this.canEmit) {
        return;
      }
      EventBus.$emit('caption_update', { end: $event }, this.origin);
    },
    /**
     *
     */
    onUpdate($event, $origin) {
      if ( !$event ) {
        return;
      }
      if ($origin === this.origin) {
        this.edited = $event.data.edited;
        return;
      }
      const { start, end, content, edited } = $event.data;
      this.start = start;
      this.end = end;
      this.content = content;
      this.edited = edited;
      this.setInnerHTML( content ? content : ' '); // empty string prevents unnecessary console errors
      this.lastIndex = $event.lastIndex;
      this.index = $event.index;
      this.fileName = $event.name;
      this.canEmit = true;
    },
    /**
     *
     */
    addCaption() {
      this.content = ' ';
      //Uses a different origin from TextEditor so that when a caption is added,
      //it will force an update on TextEditor
      EventBus.$emit('caption_add_index', 'TextEditorAddButton' );
    },
    /**
     *
     */
    removeCaption() {
      //Uses a different origin from TextEditor so that when a caption is removed,
      //it will force an update on TextEditor
      EventBus.$emit('caption_remove_index', 'TextEditorRemoveButton' );
    },
    /**
     *
     */
    escapeString() {
      const isEscaped = /^{{.*}}$/;
      const selection = getSelection();
      const offset = selection.anchorOffset < selection.focusOffset ? selection.anchorOffset : selection.focusOffset;
      const endset = selection.anchorOffset > selection.focusOffset ? selection.anchorOffset : selection.focusOffset;
      const baseString = selection.anchorNode.data;
      const text = baseString.slice(offset, endset).trim();

      const parent = document.getElementById('quill-editor');

      if (
        !parent.contains(selection.anchorNode) ||
        isEscaped.test(text) ||
        !text.trim()
      ) {
        return;
      }


      selection.anchorNode.data =
        baseString.substring(0, offset) +
        `{{${text}}}` +
        baseString.substring(endset, baseString.length);
    },
    /**
     *
     */
    formatHTML(html) {
      const parser = new DOMParser();
      const lines = Array.from(parser.parseFromString(html.replace((/<p><br><\/p>/g), ''), 'text/html').querySelectorAll('p')).map(line => line.innerHTML);
      return lines.join('<br>');
    },
    /**
     *
     */
    getInnerHTML() {
      return this.$refs.Quill.quill.container.children[0].innerHTML;
    },
    /**
     *
     */
    setInnerHTML(newValue) {
      //this.$refs.Quill.quill.container.children[0].innerHTML = newValue;
      this.$refs?.Quill?.quill?.setText(newValue);
      //this.$refs.Quill.quill.container.children[0].innerHTML = '';
      //this.$refs.Quill.quill.pasteHTML(newValue, 'silent');
    },
    /**
     *
     */
    reset() {
      this.canEmit = false;
      this.content = '';
      this.start = this.end = 0;
    }
  },
};

/**
 * An event listener that catches the past event on the text editor and pastes all content as plain text
 * Only works specifically for Quill Editors
 */
const catchPasteEvent = (e) => {
  // cancel paste
  e.preventDefault();

  // get text representation of clipboard
  const text = (e.originalEvent || e).clipboardData.getData('text/plain');

  const editor = e.currentTarget.getElementsByClassName('ql-editor')[0];
  editor.innerText = text;
};
</script>

<style lang="scss">
@import '~@/renderer/scss/colors';
@import '~@/renderer/scss/fonts';
@import '~@/renderer/scss/sizes';
.editor {
  $quill: 29.2rem;
  $controls: 10.8rem;
  $controls-error: 2.4rem;

  border-bottom-left-radius: $border-radius;
  border-bottom-right-radius: $border-radius;
  height: $quill + $controls + 3.6rem + $controls-error + $controls-error;
  overflow: hidden;
  width: 100%;

  &__quill {
    height: $quill;
  }

  .toolbar {
    &__wrapper {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
    &__group {
      display: flex;
      justify-content: space-between;
    }
  }

  &__controls {
    background-color: $grey;
    display: flex;
    height: $controls + $controls-error + $controls-error;
    justify-content: space-between;
    flex-direction: column;
    padding: 1rem;

    &-group {
      display: flex;
      height: $controls;
      justify-content: space-between;
    }
    &-error {
      display: flex;
      flex-direction: column;
      height: $controls-error * 2;
      justify-content: space-between;
    }
  }

  &__character-count {
    display: flex;
    align-items: center;
    height: 24px;

    &:first-child {
      margin-right: 1rem;
    }
  }

  &__button {
    &.v-btn {
      margin: 0;
    }
  }

  &__escape-button {
    width: 4rem !important;
  }
}
</style>