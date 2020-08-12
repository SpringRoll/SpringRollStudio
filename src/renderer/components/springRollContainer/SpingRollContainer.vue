<template>
  <div class="main">
    <iframe class="gameFrame"/>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  mounted: function() {
    console.log("got here");
  },

  computed: {
    ...mapState({
      
    })
  }
};
</script>

<style lang="scss" scoped>
  .main {
    width: 100%;
    height: 100%;
  }

  .gameFrame {
    width: 100%;
    height: 100%;

    border: none;
  }
</style>