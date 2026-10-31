<script setup lang="ts">
import { Info } from "@lucide/vue";

defineProps<{
  text: string;
}>();
</script>

<template>
  <div
    class="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4"
    role="note"
  >
    <Info
      class="mt-0.5 size-4 shrink-0 text-muted-foreground"
      aria-hidden="true"
    />

    <p class="text-xs leading-relaxed text-muted-foreground">
      {{ text }}
    </p>
  </div>
</template>
