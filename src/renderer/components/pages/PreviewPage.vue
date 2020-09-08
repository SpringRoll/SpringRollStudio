<template>
  <div class="main">
    <div class="content">
      <div class="controls">
        <button id="btnHome" @click="onHomeClick()">Home</button>
      </div>
      <iframe id="gameFrame" class="gameFrame" :src="previewURL" />
    </div>
  </div>
</template>

<script>
import { Container } from 'springroll-container';
import { mapState } from 'vuex';
import { join } from 'path';

let springrollContainer;

export default {
  computed: {
    ...mapState({
      /**
       * Returns a formatted preview url.
       */
      previewURL: function(state) {
        if (state.gamePreview.previewURL.indexOf('index.html') === -1)  {
          switch (state.gamePreview.previewTarget) {
          case 'deploy':
            return join(state.gamePreview.previewURL, 'index.html');

          case 'url':
            return `${state.gamePreview.previewURL}/index.html`;
          }
        }
        return state.gamePreview.previewURL;
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

    background-color: black;
  }

  .content {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;

    .controls {
      background-color: blue;

      width: 100%;
      height: 50px;

      > button {
        width: 40px;
        height: 40px;
      }

      #btnHome {
        margin-left: 5px;
        margin-top: 5px;
      }
    }

    .gameFrame {
      border: none;
      width: 100%;
      flex-grow: 1;
    }
  }
</style>