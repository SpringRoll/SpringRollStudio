<template>
  <div id="app">
    <div class="test">{{ test }} : This is a test</div>
    <img alt="Vue logo" src="./assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue';
import { mapState } from 'vuex';

export default {
  name: 'App',
  components: {
    HelloWorld
  },
  computed: {
    ...mapState({
      test: state => state.projectInfo.test
    })
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
