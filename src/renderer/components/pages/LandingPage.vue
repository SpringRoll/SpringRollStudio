<template>
  <div class="main">
    <h3 class="appInfo__appVersion">Version {{ appVersion }}</h3>
    <preview-target-dialog :on-cancel="onPreviewTargetDialogCancel" :on-confirm="onPreviewTargetDialogConfirm" :visible="showPreviewTargetDialog" />

    <template-project-dialog :on-cancel="onProjectTemplateDialogCancel" :on-confirm="onProjectTemplateDialogConfirm" :visible="showProjectTemplateDialog" />

    <div class="heading">
      <img class="logo" src="~@/renderer/assets/img/256x256.png" />
      <h1 class="name">SpringRoll Studio</h1>
    </div>

    <h2 class="description">SpringRoll is a light-weight toolset for building accessible HTML5 games, focusing on utilities to help developers make games more accessible and deployable at scale.</h2>

    <div class="navigation">
      <v-btn class="landing-btn projectLocationBtn" @click="sendEvent('openDialog', 'projectLocationSetter')">Set Project Location</v-btn>
      <v-btn class="landing-btn previewGameBtn" :disabled="disablePreview" @click="togglePreviewTargetDialog(true)">Preview Game</v-btn>
      <v-btn class="landing-btn projectTemplateBtn" @click="toggleProjectTemplateDialog(true)">Create Project Template</v-btn>
      <v-btn class="landing-btn captionStudioBtn" @click="onCaptionStudioClick">Open Caption Studio</v-btn>
    </div>

    <div class="appInfo">
      <h3 class="appInfo__projectLocation">Project: {{ projectLocation }}</h3>
      <h3 class="appInfo__projectLocation">Audio: {{ audioLocation }}</h3>
    </div>
  </div>
</template>

<script>
import PreviewTargetDialog from '../dialogs/PreviewTargetDialog.vue';
import TemplateProjectDialog from '../dialogs/TemplateProjectDialog.vue';
import {
  ipcMain,
  ipcRenderer
} from 'electron';
import {
  mapState
} from 'vuex';
import {
  EVENTS,
  DIALOGS
} from '../../../contents';
const package_json = require('../../../../package.json');

export default {
  components: {
    PreviewTargetDialog,
    TemplateProjectDialog
  },

  /**
   * Data object
   */
  data: function () {
    return {
      showPreviewTargetDialog: false,
      showProjectTemplateDialog: false,
      appVersion: package_json.version
    };
  },

  computed: {
    ...mapState({
      /**
       * Returns the path for the current project.
       */
      projectLocation: function (state) {
        if (!state.projectInfo || !state.projectInfo.location) {
          return 'No active project';
        }
        return state.projectInfo.location;
      },
      /**
       * Returns the path for the current project audio files
       */
      audioLocation: function (state) {
        return state.captionInfo.audioLocation;
      },
      /**
       * Whether or not to disable the preview game button.
       */
      disablePreview: function (state) {
        return !state.projectInfo || !state.projectInfo.location;
      }
    })
  },
  /**
   *
   */
  mounted() {
    ipcRenderer.on(EVENTS.OPEN_TEMPLATE_DIALOG, (event, data) => {
      console.log(data);
      this.toggleProjectTemplateDialog(data);
    });
  },
  methods: {
    /**
     * Button click handler that will send and event through the ipcRenderer.
     */
    sendEvent: function (event, ...args) {
      ipcRenderer.send.apply(ipcRenderer, [event].concat(args));
    },

    /**
     * Go to another page.
     */
    goto: function (path) {
      this.$router.push({
        path
      });
    },

    /**
     * Handler for canceling the preview target dailog.
     */
    onPreviewTargetDialogCancel: function () {
      this.togglePreviewTargetDialog(false);
    },

    /**
     * Handler for canceling the project template dailog.
     */
    onProjectTemplateDialogCancel: function () {
      this.toggleProjectTemplateDialog(false);
    },

    /**
     * Handler for confirming the preview target dialog.
     */
    onPreviewTargetDialogConfirm: function (results) {
      this.togglePreviewTargetDialog(false);
      this.sendEvent(EVENTS.PREVIEW_TARGET_SET, results);
    },

    /**
     * Handler for confirming the project template dailog.
     */
    onProjectTemplateDialogConfirm: function (results) {
      this.toggleProjectTemplateDialog(false);
    },

    /**
     * Toggle the preview target dialog.
     */
    togglePreviewTargetDialog: function (toggle) {
      this.showPreviewTargetDialog = toggle;
    },

    /**
     * Toggle the project template creation dialog.
     */
    toggleProjectTemplateDialog: function (toggle) {
      this.showProjectTemplateDialog = toggle;
    },
    /**
     *
     */
    onCaptionStudioClick() {
      ipcRenderer.send('captionStudio', true);
      this.sendEvent('openCaptionStudio');
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

  .heading>* {
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

  .navigation {
    .landing-btn {
      margin-top: 10px;
      width: 275px;
      height: 40px;
      font-size: 16pt;
      text-transform: none;
      letter-spacing: normal;
      /* important used here to overwrite vuetify light theme */
      background-color: #337ab7 !important;
      color: white !important;

      &:hover {
        background-color: #286090 !important;
      }
    }
  }

  .navigation>button+button {
    margin-top: 10px;
  }

  .appInfo {
    position: absolute;
    left: 0%;
    bottom: 0%;
    margin-left: 5px;
    margin-bottom: 5px;
    font-size: 12pt;

    &__appVersion {
      position: absolute;
      left: 0%;
      top: 0%;
      margin-left: 5px;
      margin-top: 5px;
      font-size: 12pt;
    }
  }
}
</style>
