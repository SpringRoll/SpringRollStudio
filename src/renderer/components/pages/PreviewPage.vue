<template>
  <div class="main">
    <div class="content">
      <div class="controls">
        <div class="controls-left">
          <button id="btnHome" class="btn btn-controls" @click="onHomeClick()"><HomeIcon class="controls-icon" /></button>
        </div>
        <div class="controls-right">
          <button id="helpButton" class="btn btn-controls"><HelpIcon class="controls-icon" /></button>
          <button id="soundButton" class="btn btn-controls" @click="muted = !muted">
            <VolumeOnIcon v-show="!muted" class="controls-icon" />
            <MuteIcon v-show="muted" class="controls-icon" />
          </button>
          <button id="soundToggle" class="btn btn-controls --toggle" @click="soundContextsActive = !soundContextsActive">
            <CircleDownIcon class="controls-icon --toggle" :class="{ '--active': soundContextsActive }" />
          </button>
          <form v-show="soundContextsActive" id="soundContexts" class="dropDown">
            <div class="form-group form-title">
              Audio Settings
            </div>
            <div class="form-group">
              <div id="soundVolumeDiv" class="volume-slider --disabled">
                <label for="soundVolume">Volume</label>
                <input id="soundVolume" type="range" name="soundVolume">
              </div>
              <button id="sfxButton" class="btn btn-contexts">
                <SFXIcon class="controls-icon" /> <span>Sound FX {{ sfxMuted ? 'Off' : 'On' }}</span>
              </button>
              <div id="sfxVolumeDiv" class="volume-slider --disabled">
                <label for="sfxVolume">Volume</label>
                <input id="sfxVolume" type="range" name="sfxVolume">
              </div>
              <button id="musicButton" class="btn btn-contexts">
                <MusicIcon class="controls-icon" /> <span>Music {{ musicMuted ? 'Off' : 'On' }}</span>
              </button>
              <div id="musicVolumeDiv" class="volume-slider --disabled">
                <label for="musicVolume">Volume</label>
                <input id="musicVolume" type="range" name="musicVolume">
              </div>
              <button id="voButton" class="btn btn-contexts">
                <VOIcon class="controls-icon" /> <span>Voice Over {{ voMuted ? 'Off' : 'On' }}</span>
              </button>
              <div id="voVolumeDiv" class="volume-slider --disabled">
                <label for="voVolume">Volume</label>
                <input id="voVolume" type="range" name="voVolume">
              </div>
            </div>
          </form>
          <button id="captionsButton" class="btn btn-controls"><CCIcon class="controls-icon" /></button>
          <button id="captionsToggle" class="btn btn-controls --toggle"><CircleDownIcon class="controls-icon --toggle" /></button>
          <button id="pauseButton" class="btn btn-controls">
            <PauseIcon id="pauseIcon" class="controls-icon" />
            <PlayIcon id="playIcon" class="controls-icon" />
          </button>
        </div>
      </div>
      <iframe id="gameFrame" class="gameFrame" :src="previewURL" />
    </div>
  </div>
</template>

<script>
import { Container, PausePlugin, SoundPlugin, CaptionsTogglePlugin } from 'springroll-container';
import HomeIcon from '../../assets/svg/001-home.svg';
import HelpIcon from '../../assets/svg/266-question.svg';
import PlayIcon from '../../assets/svg/285-play3.svg';
import PauseIcon from '../../assets/svg/286-pause2.svg';
import VolumeOnIcon from '../../assets/svg/295-volume-high.svg';
import MuteIcon from '../../assets/svg/299-volume-mute2.svg';
import CCIcon from '../../assets/svg/cc-no-bg.svg';
import CircleUpIcon from '../../assets/svg/322-circle-up.svg';
import CircleDownIcon from '../../assets/svg/324-circle-down.svg';
import MusicIcon from '../../assets/svg/018-music.svg';
import SFXIcon from '../../assets/svg/082-bell.svg';
import VOIcon from '../../assets/svg/vo-audio-icon.svg';
import { mapState } from 'vuex';
import { join } from 'path';

let springrollContainer;

export default {
  components: {
    HomeIcon,
    HelpIcon,
    PlayIcon,
    PauseIcon,
    VolumeOnIcon,
    MuteIcon,
    CCIcon,
    CircleDownIcon,
    MusicIcon,
    SFXIcon,
    VOIcon,
  },
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
      ]
    });

    this.springrollContainer.client.on('features', ({ data }) => {

      if (!data.soundVolume, !data.musicVolume, !data.sfxVolume, !data.voVolume, !data.sfx, !data.vo, !data.music) {
        document.querySelector('#soundToggle').style.display = 'none';
      }

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
    });
    this.springrollContainer.openPath(this.previewURL);

    this.springrollContainer.client.on('paused', ({data}) => {
      this.isPaused = data.paused;
    });
  },

  methods: {
    /**
     * Handler for clicking the home button.
     */
    onHomeClick: function() {
      this.$router.push({ path: '/' });
    },
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

        .form-title {
          color: #ccc;
          font-size: 16px;
          text-align: left;
          margin: 5px 0 15px;
        }

        .form-group {
          display: flex;
          width: 100%;
          flex-direction: column;
          font-size: 12px;

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
          &:hover {
            background-color: #286090;
          }

        &.btn-controls {
          height: 100%;
          width: 20%;
          border-left: 1px solid rgba(0,0,0,.6);

          &.--toggle {
            width: 10%;
            border-left: 1px solid rgba(0,0,0,.1);
          }

          &.paused {
            > #pauseIcon {
              display: none;
            }

            > #playIcon {
              display: inline;
            }
          }

          &.unpaused {
            > #pauseIcon {
              display: inline;
            }

            > #playIcon {
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

          svg {
            margin-right: 0.5rem;
            scale: 0.8;
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