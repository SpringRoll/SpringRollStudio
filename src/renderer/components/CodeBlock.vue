<template>
  <pre class="code-block__pre" slot="code" v-highlightjs=code><code class="javascript code-block font-12"></code></pre>
</template>

<script>
export default {
  props: ['code']
};
</script>

<style lang="scss">
@import "~@/renderer/scss/colors";
$standard-width: 37.8rem;
.code-block {
  color: $black;
  background-color: $white-background;
  width: $standard-width;
  min-height: 26.4rem;
  padding: 1.6rem 2.4rem;
  height: 100%;

  &__pre {
    height: 100%;
  }
}
</style>
