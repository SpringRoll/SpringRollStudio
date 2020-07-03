<template>
  <div id="updaterPage-wrapper">

    <div id="updaterPage-content">

      <div id="updaterPage-header">
        <app-header></app-header>
      </div>
      
      <div id="updaterPage-loader">
        <loader></loader>
      </div>

      <div id="updaterPage-status">
        <p id="updaterPage-status-text">Checking for updates</p>
      </div>

    </div>

  </div>
</template>

<script>
  import AppHeader from './Common/AppHeader';
  import Loader from './Common/Loader';

  export default {
    name: 'updater-page',
    components: { AppHeader, Loader },
    methods: {
    }
  };
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  #updaterPage-wrapper {
    background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      );

    width: 100vw;
    height: 100vh;

    display: flex;
    justify-content: space-around;
    align-items: center;
  }

  #updaterPage-content {
    width: 500px;
    height: 500px;

    display: flex;
    justify-content: center;
    align-items: center;

    flex-direction: column;
  }

  #updaterPage-status {
    margin-top: 25px;
  }

  main > div { flex-basis: 50%; }
</style>
