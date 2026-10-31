<script setup lang="ts">
import { CircleCheck, CircleX } from '@lucide/vue';

const props = defineProps<{
  patternInput: string;
}>();

function isValidRegex(regexString: string) {
  if (props.patternInput === "") return false;

  try {
    new RegExp(regexString);
    return true;
  } catch {
    return false;
  }
}
</script>

<template>
  <div
    v-if="patternInput"
    role="status"
    aria-live="polite"
    class="flex min-h-5 items-center gap-2 text-xs font-medium"
  >
    <template v-if="isValidRegex(patternInput)">
      <CircleCheck
        class="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
      />
      <span class="text-emerald-700 dark:text-emerald-400">
        Valid pattern
      </span>
    </template>

    <template v-else>
      <CircleX class="size-4 shrink-0 text-destructive" />
      <span class="text-destructive"> Invalid pattern </span>
    </template>
  </div>
</template>
