<template>
  <div v-show="visible === true" class="dialog">
    <div class="content">
      <p class="heading">Choose Preview Target</p>
      <div class="options">
        <input
          id="deployOption"
          type="radio"
          name="previewType"
          :checked="isDeploy"
          @change="setPreviewType('deploy')"
        />
        <label class="radioLabel" for="previewType">Deploy Folder</label>

        <input
          id="urlOption"
          type="radio"
          name="previewType"
          :checked="isURL"
          @change="setPreviewType('url')"
        />
        <label class="radioLabel" for="previewType">Custom URL</label>

        <v-text-field
          id="urlInput"
          class="urlInput"
          :disabled="disableURL"
          :value="previewURL"
          label="URL"
          filled
          @input="onUrlInputChange()"
        ></v-text-field>
      </div>

      <div class="actions">
        <button
          id="cancelBtn"
          @click="onBtnCancelClick()"
        >
          Cancel
        </button>
        <button
          id="confirmBtn"
          :disabled="disableConfirm()"
          @click="onBtnConfirmClick()"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  props: {
    // Variables
    visible: {
      type:Boolean,
      default: false
    },

    // Callbacks
    onCancel: {
      type: Function,
      default: () => {}
    },
    onConfirm: {
      type: Function,
      default: () => {}
    }
  },

  /**
   * Data object
   */
  data: function () {
    return {
      previewType: undefined
    };
  },

  computed: {
    ...mapState({
      /**
       * Returns the last known preview target from storage.
       */
      previewTarget: function(state) {
        return (!state.gamePreview || !state.gamePreview.previewTarget) ? undefined : state.gamePreview.previewTarget;
      },

      /**
       * Returns the last known preview URL from storage.
       */
      previewURL: function(state) {
        if (this.isDeploy || this.previewType === 'deploy') {
          return '';
        }
        return (!state.gamePreview || !state.gamePreview.previewURL) ? '' : state.gamePreview.previewURL;
      },

      /**
       * Returns whether deploy was the last known preview target.
       */
      isDeploy: function(state) {
        return state.gamePreview && state.gamePreview.previewTarget && state.gamePreview.previewTarget === 'deploy';
      },

      /**
       * Returns whether url was the last known preview target.
       */
      isURL: function(state) {
        return state.gamePreview && state.gamePreview.previewTarget && state.gamePreview.previewTarget === 'url';
      },
      /**
       * Whether or not the URL input field should be disabled.
       */
      disableURL: function() {
        return this.previewType === 'deploy';
      },

    })
  },

  /**
   * When this component is mounted, set some states.
   */
  mounted: function() {
    this.previewType = this.previewTarget;
  },

  methods: {
    /**
     * Whether or not the confirm button should be disabled.
     */
    disableConfirm: function() {
      switch (this.previewType) {
      case 'deploy':
        return false;

      case 'url':
        const val = this.$el.querySelector('#urlInput').value;
        return !val || val === '';
      }
      return false;
    },
    /**
     * Sets the previewType variable anytime an option is selected.
     */
    setPreviewType: function(type) {
      this.previewType = type;
    },

    /**
     * Updates the state of the confirm button any time the input text is updated.
     */
    onUrlInputChange: function() {
      this.$el.querySelector('#confirmBtn').disabled = this.disableConfirm();
    },

    /**
     * Handler for clicking the cancel button.
     */
    onBtnCancelClick: function() {
      this.onCancel();
    },

    /**
     * Handler for clicking the confirm button.
     */
    onBtnConfirmClick: function() {
      const result = { type: this.previewType };
      if (result.type === 'url') {
        result.url = this.$el.querySelector('#urlInput').value;
      }
      this.onConfirm(result);
    }
  }
};
</script>

<style lang="scss" scoped>
.dialog {
  position: absolute;

  z-index: 100;

  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: rgba($color: #0e0e0e, $alpha: 0.5);

  .content {
    position: relative;

    width: 400px;
    height: 250px;

    background-color: white;

    .heading {
      text-align: center;
      margin-top: 10px;
      font-size: 18pt;
    }

    .options {
      position: absolute;

      width: 90%;
      height: 150px;

      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);

      .radioLabel {
        margin-bottom: 15px;
      }

      .urlInput {
        width: 95%;
        height: 40px;
      }
    }

    .actions {
      position: absolute;

      display: flex;
      justify-content: center;
      align-items: center;

      width: 220px;
      height: 40px;

      bottom: 0;
      right: 0;
    }

    .actions > button {
      width: 100px;
      height: 30px;
    }

    .actions > button + button {
      margin-left: 10px;
    }
  }
}
</style>