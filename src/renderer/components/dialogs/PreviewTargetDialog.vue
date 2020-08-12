<template>
  <div class="dialog" v-show="visible === true">
    <div class="content">
      <p class="heading">Choose Preview Target</p>

      <div class="options">
        <input type="radio"
          name="previewType"
          :checked="isDeploy" 
          @change="setPreviewType('deploy')"
        />
        <label for="male">Deploy Folder</label>

        <br />

        <input type="radio"
          name="previewType"
          :checked="isURL"
          @change="setPreviewType('url')"
        />
        <label for="male">Custom URL</label>

        <br />

        <input id="urlInput" 
          class="urlInput" 
          :disabled="disableURL === true" 
          :value="previewURL" 
          @input="onUrlInputChange()"
        />
      </div>

      <div class="actions">
        <button 
          @click="onBtnCancelClick()">
          Cancel
        </button>
        <button
          id="confirmBtn"
          :disabled="disableConfirm === true"
          @click="onBtnConfirmClick()">
          Confirm
        </button>
      </div>

    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

/**
 * Checks to see if the confirm button should be disabled or not.
 * TODO - Needs to check for spaces.
 */
const canConfirm = function() {
  if (this.$data.previewType === 'deploy') {
    return true;
  }
  else if (this.$data.previewType === 'url') {
    return !/^ *$/.test(this.$el.querySelector('#urlInput').value);
  }
  return false;
}

export default {
  props: [
    // Variables
    'visible',

    // Callbacks
    'onCancel',
    'onConfirm'
  ],

  data: function () {
    return {
      previewType: undefined,
      
    };
  },

  /**
   * When this component is mounted, set some states.
   */
  mounted: function() {
    this.$data.previewType = this.previewTarget;
  },

  computed: {
    disableURL: function() { return this.previewType === 'deploy'; },
    disableConfirm: function() { return !canConfirm.call(this); },

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
        if (this.isDeploy || this.$data.previewType === 'deploy') {
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
      }
    })
  },

  methods: {
    /**
     * Sets the previewType variable anytime an option is selected.
     */
    setPreviewType: function(type) {
      this.$data.previewType = type;
    },

    /**
     * Updates the state of the confirm button any time the input text is updated.
     */
    onUrlInputChange: function() {
      this.$el.querySelector('#confirmBtn').disabled = !canConfirm.call(this);
    },

    /**
     * Handler for clicking the cancel button.
     */
    onBtnCancelClick: function() {
      const onCancel = this.$props.onCancel;
      if (onCancel && typeof onCancel === 'function') {
        onCancel();
      }
    },

    /**
     * Handler for clicking the confirm button.
     */
    onBtnConfirmClick: function() {
      const onConfirm = this.$props.onConfirm;
      if (onConfirm && typeof onConfirm === 'function') {
        const result = { type: this.$data.previewType };
        if (result.type === 'url') {
          result.url = this.$el.querySelector('#urlInput').value;
        }
        onConfirm(result);
      }
    }
  }
}
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