<template>
  <div class="main">
    <div class="content">
      <div class="controls">
        <div class="controls-left">
          <button id="btnHome" class="btn-controls" @click="onHomeClick()"><HomeIcon class="controls-icon" /></button>
        </div>
        <div class="controls-right">
          <button id="helpButton" class="btn-controls">Help</button>
          <button id="soundButton" class="btn-controls">Sound</button>
          <button id="soundToggle" class="btn-controls --toggle">V</button>
          <button id="captionsButton" class="btn-controls">Captions</button>
          <button id="captionsToggle" class="btn-controls --toggle">V</button>
          <button id="pauseButton" class="btn-controls">Pause</button>
        </div>
      </div>
      <iframe id="gameFrame" class="gameFrame" :src="previewURL" />
    </div>
  </div>
</template>

<script>
import { Container } from 'springroll-container';
import HomeIcon from '../../assets/svg/001-home.svg';
import { mapState } from 'vuex';
import { join } from 'path';

let springrollContainer;

export default {
  components: {
    HomeIcon
  },
  computed: {
    ...mapState({
      /**
       * Returns a formatted preview url.
       */
      previewURL: function(state) {
        switch (state.gamePreview.previewTarget) {
        case 'deploy':
          return join(state.gamePreview.previewURL, 'index.html');

        case 'url':
          let url = `${state.gamePreview.previewURL}/index.html`;
          if (url.indexOf('http:') === -1) {
            url = `http://${url}`;
          }
          return url;
        }
      }
    })
  },

  /**
   * When this component is mounted, set some states.
   */
  mounted: function() {
    // TODO - Setup control elements and pass them to the container.
    springrollContainer = new Container('#gameFrame');
    springrollContainer.openPath(this.previewURL);
  },

  methods: {
    /**
     * Handler for clicking the home button.
     */
    onHomeClick: function() {
      this.$router.push({ path: '/' });
    }
  }
};
</script>

<style lang="scss" scoped>
  .main {
    width: 100%;
    height: 100%;

    background-color: #222;
  }

  .controls-icon {
    fill: white;
    height: 24px;
    width: 24px;
  }

  .content {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;

    .controls {
      display: flex;
      justify-content: space-between;
      height: 40px;

      width: 100%;

      .controls-left {
        width: 325px;
      }

      .controls-right {
        width: 325px;
      }

      .btn-controls {
        cursor: pointer;
        height: 100%;
        width: 20%;
        background-color: #337ab7;
        color: white;
        outline: 0;
        border: 0;
        border-radius: 0;
        margin: 0;
        padding: 0;

        &:hover {
          background-color: #286090;
        }

        &.--toggle {
          width: 10%;
        }
      }
    }

    .gameFrame {
      border: none;
      width: 100%;
      flex-grow: 1;
    }
  }
</style>