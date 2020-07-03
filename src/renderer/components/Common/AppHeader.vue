<template>
  <div id="appHeading">
    <img id="appHeading-logo" src="~@/assets/256x256.png" alt="electron-vue">
    <p id="appHeading-name">Springroll Studio</p>
  </div>
</template>

<script>

</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  #appHeading {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #appHeading-logo {
      height: auto;
      width: 128px;
      margin-right: 20px;
  }

  #appHeading-name {
      font-size: 36pt;
  }
</style>