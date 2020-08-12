<template>
  <div class="main">
    <webview class="gameFrame" :src="target" />
  </div>
</template>

<script>
export default {
  props: {
    target: ''
  },

  computed: {
    
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