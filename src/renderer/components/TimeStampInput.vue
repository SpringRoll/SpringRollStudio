<template>
<div class="time-stamp-input">
  <span class="time-stamp-input__label capitalize font-semi-bold font-16">{{name}} Time:</span>
  <div class="time-stamp-input__container">
    <div class="time-stamp-input__input-group font-21">
      <input class="time-stamp-input__input" v-model="minutes" type="number" min="0" step="1"/>
      :
      <input class="time-stamp-input__input"  v-model="seconds" type="number" min="0"  step="1"/>
      :
      <input class="time-stamp-input__input" v-model="milliseconds" type="number" min="0" step="1"/>
    </div>
    <v-btn flat @click="getTime" class="time-stamp-input__button font-16 font-semi-bold capitalize">Use Current Time</v-btn>
  </div>
</div>
</template>

<script>
import TimeStampMixin from '@/renderer/mixins/TimeStamp';
import { EventBus } from '@/renderer/class/EventBus';
export default {
  mixins: [TimeStampMixin],
  data() {
    return {
      time: 0,
      defaultChanged: false,
    };
  },
  props: {
    name: {
      type: String,
      default: ''
    },
    default: Number
  },
  watch: {
    time() {
      if (!this.defaultChanged) {
        this.$emit('time', this.time);
      }
      this.defaultChanged = false;
    },
    default() {
      this.defaultChanged = true;
      this.time = this.default;
    }
  },
  created() {
    this.time = 'number' === typeof this.default ? this.default : this.time;
  },
  methods: {
    updateTime($event) {
      this.time = $event.time || 0;
    },
    getTime() {
      EventBus.$once('time_current', this.updateTime);
      EventBus.$emit('time_get');
    }
  },
};
</script>
<style lang="scss">
@import "~@/renderer/scss/colors";
.time-stamp-input {
  $input-width: 15.3rem;

  display: flex;
  width: 25.2rem;

  &__label {
    color: $secondary;
    white-space: nowrap;
    padding-top: 1.5rem;
  }

  &__input {
    &-group {
      background-color: $white;
      color: $secondary;
      height: 3.6rem;
      justify-content: center;
      width: $input-width;
      text-align: center;
      padding: 0.5rem;
    }

    &[type="number"] {
      width: 2rem;
      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      -moz-appearance: textfield;

      &:hover,
      &:focus {
        -moz-appearance: number-input;
      }
    }
  }

  &__button {
    color: $accent !important;
  }

  &__container {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin: 1rem 0 1.8rem;
    width: 100%;
    flex-direction: column;
  }
}
</style>

