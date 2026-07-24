<script setup lang="ts">
const props = defineProps<{ class?: string }>()
</script>

<template>
  <span :class="['font-bold tracking-tight', props.class]">
    <span class="text-primary">EASY</span>
  </span>
</template>
