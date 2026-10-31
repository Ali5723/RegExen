<script setup lang="ts">
import { Copy } from "@lucide/vue";
import { toast } from "vue-sonner";

const patternInput = defineModel<string>({ default: "" });

async function handleCopy() {
  if (!patternInput.value) {
    toast.error("Pattern input is empty");
  } else {
    try {
      await navigator.clipboard.writeText(patternInput.value);
      toast.info("Copied");
    } catch {
      toast.error("Failed to copy");
    }
  }
}
</script>

<template>
  <!-- Pattern Input -->
  <UiField class="gap-2.5">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <UiFieldLabel for="pattern" class="section-title!">
        Pattern
      </UiFieldLabel>

      <UiFieldDescription class="text-xs text-muted-foreground">
        Write without / /
      </UiFieldDescription>
    </div>

    <UiInputGroup
      class="min-h-11 border-border bg-card transition-colors focus-within:border-primary/60"
    >
      <UiInputGroupInput
        id="pattern"
        v-model="patternInput"
        placeholder="Write a pattern"
        aria-label="Regular expression pattern"
        class="font-mono text-sm text-foreground placeholder:text-muted-foreground"
      />

      <UiInputGroupAddon align="inline-end">
        <UiInputGroupButton
          aria-label="Copy pattern"
          variant="ghost"
          class="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          @click="handleCopy"
        >
          <Copy class="size-4" />
        </UiInputGroupButton>
      </UiInputGroupAddon>
    </UiInputGroup>
  </UiField>
</template>
