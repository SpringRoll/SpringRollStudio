<template>
  <div class="dialog" v-if="visible === true">

    <div class="content">

    <p class="heading">Choose Preview Target</p>

    <div class="options">
      <input type="radio" name="previewType" @change="setPreviewType('deploy')">
      <label for="male">Deploy Folder</label><br />

      <input type="radio" name="previewType" @change="setPreviewType('url')">
      <label for="male">Custom URL</label><br />

      <input id="urlInput" class="urlInput" disabled @input="onUrlInputChange()"/>
    </div>

    <div class="actions">
      <button @click="onBtnCancelClick()">Cancel</button>
      <button id="confirmBtn" @click="onBtnConfirmClick()" disabled>Confirm</button>
    </div>

    </div>

  </div>
</template>

<script>
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
      previewType: undefined
    };
  },

  methods: {
    setPreviewType: function(type) {
      this.$data.previewType = type;
      this.$el.querySelector('#urlInput').disabled = type === 'deploy';
      this.$el.querySelector('#confirmBtn').disabled = !canConfirm.call(this);
    },

    onUrlInputChange: function() {
      this.$el.querySelector('#confirmBtn').disabled = !canConfirm.call(this);
    },

    onBtnCancelClick: function() {
      const onCancel = this.$props.onCancel;
      if (onCancel && typeof onCancel === 'function') {
        onCancel();
      }
    },

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