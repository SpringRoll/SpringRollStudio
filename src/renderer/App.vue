<template>
  <div id="app">
    <v-app>
      <router-view></router-view>
    </v-app>
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