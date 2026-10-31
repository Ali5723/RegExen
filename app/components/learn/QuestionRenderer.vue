<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { CheckCircle2, XCircle } from "@lucide/vue";
import type { LearnQuestion } from "~/data/learn/types";
import { checkRegexChallenge } from "~/utils/learn/course";

const props = defineProps<{
  question: LearnQuestion;
}>();

const emit = defineEmits<{
  correct: [questionId: string];
}>();

const selectedAnswer = ref<string>("");
const regexAnswer = ref("");
const checked = ref(false);

const challengeResult = computed(() => {
  if (props.question.type !== "regex-challenge") {
    return null;
  }

  return checkRegexChallenge(
    regexAnswer.value,
    props.question.flags ?? "",
    props.question.testCases,
  );
});

const isCorrect = computed(() => {
  if (props.question.type === "multiple-choice") {
    return selectedAnswer.value === props.question.correctAnswer;
  }

  if (props.question.type === "true-false") {
    return selectedAnswer.value === String(props.question.correctAnswer);
  }

  return challengeResult.value?.passed ?? false;
});

const checkAnswer = () => {
  checked.value = true;

  if (isCorrect.value) {
    emit("correct", props.question.id);
  }
};

watch([selectedAnswer, regexAnswer], () => {
  checked.value = false;
});
</script>

<template>
  <UiCard class="flex flex-col gap-4">
    <UiCardHeader class="flex flex-col">
      <UiCardTitle class="section-title!"> Quick Check </UiCardTitle>

      <UiCardDescription class="section-label!">
        Test your understanding before continuing.
      </UiCardDescription>
    </UiCardHeader>

    <UiCardContent class="space-y-4">
      <p class="font-medium">
        {{ question.question }}
      </p>

      <!-- Multiple choice -->
      <div
        v-if="question.type === 'multiple-choice'"
        class="space-y-2"
        role="radiogroup"
        :aria-label="question.question"
      >
        <label
          v-for="option in question.options"
          :key="option.id"
          class="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
          :class="{
            'border-primary bg-primary/5': selectedAnswer === option.id,
          }"
        >
          <input
            v-model="selectedAnswer"
            type="radio"
            :name="question.id"
            :value="option.id"
            class="accent-primary"
          />

          <span class="text-sm">
            {{ option.text }}
          </span>
        </label>
      </div>

      <!-- True / False -->
      <div
        v-else-if="question.type === 'true-false'"
        class="grid grid-cols-2 gap-2"
      >
        <UiButton
          v-for="option in [
            { value: 'true', label: 'True' },
            { value: 'false', label: 'False' },
          ]"
          :key="option.value"
          :variant="selectedAnswer === option.value ? 'default' : 'outline'"
          :aria-pressed="selectedAnswer === option.value"
          @click="selectedAnswer = option.value"
        >
          {{ option.label }}
        </UiButton>
      </div>

      <!-- Regex challenge -->
      <div v-else-if="question.type === 'regex-challenge'" class="space-y-3">
        <UiInput
          v-model="regexAnswer"
          :placeholder="question.placeholder ?? 'Enter regex pattern...'"
          aria-label="Your regex answer"
          class="font-mono"
          spellcheck="false"
        />

        <div v-if="checked && challengeResult" class="space-y-2">
          <p v-if="challengeResult.error" class="text-sm text-destructive">
            {{ challengeResult.error }}
          </p>

          <div
            v-for="(testCase, index) in challengeResult.results"
            :key="index"
            class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-3 text-sm"
          >
            <code class="min-w-0 break-all font-mono">
              {{ JSON.stringify(testCase.input) }}
            </code>

            <span
              :class="
                testCase.passed
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-destructive'
              "
            >
              {{ testCase.passed ? "Passed" : "Failed" }}
            </span>
          </div>
        </div>
      </div>

      <!-- Feedback -->
      <div
        v-if="checked"
        class="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4"
        aria-live="polite"
      >
        <CheckCircle2
          v-if="isCorrect"
          class="mt-0.5 size-5 shrink-0 text-green-600 dark:text-green-400"
          aria-hidden="true"
        />

        <XCircle
          v-else
          class="mt-0.5 size-5 shrink-0 text-destructive"
          aria-hidden="true"
        />

        <div class="space-y-1">
          <p class="font-medium">
            {{ isCorrect ? "Correct!" : "Not quite." }}
          </p>

          <p class="text-sm text-muted-foreground">
            {{ question.explanation }}
          </p>
        </div>
      </div>

      <UiButton
        :disabled="
          question.type === 'regex-challenge'
            ? !regexAnswer.trim()
            : !selectedAnswer
        "
        @click="checkAnswer"
      >
        Check Answer
      </UiButton>
    </UiCardContent>
  </UiCard>
</template>
