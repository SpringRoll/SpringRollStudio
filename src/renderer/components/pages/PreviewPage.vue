<template>
  <div class="main">
    <div class="content">
      <div class="controls">
        <div class="controls-left">
          <v-btn id="btnHome" class="btn btn-controls" icon @click="onHomeClick()"><v-icon class="controls-icon">home</v-icon></v-btn>
          <v-btn id="btnRefresh" class="btn btn-controls" icon @click="onRefreshClick()"><v-icon class="controls-icon">refresh</v-icon></v-btn>
        </div>
        <div class="controls-right">
          <v-btn id="helpButton" class="btn btn-controls" icon><v-icon class="controls-icon">help</v-icon></v-btn>
          <v-btn id="soundButton" class="btn btn-controls" icon>
            <v-icon id="volumeOnIcon" class="controls-icon volumeOn">volume_up</v-icon>
            <v-icon id="volumeOffIcon" class="controls-icon volumeOff">volume_off</v-icon>
          </v-btn>
          <v-btn id="soundToggle" class="btn btn-controls --toggle" icon @click="onSoundToggle">
            <v-icon class="controls-icon --toggle" :class="{ '--active': soundContextsActive }">expand_more</v-icon>
          </v-btn>
          <form v-show="soundContextsActive" id="soundContexts" class="dropDown">
            <div class="form-group form-title">
              Audio Settings
            </div>
            <div class="form-group">
              <div id="soundVolumeDiv" class="volume-slider --disabled">
                <label for="soundVolume">Volume</label>
                <input id="soundVolume" type="range" name="soundVolume">
              </div>
              <v-btn id="sfxButton" class="btn btn-contexts" icon @click.prevent>
                <v-icon class="controls-icon volumeOn">notifications</v-icon>
                <v-icon class="controls-icon volumeOff">notifications_off</v-icon>
                <span class="volumeOn">Sound FX On</span>
                <span class="volumeOff">Sound FX Off</span>
              </v-btn>
              <div id="sfxVolumeDiv" class="volume-slider --disabled">
                <label for="sfxVolume">Volume</label>
                <input id="sfxVolume" type="range" name="sfxVolume">
              </div>
              <v-btn id="musicButton" class="btn btn-contexts" icon @click.prevent>
                <v-icon class="controls-icon volumeOn">music_note</v-icon>
                <v-icon class="controls-icon volumeOff">music_off</v-icon>
                <span class="volumeOn">Music On</span>
                <span class="volumeOff">Music Off</span>
              </v-btn>
              <div id="musicVolumeDiv" class="volume-slider --disabled">
                <label for="musicVolume">Volume</label>
                <input id="musicVolume" type="range" name="musicVolume">
              </div>
              <v-btn id="voButton" class="btn btn-contexts" icon @click.prevent>
                <v-icon class="controls-icon volumeOn">record_voice_over</v-icon>
                <v-icon class="controls-icon volumeOff">voice_over_off</v-icon>
                <span class="volumeOn">Voice Over On</span>
                <span class="volumeOff">Voice Over Off</span>
              </v-btn>
              <div id="voVolumeDiv" class="volume-slider --disabled">
                <label for="voVolume">Volume</label>
                <input id="voVolume" type="range" name="voVolume">
              </div>
            </div>
          </form>
          <v-btn id="captionsButton" class="btn btn-controls" icon>
            <v-icon class="controls-icon volumeOn">closed_caption</v-icon>
            <v-icon class="controls-icon volumeOff">closed_caption_disabled</v-icon>
          </v-btn>
          <v-btn id="captionsToggle" class="btn btn-controls --toggle --disabled" icon @click="onCaptionsToggle">
            <v-icon class="controls-icon --toggle" :class="{ '--active': captionsContextsActive }">expand_more</v-icon>
          </v-btn>
          <form v-show="captionsContextsActive" id="captionsContexts" class="dropDown">
            <div class="form-group form-title">
              Captions Styles
            </div>
            <div class="form-group">
              <div class="setting-section">
                <h3>Font Size</h3>
                <div class="radio-group">
                  <label for="fontSizeSmall">
                    Small
                    <input id="fontSizeSmall" type="radio" class="caption-radio" name="font-size" value="small">
                  </label>
                  <label for="fontSizeMedium">
                    Medium
                    <input id="fontSizeMedium" type="radio" class="caption-radio" name="font-size" value="medium" checked>
                  </label>
                  <label for="fontSizeLarge">
                    Large
                    <input id="fontSizeLarge" type="radio" class="caption-radio" name="font-size" value="large">
                  </label>
                </div>
              </div>
              <div class="setting-section">
                <h3>Font Color</h3>
                <div class="radio-group">
                  <label for="colorDefault">
                    Default
                    <input id="colorDefault" type="radio" class="caption-radio" name="font-color" value="default" checked>
                  </label>
                  <label for="colorInverted">
                    Inverted
                    <input id="colorInverted" type="radio" class="caption-radio" name="font-color" value="inverted">
                  </label>
                </div>
              </div>
              <div class="setting-section">
                <h3>Font Alignment</h3>
                <div class="radio-group">
                  <label for="alignTop">
                    Top
                    <input id="alignTop" type="radio" class="caption-radio" name="font-alignment" value="top" checked>
                  </label>
                  <label for="alignBottom">
                    Bottom
                    <input id="alignBottom" type="radio" class="caption-radio" name="font-alignment" value="bottom">
                  </label>
                </div>
              </div>
            </div>
          </form>
          <v-btn id="pauseButton" class="btn btn-controls" icon>
            <v-icon id="pauseIcon" class="controls-icon">pause</v-icon>
            <v-icon id="playIcon" class="controls-icon">play_arrow</v-icon>
          </v-btn>
        </div>
      </div>
      <iframe id="gameFrame" class="gameFrame" :src="previewURL" />
    </div>
  </div>
