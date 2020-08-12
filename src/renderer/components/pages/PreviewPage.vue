<template>
  <div class="main">
    <h2 class="test">{{ test }}</h2>

    <spring-roll-container/>

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
      test: function(state) {
        console.log(state)
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
  }

  .navigation {
    position: absolute;
  }
</style>