<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
}>();
</script>

<template>
  <div class="space-y-1.5">
    <h2 class="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
      {{ title }}
    </h2>
    <p class="section-label!">
      {{ description }}
    </p>
  </div>
</template>
