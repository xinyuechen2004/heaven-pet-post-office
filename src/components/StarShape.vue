<template>
  <svg width="24" height="24" viewBox="0 0 24 24" :fill="color">
    <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{ color: string }>()
</script>
