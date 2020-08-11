<template>
  <div class="dialog" v-if="visible === true">

    <div class="content">

    <p class="heading">Choose Preview Target</p>

    <div class="options">
      <input type="radio" name="previewType" @change="setPreviewType('deploy')">
      <label for="male">Deploy Folder</label><br />

      <input type="radio" name="previewType" @change="setPreviewType('url')">
      <label for="male">Custom URL</label><br />
      
      <input id="urlInput" class="urlInput" disabled/>
    </div>

    <div class="actions">
      <button @click="onBtnCancelClick()">Cancel</button>
      <button @click="onBtnConfirmClick()">Confirm</button>
    </div>

    </div>

  </div>
</template>

<script>
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
      this.$el.querySelector('.urlInput').disabled = type === 'deploy';
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
        onConfirm();
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