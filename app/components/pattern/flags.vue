<script setup lang="ts">
const flags: string[] = ["g", "i", "m", "s", "u"];
const activatedFlags = defineModel<string[]>({
  default: () => [],
});

function toggleFlag(pattern: string) {
  if (activatedFlags.value.includes(pattern)) {
    activatedFlags.value = activatedFlags.value.filter(
      (item) => item !== pattern,
    );
  } else {
    activatedFlags.value = [...activatedFlags.value, pattern];
  }
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <span class="section-title">Flags</span>
      <span class="text-xs text-muted-foreground">
        Select regex modifiers
      </span>
    </div>

    <div class="flex flex-wrap gap-2">
      <UiButton
        v-for="item in flags"
        :key="item"
        type="button"
        size="sm"
        variant="outline"
        :aria-label="`Toggle ${item} flag`"
        :aria-pressed="activatedFlags.includes(item)"
        :class="[
          'h-9 min-w-9 rounded-lg border font-mono text-sm font-semibold transition-colors',
          activatedFlags.includes(item)
            ? 'border-primary/40 bg-primary/10 text-primary! hover:bg-primary/15'
            : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-accent hover:text-accent-foreground',
        ]"
        @click="toggleFlag(item)"
      >
        {{ item }}
      </UiButton>
    </div>
  </div>
</template>