</template>

<script>
import { Container, PausePlugin, SoundPlugin, CaptionsTogglePlugin, CaptionsStylePlugin } from 'springroll-container';
import { mapState } from 'vuex';
import { join } from 'path';
import { ipcRenderer } from 'electron';

let springrollContainer;

export default {
  /**
   * Data object
   */
  data: function() {
    return {
      isPaused: false,
      muted: false,
      sfxMuted: false,
      voMuted: false,
      musicMuted: false,
      soundContextsActive: false,
      captionsContextsActive: false,
      springrollContainer: null,
    };
  },
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
    }),
  },
  /**
   * When this component is mounted, set some states.
   */
  mounted: function() {

    this.springrollContainer = new Container('#gameFrame', {
      plugins: [
        new PausePlugin('#pauseButton'),
        new SoundPlugin({
          soundButtons: '#soundButton',
          voButtons: '#voButton',
          sfxButtons: '#sfxButton',
          musicButtons: '#musicButton',
          soundSliders: '#soundVolume',
          sfxSliders: '#sfxVolume',
          musicSliders: '#musicVolume',
          voSliders: '#voVolume'
        }),
        new CaptionsTogglePlugin('#captionsButton'),
        new CaptionsStylePlugin('input[name=font-size]',
          'input[name=font-color]',
          'input[name=font-alignment]'),
      ]
    });

    this.springrollContainer.client.on('features', ({ data }) => {

      if (!data.soundVolume, !data.musicVolume, !data.sfxVolume, !data.voVolume, !data.sfx, !data.vo, !data.music) {
        document.querySelector('#soundToggle').style.display = 'none';
      }

      //extra step to ensure labels are hidden as well
      if (data.soundVolume) {
        document.querySelector('#soundVolumeDiv').classList.remove('--disabled');
      }
      if (data.musicVolume) {
        document.querySelector('#musicVolumeDiv').classList.remove('--disabled');
      }
      if (data.sfxVolume) {
        document.querySelector('#sfxVolumeDiv').classList.remove('--disabled');
      }
      if (data.voVolume) {
        document.querySelector('#voVolumeDiv').classList.remove('--disabled');
      }

      if (data.captionsStyles) {
        document.querySelector('#captionsToggle').classList.remove('--disabled');
      }

    });
    this.springrollContainer.openPath(this.previewURL);

    this.springrollContainer.client.on('paused', ({data}) => {
      this.isPaused = data.paused;
    });

    this.springrollContainer.client.on('soundMuted', ({data}) => {
      console.log('muted', data);
    });
  },

  methods: {
    /**
     * Handler for clicking the home button.
     */
    onHomeClick: function() {
      this.$router.push({ path: '/' });
    },
    /**
     * Handler for clicking the refresh button.
     */
    onRefreshClick: function() {
      ipcRenderer.send('reload');
    },
    /**
     * handles opening the sound context dropdown
     */
    onSoundToggle: function() {
      this.captionsContextsActive = false;
      this.soundContextsActive = !this.soundContextsActive;
    },
    /**
     * handles opening the captions context dropdown
     */
    onCaptionsToggle: function() {
      this.soundContextsActive = false;
      this.captionsContextsActive = !this.captionsContextsActive;
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

    &.--toggle {
      height: 16px;
      width: 16px;
      padding: 4px 0;
      transition: transform 0.2s;

      &.--active {
        transform: rotate(180deg);
      }
    }
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

      .dropDown {
        background: #222;
        width: 324px;
        margin-left: 1px;
        border-bottom-left-radius: 6px;
        border-bottom-right-radius: 6px;
        position: absolute;
        padding: 10px;
        box-sizing: border-box;

        &.--disabled {
          display: none;
        }

        .form-group {
          display: flex;
          width: 100%;
          flex-direction: column;
          font-size: 12px;

         &.form-title {
          color: #ccc;
          font-size: 16px;
          text-align: left;
          margin: 5px 0 15px;
        }

          .volume-slider {
            width: 100%;

            &.--disabled {
              display: none;
            }

            > input {
              width: 100%;
            }

            > label {
              color: #ccc;
              display: inline-block;
              max-width: 100%;
              margin-bottom: 5px;
              font-weight: 700
            }
          }

          .setting-section {
            box-sizing: border-box;
            padding: 0 10px;
            margin-bottom: 20px;
            width: 100%;
            display: flex;
            flex-direction: column;
            text-align: left;

            h3 {
              font-size: 15px;
              color: #ccc;
              margin-bottom: 5px;
            }

            .radio-group {
              box-sizing: border-box;
              padding: 0 10px;
              width: 100%;
              display: flex;
              justify-content: space-evenly;

              label {
                font-size: 14px;
                color: #ccc;
                text-align: left;
              }
            }

          }
        }
      }

      #playIcon {
        display: none;
      }

      .btn {
          cursor: pointer;
          background-color: #337ab7;
          color: white;
          outline: 0;
          border: 0;
          border-radius: 0;
          padding: 0;
          text-transform: none;
          letter-spacing: normal;

          &:hover {
            background-color: #286090;
          }

        &.btn-controls {
          height: 100%;
          width: 20%;
          border-left: 1px solid rgba(0,0,0,.6);
          vertical-align: baseline;

          &.--toggle {
            width: 10%;
            border-left: 1px solid rgba(0,0,0,.1);

            &.--disabled {
              display: none;
            }
          }

          &.paused {
            #pauseIcon {
              display: none;
            }

            #playIcon {
              display: inline;
            }
          }

          &.unpaused {
            #pauseIcon {
              display: inline;
            }

            #playIcon {
              display: none;
            }
          }

          &.muted {
            .volumeOn {
              display: none;
            }
            .gameFrame {
              display: inline-block;
            }
          }

          &.unmuted {
            .volumeOn {
              display: inline-block;
            }
            .volumeOff {
              display: none;
            }
          }
        }

        &.btn-contexts {
          width: 100%;
          font-size: 16px;
          font-weight: 700;
          line-height: 1;
          display: block;
          border-radius: 5px;
          padding: 6px 12px;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;

          i {
            margin-right: 0.5rem;
          }

          &.muted {
            .volumeOn {
              display: none;
            }

          .volumeOff {
            display: inline-block;
          }
          }

          &.unmuted {
            .volumeOn {
              display: inline-block;
            }

          .volumeOff {
            display: none;
          }
          }
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