<template>
  <div class="captions">
    <div class="captions__toolbar" />
    <div class="captions__content" />
    <div class="captions__navigation">
      <v-btn
        color="accent"
        class="font-semi-bold font-16 capitalize"
        :disabled="atStart"
        @click="prev"
      >
        Previous
      </v-btn>
      <v-btn
        color="accent"
        class="font-semi-bold font-16 capitalize"

        :disabled="atEnd"
        @click="next"
      >
        Next
      </v-btn>
    </div>
  </div>
</template>

<script>
import { CaptionFactory, CaptionPlayer, HtmlRenderer } from 'springroll';
import { EventBus } from '@/renderer/class/EventBus';
export default {
  /**
   *
   */
  data() {
    return {
      captionPlayer: null,
      index: 0,
      lastIndex: 0,
      name: ''
    };
  },
  computed: {
    /**
     *
     */
    atEnd() {
      return this.lastIndex === this.index || 0 === this.lastIndex;
    },
    /**
     *
     */
    atStart() {
      return 0 === this.index;
    }
  },
  /**
   *
   */
  mounted() {
    this.setup();
    EventBus.$on('caption_changed', this.setActiveCaption);
    EventBus.$on('caption_data', this.loadCaptionData);
    EventBus.$on('caption_data_opened', this.loadCaptionData);
    EventBus.$on('time_current', this.onTimeChange);
    EventBus.$on('caption_reset', this.setup);
  },
  /**
   *
   */
  destroyed() {
    EventBus.$off('caption_changed', this.setActiveCaption);
    EventBus.$off('caption_data', this.loadCaptionData);
    EventBus.$off('time_current', this.onTimeChange);
    EventBus.$off('caption_reset', this.setup);
  },
  methods: {
    /**
     *
     */
    prev() {
      EventBus.$emit('caption_move_index', -1);
    },
    /**
     *
     */
    next() {
      EventBus.$emit('caption_move_index', 1);
    },
    /**
     *
     */
    setActiveCaption($event) {
      if ($event === undefined) {
        return;
      }
      const { name, index, lastIndex } = $event;
      this.name = name;
      this.index = index;
      this.lastIndex = lastIndex;
    },
    /**
     *
     */
    setup() {
      const element = this.$el.querySelectorAll('.captions__content')[0];
      element.innerHTML = '';

      this.captionPlayer = new CaptionPlayer([], new HtmlRenderer(element));
    },
    /**
     *
     */
    loadCaptionData($event) {
      if ($event === undefined) {
        return;
      }
      this.data = $event;
      this.captionPlayer.captions = CaptionFactory.createCaptionMap($event);

      if (!this.name) {
        return;
      }
      this.captionPlayer.start(
        this.name,
        this.data[this.name][this.index].start
      );
    },
    /**
     *
     */
    onTimeChange($event) {
      if ($event === undefined) {
        return;
      }
      this.captionPlayer.start(this.name, $event.time);
      const i = this.captionPlayer.activeCaption.lineIndex - 1;
      if (i !== this.index) {
        EventBus.$emit('caption_move_index', i);
      }
    }
  },
};
</script>

<style lang="scss">
@import '~@/renderer/scss/colors';
@import '~@/renderer/scss/sizes';
.captions {
  $toolbar: 5.6rem;
  $navigation: 3.6rem;

  background-color: $white-background;
  border-bottom-left-radius: $border-radius;
  border-bottom-right-radius: $border-radius;
  display: flex;
  flex-direction: column;
  height: 22.5rem;
  overflow: hidden;
  width: 100%;

  &__toolbar {
    background-color: $grey;
    border-top-left-radius: $border-radius;
    border-top-right-radius: $border-radius;
    min-height: $toolbar;
  }

  &__content {
    height: calc(100% - #{$navigation + $toolbar});
    padding: 1rem 1rem 0rem;
  }

  &__navigation {
    display: flex;
    min-height: $navigation;
    width: 100%;

    .v-btn {
      border-radius: 0;
      margin: 0 0.09rem;
      width: 50%;
    }
  }
}
</style>


