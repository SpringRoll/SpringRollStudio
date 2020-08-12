<template>
  <div class="main">

    <spring-roll-container
      v-bind:target="previewURL"
    />

    <div class="navigation">

    </div>
  </div>
</template>

<script>
import SpringRollContainer from '../springRollContainer/SpingRollContainer';
import { mapState } from 'vuex';

export default {
  components: { SpringRollContainer },

  computed: {
    ...mapState({
      previewURL: function(state) {
        return state.gamePreview.previewURL
      }
    })
  }
};
</script>

<style lang="scss" scoped>
  .main {
    width: 100%;
    height: 100%;

    background-color: black;
  }

  .navigation {
    position: absolute;
  }
</style>