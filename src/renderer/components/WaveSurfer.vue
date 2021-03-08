<template>
  <div class="wave__container">
    <div id="wave__container" class="wave__wave"></div>
    <div class="wave__controls">
      <div class="wave__buttons">
        <v-btn :disabled="!hasFile" class="wave__button" icon small @click="rewind">
          <v-icon>fast_rewind</v-icon>
        </v-btn>
        <v-btn :disabled="!hasFile" class="wave__button" icon small @click="previous">
          <v-icon>skip_previous</v-icon>
        </v-btn>
        <v-btn :disabled="!hasFile" class="wave__button" icon small @click="play">
          <v-icon> {{ isPlaying ? 'pause' : 'play_arrow' }}</v-icon>
        </v-btn>
        <v-btn :disabled="!hasFile" class="wave__button" icon small @click="next">
          <v-icon>skip_next</v-icon>
        </v-btn>
        <v-btn :disabled="!hasFile" class="wave__button" icon small @click="forward">
          <v-icon>fast_forward</v-icon>
        </v-btn>
      </div>
      <div class="wave__timer">
        <TimeStamp :time="currentTime" />
      </div>
    </div>
  </div>
</template>

<script>
import { EventBus } from '@/renderer/class/EventBus';
import TimeStamp from './TimeStamp';
import WaveSurfer from 'wavesurfer.js';
const fs = require('fs');

export default {
  components: {
    TimeStamp
  },
  /**
   *
   */
  data() {
    return {
      wave: null,
      isPlaying: false,
      hasFile: false,
      currentTime: 0
    };
  },
  /**
   *
   */
  mounted() {
    this.initWave();
    EventBus.$on('file_selected', this.loadFile);
    EventBus.$on('time_get', this.emitTime);
    EventBus.$on('caption_reset', this.empty);
  },
  /**
   *
   */
  destroyed() {
    EventBus.$off('file_selected', this.loadFile);
    EventBus.$off('time_get', this.emitTime);
    EventBus.$off('caption_reset', this.empty);
    this.wave.destroy();
  },
  methods: {
    /**
     *
     */
    updateTimeStamp() {
      this.currentTime = this.wave.getCurrentTime() * 1000 | 0;
      this.emitTime();
    },
    /**
     *
     */
    initWave() {
      this.wave = WaveSurfer.create({
        container: '#wave__container',
        cursorColor: '#000',
        fillParent: true,
        height: 200,
        mediaControls: true,
        mediaType: 'audio',
        normalize: true,
        progressColor: 'rgba(0,0,0,0)',
        responsive: true,
        waveColor: '#0C7AC0',
      });

      this.wave.on('audioprocess',  this.updateTimeStamp);
      this.wave.on('seek', this.updateTimeStamp);
      this.wave.on('finish', this.finish);
    },
    /**
     *
     */
    forward() {
      this.wave.skipForward();
    },
    /**
     *
     */
    rewind() {
      this.wave.skipBackward();
    },
    /**
     *
     */
    finish() {
      this.isPlaying = false;
      this.wave.stop();
    },
    /**
     *
     */
    play() {
      this.wave.playPause();
      this.isPlaying = this.wave.isPlaying();
    },
    /**
     *
     */
    previous() {
      EventBus.$emit('previous_file');
    },
    /**
     *
     */
    next() {
      EventBus.$emit('next_file');
    },
    /**
     *
     */
    empty() {
      this.wave.empty();
      this.currentTime = 0;
    },
    /**
     *
     */
    loadFile($event) {
      if (!!$event.file ) {
        this.isPlaying = false;
        this.hasFile = true;
        console.log($event.file);
        fs.readFile($event.file.fullPath, {}, (err, data) => {
          const blob = new window.Blob([new Uint8Array(data)]);
          this.wave.loadBlob(blob);
        });
      }
    },
    /**
     *
     */
    emitTime() {
      EventBus.$emit('time_current', {time: this.currentTime});
    }
  }
};
</script>

<style lang="scss">
@import "~@/renderer/scss/colors";
@import "~@/renderer/scss/sizes";

.wave {
  &__container {
    width: 100%;
  }

  &__wave {
    height: 20.1rem;
    background-color: $white-background-opacity;
    border-top-left-radius: $border-radius;
    border-top-right-radius: $border-radius;

    wave {
      z-index: 0;
    }
  }

  &__controls {
    display: flex;
    justify-content: space-between;
    background-color: $white-background;
    height: 5.6rem;
    align-items: center;
    padding: 0 2.4rem;
    border-bottom-left-radius: $border-radius;
    border-bottom-right-radius: $border-radius;
  }
}
</style>


