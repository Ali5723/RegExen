<script setup lang="ts">
import { Copy } from "@lucide/vue";
import { toast } from "vue-sonner";

const patterInput = ref<string>("");

function handleCopy() {
  if (!patterInput.value) {
    toast.error("Pattern input is empty");
  } else {
    navigator.clipboard.writeText(patterInput.value);
    toast.info("Copied");
  }
}

const patterns: string[] = ["g", "i", "m", "s", "u"];
</script>

<template>
  <div class="space-y-2 pb-2">
    <h2 class="text-xl font-bold">Regex Tester</h2>
    <p class="text-sm">
      Write a pattern, test it again with text, and see the results instantly.
    </p>
  </div>

  <UiField>
    <UiFieldLabel class="text-md font-bold" for="pattern">
      Pattern
    </UiFieldLabel>

    <UiInputGroup>
      <UiInputGroupInput
        placeholder="Write a pattern"
        class="text-sm"
        id="pattern"
        v-model="patterInput"
      />

      <UiInputGroupAddon align="inline-end">
        <UiInputGroupButton
          aria-label="Copy pattern"
          variant="secondary"
          @click="handleCopy"
        >
          <Copy class="size-4" />
        </UiInputGroupButton>
      </UiInputGroupAddon>
    </UiInputGroup>
  </UiField>

  <UiButtonGroup class="gap-4 *:rounded-lg! *:size-10! mx-auto">
    <UiButton variant="secondary" v-for="item in patterns" class="border-2! bg-gray-300/20">
      {{ item }}
    </UiButton>
  </UiButtonGroup>
</template>

<style lang="css" scoped>
</style>