<template>
  <div class="loader"></div>
</template>

<script>

</script>

<style>
  .loader {
    border: 16px solid #e0e0e0;
    border-radius: 50%;
    border-top: 16px solid #3498db;
    width: 120px;
    height: 120px;
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>