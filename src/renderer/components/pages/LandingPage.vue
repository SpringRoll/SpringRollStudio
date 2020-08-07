<template>
  <div class="main">    
    <div class="heading">
      <img class="logo" src="~@/renderer/assets/img/256x256.png" />
      <h1 class="name">SpringRoll Studio</h1>
    </div>

    <h2 class="description">SpringRoll is a light-weight toolset for building accessible HTML5 games, focusing on utilities to help developers make games more accessible and deployable at scale.</h2>

    <div class="navigation">
      <button class="projectLocationBtn" @click="sendEvent('openDialog', 'projectLocationSetter')">Set Project Location</button>
      <button class="previewGameBtn" @click="sendEvent('previewGame')">Preview Game</button>
      <button class="projectTemplateBtn" @click="sendEvent('createProjectTemplate')">Create Project Template</button>
      <button class="captionStudioBtn" @click="sendEvent('openCaptionStudio')">Open Caption Studio</button>
    </div>

    <h3 class="projectLocation">Project: {{ projectLocation }}</h3>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import { mapState } from 'vuex';
import { EVENTS, DIALOGS } from '../../../contants';

export default {
  computed: {
    ...mapState({
      /**
       * Returns the path for the current project.
       */
      projectLocation: (state) => {
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
    sendEvent: (event, ...args) => ipcRenderer.send.apply(ipcRenderer, [event].concat(args))
  }
};
</script>

<style lang="scss">
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
  }
</style>