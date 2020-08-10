<template>
  <div class="main">
    <spring-roll-container/>
  </div>
</template>

<script>
import SpringRollContainer from '../springRollContainer/SpingRollContainer';

export default {
  components: { SpringRollContainer }
};
</script>

<style lang="scss" scoped>
  .main {
    width: 100%;
    height: 100%;
  }
</style>