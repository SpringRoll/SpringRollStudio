<template>
  <div class="time-stamp">
    {{ minutes }}:{{ seconds }}:{{ milliseconds }}
  </div>
</template>

<script>
import TimeStampMixin from '@/renderer/mixins/TimeStamp';
export default {
  mixins: [TimeStampMixin],
  props: {
    time: {
      type: Number,
      default: 0
    }
  },
};
</script>

