<script setup lang="ts">
import { computed } from "vue";
import { Info, Lightbulb, Copy } from "@lucide/vue";
import type { LearnBlock } from "~/data/learn/types";

const props = defineProps<{
  blocks: LearnBlock[];
}>();

const emit = defineEmits<{
  correct: [questionId: string];
}>();

const getMatches = (pattern: string, input: string, flags = "") => {
  try {
    const safeFlags = flags.includes("g") ? flags : `${flags}g`;

    const regex = new RegExp(pattern, safeFlags);

    return [...input.matchAll(regex)].map((match) => ({
      start: match.index,
      end: match.index + match[0].length,
    }));
  } catch {
    return [];
  }
};

const highlightedExamples = computed(() =>
  props.blocks.map((block) => {
    if (block.type !== "regex-example") return null;

    const matches = getMatches(block.pattern, block.input, block.flags);

    const segments: {
      text: string;
      matched: boolean;
    }[] = [];

    let position = 0;

    for (const match of matches) {
      if (match.start > position) {
        segments.push({
          text: block.input.slice(position, match.start),
          matched: false,
        });
      }

      if (match.end > match.start) {
        segments.push({
          text: block.input.slice(match.start, match.end),
          matched: true,
        });
      }

      position = Math.max(position, match.end);
    }

    if (position < block.input.length) {
      segments.push({
        text: block.input.slice(position),
        matched: false,
      });
    }

    return segments;
  }),
);
</script>

<template>
  <template v-for="(block, index) in blocks" :key="index">
    <!-- Text -->
    <section v-if="block.type === 'text'" class="space-y-3">
      <h2 v-if="block.title" class="text-lg font-semibold">
        {{ block.title }}
      </h2>

      <p class="whitespace-pre-line text-sm leading-7 text-muted-foreground">
        {{ block.content }}
      </p>
    </section>

    <!-- Code -->
    <UiCard v-else-if="block.type === 'code'" class="flex flex-col gap-4">
      <UiCardHeader v-if="block.title" class="flex flex-col">
        <UiCardTitle class="section-title!">
          {{ block.title }}
        </UiCardTitle>
      </UiCardHeader>

      <UiCardContent class="space-y-3">
        <pre
          class="overflow-x-auto rounded-lg border border-border bg-muted/30 p-4 font-mono text-sm"
        ><code>{{ block.code }}</code></pre>

        <p v-if="block.description" class="text-sm text-muted-foreground">
          {{ block.description }}
        </p>
      </UiCardContent>
    </UiCard>

    <!-- Regex example -->
    <UiCard
      v-else-if="block.type === 'regex-example'"
      class="flex flex-col gap-4"
    >
      <UiCardHeader class="flex flex-col">
        <UiCardTitle class="section-title!"> Interactive Example </UiCardTitle>

        <UiCardDescription class="section-label!">
          See how this pattern matches the example text.
        </UiCardDescription>
      </UiCardHeader>

      <UiCardContent class="space-y-4">
        <div class="space-y-2">
          <p class="label">Pattern</p>

          <code
            class="block overflow-x-auto rounded-lg border border-border bg-muted/30 p-3 font-mono text-sm"
          >
            {{ block.pattern }}
          </code>
        </div>

        <div class="space-y-2">
          <p class="label">Input</p>

          <div
            class="whitespace-pre-wrap break-words rounded-lg border border-border bg-muted/30 p-4 font-mono text-sm"
          >
            <template
              v-for="(segment, segmentIndex) in highlightedExamples[index] ??
              []"
              :key="segmentIndex"
            >
              <mark
                v-if="segment.matched"
                class="rounded-sm bg-primary/15 text-foreground"
              >
                {{ segment.text }}
              </mark>

              <span v-else>{{ segment.text }}</span>
            </template>
          </div>
        </div>

        <p class="text-sm text-muted-foreground">
          {{ block.explanation }}
        </p>
      </UiCardContent>
    </UiCard>

    <!-- Tip -->
    <div
      v-else-if="block.type === 'tip'"
      class="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4"
    >
      <Lightbulb
        class="mt-0.5 size-4 shrink-0 text-primary"
        aria-hidden="true"
      />

      <div class="space-y-1">
        <p class="label">
          {{ block.title ?? "Tip" }}
        </p>

        <p class="text-sm leading-relaxed text-muted-foreground">
          {{ block.content }}
        </p>
      </div>
    </div>

    <!-- Question -->
    <LearnQuestionRenderer
      v-else-if="block.type === 'question'"
      :question="block.question"
      @correct="emit('correct', $event)"
    />
  </template>
</template>
