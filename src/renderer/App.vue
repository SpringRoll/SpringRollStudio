<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'SpringrollStudio'
};
</script>

<style>
* {
  padding: 0;
  margin: 0;
  overflow: hidden;
}

html {
  font-family: sans-serif;
}

html, body, #app {
  width: 100%;
  height: 100%;
}

#app {
  background-color: white;
}
</style>