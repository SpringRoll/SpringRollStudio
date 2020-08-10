<template>
  <div class="main">
    <iframe id="gameFrame"/>
  </div>
</template>

<script>
export default {
  mounted: function() {
    console.log("got here");
  }
};
</script>

<style lang="scss" scoped>
  .main {
    width: 100%;
    height: 100%;
  }

  #gameFrame {
    width: 100%;
    height: 100%;
  }
</style>