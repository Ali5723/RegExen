<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import {
  CircleAlert,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "@lucide/vue";
import { traceRegex } from "~/utils/regexVisualizer/tracer";
import type {
  ExecutionStep,
  ExecutionStepType,
} from "~/utils/regexVisualizer/types";

const patternInput = ref("");
const inputText = ref("");

const ignoreCase = ref(false);
const multiline = ref(false);
const dotAll = ref(false);

const activeStep = ref(0);
const playing = ref(false);
const speed = ref(1);
const stepFilter = ref("all");

let playbackTimer: ReturnType<typeof setInterval> | null = null;

const execution = computed(() =>
  traceRegex(patternInput.value, inputText.value, {
    ignoreCase: ignoreCase.value,
    multiline: multiline.value,
    dotAll: dotAll.value,
  }),
);

const steps = computed(() => execution.value.steps);

const currentStep = computed<ExecutionStep | null>(
  () => steps.value[activeStep.value] ?? null,
);

const totalSteps = computed(() => steps.value.length);

const progress = computed(() =>
  totalSteps.value > 1
    ? Math.round((activeStep.value / (totalSteps.value - 1)) * 100)
    : 0,
);

const matchSteps = computed(
  () => steps.value.filter((step) => step.type === "match").length,
);

const mismatchSteps = computed(
  () => steps.value.filter((step) => step.type === "mismatch").length,
);

const backtrackSteps = computed(
  () => steps.value.filter((step) => step.type === "backtrack").length,
);

const filteredSteps = computed(() => {
  if (stepFilter.value === "all") return steps.value;

  return steps.value.filter((step) => step.type === stepFilter.value);
});

const stepColors: Record<ExecutionStepType, string> = {
  start: "text-muted-foreground",
  match: "text-green-600 dark:text-green-400",
  mismatch: "text-destructive",
  backtrack: "text-amber-600 dark:text-amber-400",
  success: "text-green-600 dark:text-green-400",
  failure: "text-destructive",
  info: "text-primary",
};

const stopPlayback = () => {
  playing.value = false;

  if (playbackTimer) {
    clearInterval(playbackTimer);
    playbackTimer = null;
  }
};

const goToStep = (index: number) => {
  activeStep.value = Math.max(0, Math.min(index, totalSteps.value - 1));
};

const nextStep = () => goToStep(activeStep.value + 1);
const previousStep = () => goToStep(activeStep.value - 1);

const reset = () => {
  stopPlayback();
  activeStep.value = 0;
};

const startPlayback = () => {
  if (!totalSteps.value) return;

  stopPlayback();

  if (activeStep.value >= totalSteps.value - 1) {
    activeStep.value = 0;
  }

  playing.value = true;

  playbackTimer = setInterval(() => {
    if (activeStep.value >= totalSteps.value - 1) {
      stopPlayback();
      return;
    }

    activeStep.value++;
  }, 700 / speed.value);
};

const togglePlayback = () => {
  if (playing.value) stopPlayback();
  else startPlayback();
};

watch([patternInput, inputText, ignoreCase, multiline, dotAll], reset);

watch(speed, () => {
  if (playing.value) startPlayback();
});

onBeforeUnmount(stopPlayback);

const getCharacterClass = (index: number) => {
  if (!currentStep.value) return "";

  if (index === currentStep.value.inputIndex) {
    return "border-primary bg-primary/10 text-primary";
  }

  if (
    index >= currentStep.value.matchStart &&
    index < currentStep.value.matchEnd
  ) {
    return "border-green-500/30 bg-green-500/10";
  }

  return "border-border bg-muted/30";
};

const getPatternClass = (index: number) => {
  if (!currentStep.value) return "";

  if (
    index >= currentStep.value.patternStart &&
    index < currentStep.value.patternEnd
  ) {
    return "bg-primary/10 text-primary";
  }

  return "text-muted-foreground";
};
</script>

<template>
  <!-- Title -->
  <PageTitle
    :title="pagesList.visualizer.name"
    :description="pagesList.visualizer.description"
  />

  <!-- Pattern -->
  <section aria-label="Regex pattern">
    <PatternInput v-model="patternInput" />
  </section>

  <!-- Validation -->
  <section aria-label="Pattern validation">
    <PatternValidator :pattern-input="patternInput" />
  </section>

  <!-- Input -->
  <section aria-labelledby="visualizer-input-title">
    <UiCard class="flex flex-col gap-4">
      <UiCardHeader class="flex flex-col">
        <UiCardTitle id="visualizer-input-title" class="section-title!">
          Input Text
        </UiCardTitle>

        <UiCardDescription class="section-label!">
          Enter the text you want to trace your regex against.
        </UiCardDescription>
      </UiCardHeader>

      <UiCardContent class="space-y-4">
        <UiTextarea
          v-model="inputText"
          placeholder="Enter text to visualize..."
          class="min-h-28 resize-y font-mono text-sm"
          spellcheck="false"
          aria-label="Text to visualize"
        />

        <div class="flex flex-wrap gap-2">
          <UiButton
            v-for="flag in [
              { key: 'ignoreCase', label: 'i', title: 'Ignore case' },
              { key: 'multiline', label: 'm', title: 'Multiline' },
              { key: 'dotAll', label: 's', title: 'Dot all' },
            ] as const"
            :key="flag.key"
            size="sm"
            :variant="
              (
                flag.key === 'ignoreCase'
                  ? ignoreCase
                  : flag.key === 'multiline'
                    ? multiline
                    : dotAll
              )
                ? 'default'
                : 'outline'
            "
            :aria-pressed="
              flag.key === 'ignoreCase'
                ? ignoreCase
                : flag.key === 'multiline'
                  ? multiline
                  : dotAll
            "
            :title="flag.title"
            @click="
              flag.key === 'ignoreCase'
                ? (ignoreCase = !ignoreCase)
                : flag.key === 'multiline'
                  ? (multiline = !multiline)
                  : (dotAll = !dotAll)
            "
          >
            {{ flag.label }}
          </UiButton>
        </div>
      </UiCardContent>
    </UiCard>
  </section>

  <!-- Empty state -->
  <UiCard v-if="!patternInput" class="border-dashed">
    <UiCardContent
      class="flex min-h-64 flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <div class="rounded-xl bg-primary/10 p-4 text-primary">
        <Play class="size-7" aria-hidden="true" />
      </div>

      <div class="space-y-2">
        <h2 class="text-lg font-semibold">Visualize your regex execution</h2>

        <p class="max-w-md text-sm text-muted-foreground">
          Enter a regex pattern and input text to explore matching, mismatches,
          and backtracking step by step.
        </p>
      </div>
    </UiCardContent>
  </UiCard>

  <template v-else>
    <!-- Error -->
    <UiCard v-if="execution.error" class="border-destructive/30">
      <UiCardContent class="flex items-start gap-3 p-4">
        <CircleAlert
          class="mt-0.5 size-5 shrink-0 text-destructive"
          aria-hidden="true"
        />

        <div class="space-y-1">
          <p class="font-medium">Visualization unavailable</p>

          <p class="text-sm text-muted-foreground">
            {{ execution.error }}
          </p>
        </div>
      </UiCardContent>
    </UiCard>

    <template v-else>
      <!-- Overview -->
      <section aria-labelledby="execution-overview-title">
        <UiCard class="flex flex-col gap-4">
          <UiCardHeader class="flex flex-col">
            <UiCardTitle id="execution-overview-title" class="section-title!">
              Execution Overview
            </UiCardTitle>

            <UiCardDescription class="section-label!">
              A summary of the traced matching process.
            </UiCardDescription>
          </UiCardHeader>

          <UiCardContent>
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div class="rounded-lg border border-border bg-muted/30 p-4">
                <p class="text-xs text-muted-foreground">Total steps</p>

                <p class="mt-1 text-2xl font-semibold tabular-nums">
                  {{ totalSteps }}
                </p>
              </div>

              <div class="rounded-lg border border-border bg-muted/30 p-4">
                <p class="text-xs text-muted-foreground">Backtracks</p>

                <p class="mt-1 text-2xl font-semibold tabular-nums">
                  {{ backtrackSteps }}
                </p>
              </div>

              <div
                class="col-span-2 rounded-lg border border-border bg-muted/30 p-4 sm:col-span-1"
              >
                <p class="text-xs text-muted-foreground">Final result</p>

                <p
                  class="mt-1 text-lg font-semibold"
                  :class="
                    execution.matched
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-destructive'
                  "
                >
                  {{ execution.matched ? "Matched" : "No Match" }}
                </p>
              </div>
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <!-- Controls -->
      <section aria-labelledby="execution-controls-title">
        <UiCard class="flex flex-col gap-4">
          <UiCardHeader class="flex flex-col">
            <UiCardTitle id="execution-controls-title" class="section-title!">
              Execution Controls
            </UiCardTitle>

            <UiCardDescription class="section-label!">
              Play, pause, and navigate through execution steps.
            </UiCardDescription>
          </UiCardHeader>

          <UiCardContent class="space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <UiButton
                  variant="outline"
                  size="icon"
                  aria-label="Reset execution"
                  title="Reset"
                  @click="reset"
                >
                  <RotateCcw class="size-4" aria-hidden="true" />
                </UiButton>

                <UiButton
                  variant="outline"
                  size="icon"
                  aria-label="Previous step"
                  :disabled="activeStep === 0"
                  @click="previousStep"
                >
                  <SkipBack class="size-4" aria-hidden="true" />
                </UiButton>

                <UiButton
                  :aria-label="playing ? 'Pause execution' : 'Play execution'"
                  @click="togglePlayback"
                >
                  <Pause v-if="playing" class="size-4" aria-hidden="true" />

                  <Play v-else class="size-4" aria-hidden="true" />

                  {{ playing ? "Pause" : "Play" }}
                </UiButton>

                <UiButton
                  variant="outline"
                  size="icon"
                  aria-label="Next step"
                  :disabled="activeStep >= totalSteps - 1"
                  @click="nextStep"
                >
                  <SkipForward class="size-4" aria-hidden="true" />
                </UiButton>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-xs text-muted-foreground"> Speed </span>

                <UiButton
                  v-for="value in [0.5, 1, 2]"
                  :key="value"
                  size="sm"
                  :variant="speed === value ? 'default' : 'outline'"
                  :aria-pressed="speed === value"
                  @click="speed = value"
                >
                  {{ value }}×
                </UiButton>
              </div>
            </div>

            <!-- Progress -->
            <div class="space-y-2">
              <input
                v-model.number="activeStep"
                type="range"
                min="0"
                :max="Math.max(totalSteps - 1, 0)"
                class="w-full accent-primary"
                aria-label="Execution step"
                @input="stopPlayback"
              />

              <div
                class="flex items-center justify-between text-xs text-muted-foreground"
              >
                <span> Step {{ activeStep + 1 }} of {{ totalSteps }} </span>

                <span class="tabular-nums"> {{ progress }}% </span>
              </div>
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <!-- Viewer -->
      <section aria-labelledby="execution-viewer-title">
        <UiCard class="flex flex-col gap-4">
          <UiCardHeader class="flex flex-col">
            <UiCardTitle id="execution-viewer-title" class="section-title!">
              Execution Viewer
            </UiCardTitle>

            <UiCardDescription class="section-label!">
              Follow the active pattern token and input position.
            </UiCardDescription>
          </UiCardHeader>

          <UiCardContent v-if="currentStep" class="space-y-4">
            <!-- Pattern -->
            <div class="space-y-2">
              <p class="label">Regex Pattern</p>

              <div
                class="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-4"
              >
                <span
                  v-for="(char, index) in [...patternInput]"
                  :key="index"
                  class="rounded px-1 py-1 font-mono text-sm"
                  :class="getPatternClass(index)"
                >
                  {{ char }}
                </span>
              </div>
            </div>

            <!-- Input -->
            <div class="space-y-2">
              <p class="label">Input Text</p>

              <div
                class="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-4"
              >
                <span
                  v-for="(char, index) in [...inputText]"
                  :key="index"
                  class="flex min-h-9 min-w-7 items-center justify-center rounded border px-2 font-mono text-sm transition-colors"
                  :class="getCharacterClass(index)"
                >
                  {{ char === " " ? "␣" : char }}
                </span>

                <span
                  v-if="currentStep.inputIndex === inputText.length"
                  class="flex min-h-9 items-center rounded border border-dashed border-primary px-2 font-mono text-xs text-primary"
                >
                  END
                </span>
              </div>
            </div>

            <!-- Current step -->
            <div
              class="space-y-2 rounded-lg border border-border bg-muted/30 p-4"
              aria-live="polite"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p
                  class="label capitalize"
                  :class="stepColors[currentStep.type]"
                >
                  {{ currentStep.type }}
                </p>

                <span class="text-xs tabular-nums text-muted-foreground">
                  Input index: {{ currentStep.inputIndex }}
                </span>
              </div>

              <p class="text-sm leading-relaxed">
                {{ currentStep.message }}
              </p>
            </div>

            <!-- Legend -->
            <div class="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span class="flex items-center gap-2">
                <span class="size-2.5 rounded-sm bg-primary" />
                Current position
              </span>

              <span class="flex items-center gap-2">
                <span class="size-2.5 rounded-sm bg-green-500" />
                Matched region
              </span>

              <span class="flex items-center gap-2">
                <span class="size-2.5 rounded-sm bg-amber-500" />
                Backtracking
              </span>
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <!-- Timeline -->
      <section aria-labelledby="execution-timeline-title">
        <UiCard class="flex flex-col gap-4">
          <UiCardHeader class="flex flex-col gap-4">
            <div>
              <UiCardTitle id="execution-timeline-title" class="section-title!">
                Execution Timeline
              </UiCardTitle>

              <UiCardDescription class="section-label!">
                Inspect individual matching and backtracking events.
              </UiCardDescription>
            </div>

            <div
              class="flex flex-wrap gap-2"
              role="group"
              aria-label="Filter execution steps"
            >
              <UiButton
                v-for="option in [
                  { value: 'all', label: 'All' },
                  { value: 'match', label: 'Matches' },
                  { value: 'mismatch', label: 'Mismatches' },
                  { value: 'backtrack', label: 'Backtracks' },
                ]"
                :key="option.value"
                size="sm"
                :variant="stepFilter === option.value ? 'default' : 'outline'"
                :aria-pressed="stepFilter === option.value"
                @click="stepFilter = option.value"
              >
                {{ option.label }}
              </UiButton>
            </div>
          </UiCardHeader>

          <UiCardContent class="space-y-3">
            <p class="text-xs text-muted-foreground" aria-live="polite">
              Showing {{ filteredSteps.length }} of {{ totalSteps }} steps
            </p>

            <div
              v-if="filteredSteps.length"
              class="max-h-96 overflow-y-auto rounded-lg border border-border"
            >
              <button
                v-for="step in filteredSteps"
                :key="step.id"
                type="button"
                class="flex w-full items-start gap-3 border-b border-border p-4 text-left transition-colors last:border-b-0 hover:bg-muted/50"
                :class="{
                  'bg-primary/5': activeStep === step.id,
                }"
                :aria-current="activeStep === step.id ? 'step' : undefined"
                @click="
                  stopPlayback();
                  goToStep(step.id);
                "
              >
                <span
                  class="min-w-10 shrink-0 text-xs tabular-nums text-muted-foreground"
                >
                  #{{ step.id + 1 }}
                </span>

                <div class="min-w-0 flex-1 space-y-1">
                  <p class="label capitalize" :class="stepColors[step.type]">
                    {{ step.type }}
                  </p>

                  <p class="text-sm leading-relaxed text-muted-foreground">
                    {{ step.message }}
                  </p>
                </div>

                <span
                  class="shrink-0 text-xs tabular-nums text-muted-foreground"
                >
                  {{ step.inputIndex }}
                </span>
              </button>
            </div>

            <div
              v-else
              class="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground"
            >
              No execution steps match this filter.
            </div>
          </UiCardContent>
        </UiCard>
      </section>
    </template>
  </template>

  <!-- Help -->
  <PageHelp
    text="This visualizer uses a custom educational regex tracer, not the internal JavaScript RegExp execution engine. It supports a subset of JavaScript regex syntax and may not reproduce every engine optimization. Execution is limited to prevent excessively large traces."
  />
</template>
