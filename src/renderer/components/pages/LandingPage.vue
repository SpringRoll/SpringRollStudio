<template>
  <div class="main">

    <preview-target-dialog 
      v-bind:onCancel="onPreviewTargetDialogCancel"
      v-bind:onConfirm="onPreviewTargetDialogConfirm"
      v-bind:visible="showPreviewTargetDialog"
    />

    <div class="heading">
      <img class="logo" src="~@/renderer/assets/img/256x256.png" />
      <h1 class="name">SpringRoll Studio</h1>
    </div>

    <h2 class="description">SpringRoll is a light-weight toolset for building accessible HTML5 games, focusing on utilities to help developers make games more accessible and deployable at scale.</h2>

    <div class="navigation">
      <button class="projectLocationBtn" @click="sendEvent('openDialog', 'projectLocationSetter')">Set Project Location</button>
      <button class="previewGameBtn" @click="showPreviewTargetDialog = true">Preview Game</button>
      <button class="projectTemplateBtn" @click="sendEvent('createProjectTemplate')">Create Project Template</button>
      <button class="captionStudioBtn" @click="sendEvent('openCaptionStudio')">Open Caption Studio</button>
    </div>

    <h3 class="projectLocation">Project: {{ projectLocation }}</h3>
  </div>
</template>

<script>
import PreviewTargetDialog from '../dialogs/PreviewTargetDialog';
import { ipcRenderer } from 'electron';
import { mapState } from 'vuex';
import { EVENTS, DIALOGS } from '../../../contants';

export default {
  components: {
    PreviewTargetDialog
  },

  data: function() {
    return {
      showPreviewTargetDialog: false
    };
  },

  computed: {
    ...mapState({
      /**
       * Returns the path for the current project.
       */
      projectLocation: function(state) {
        if (!state.projectInfo || !state.projectInfo.location) {
          return 'No active project';
        }
        return state.projectInfo.location;
      }
    })
  },

  methods: {
    /**
     * Button click handler that will send and event through the ipcRenderer.
     */
    sendEvent: function(event, ...args) {
      ipcRenderer.send.apply(ipcRenderer, [event].concat(args));
    },

    /**
     * Go to another page.
     */
    goto: function(path) {
      this.$router.push({ path });
    },

    /**
     * Handler for canceling the preview target dailog.
     */
    onPreviewTargetDialogCancel: function() {
      this.$data.showPreviewTargetDialog = false;
    },

    /**
     * Handler for confirming the preview target dialog.
     */
    onPreviewTargetDialogConfirm: function(results) {
      this.$data.showPreviewTargetDialog = false;
      this.sendEvent(EVENTS.PREVIEW_TARGET_SET, results);

      // Go to the game preview page.
      this.goto('preview');
    }
  }
};
</script>

<style lang="scss" scoped>
  .main {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &::before,
    &::after {
      background-size: cover;
      bottom: 0;
      content: " ";
      opacity: 0.4;
      position: absolute;
      width: 100%;
      height: 50%;
    }
    &::before {
      background-image: url("~@/renderer/assets/svg/wave1.svg");
    }
    &::after {
      background-image: url("~@/renderer/assets/svg/wave2.svg");
    }

    .heading {

      .logo {
        width: 175px;
        height: auto;

      }

      .name {
        display: inline;
        margin-left: 20px;
        font-size: 32pt;
      }
    }

    .heading > * {
        vertical-align: middle;
    }

    .description {
      min-width: 512px;
      max-width: 700px;
      text-align: center;
      margin-top: 20px;
    }

    .navigation {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      z-index: 1;
    }

    .navigation > button {
      margin-top: 10px;
      width: 275px;
      height: 40px;
      font-size: 16pt;
    }

    .navigation > button + button {
      margin-top: 10px;
    }

    .projectLocation {
      position: absolute;
      left: 0%;
      bottom: 0%;
      margin-left: 5px;
      margin-bottom: 5px;
      font-size: 12pt;
    }

    // .md-dialog /deep/ .md-dialog-container {
    //   max-width: 768px;
    // }
  }
</style>