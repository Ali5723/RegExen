<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "@lucide/vue";
import {
  getAdjacentLessons,
  getLearnLesson,
  getLessonPath,
} from "~/utils/learn/course";

const route = useRoute();

const unitId = computed(() => String(route.params.unit));
const lessonId = computed(() => String(route.params.lesson));

const entry = computed(() => getLearnLesson(unitId.value, lessonId.value));

const adjacent = computed(() =>
  getAdjacentLessons(unitId.value, lessonId.value),
);

const {
  initialize,
  isLessonCompleted,
  completeLesson,
  completeQuestion,
  setLastLesson,
} = useLearnProgress();

onMounted(initialize);

watch(
  entry,
  (value) => {
    if (!value) return;

    setLastLesson(value.unit.id, value.lesson.id);
  },
  { immediate: true },
);

const markCompleted = () => {
  if (!entry.value) return;

  completeLesson(entry.value.unit.id, entry.value.lesson.id);
};
</script>

<template>
  <template v-if="entry">
    <!-- Title -->
    <PageTitle
      :title="entry.lesson.title"
      :description="entry.lesson.description"
    />

    <!-- Breadcrumb -->
    <nav aria-label="Lesson navigation">
      <NuxtLink
        to="/learn"
        class="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft class="size-4" aria-hidden="true" />
        {{ entry.unit.title }}
      </NuxtLink>
    </nav>

    <!-- Lesson content -->
    <section class="space-y-6" aria-label="Lesson content">
      <LearnLessonRenderer
        :blocks="entry.lesson.blocks"
        @correct="completeQuestion"
      />
    </section>

    <!-- Completion -->
    <section aria-label="Lesson completion">
      <UiCard class="flex flex-col gap-4">
        <UiCardContent class="space-y-4 p-6">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <CheckCircle2
                class="size-5"
                :class="
                  isLessonCompleted(unitId, lessonId)
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-muted-foreground'
                "
                aria-hidden="true"
              />

              <p class="font-semibold">
                {{
                  isLessonCompleted(unitId, lessonId)
                    ? "Lesson Completed"
                    : "Ready to continue?"
                }}
              </p>
            </div>

            <p class="text-sm text-muted-foreground">
              Mark this lesson as completed to update your learning progress.
            </p>
          </div>

          <UiButton
            :disabled="isLessonCompleted(unitId, lessonId)"
            @click="markCompleted"
          >
            <CheckCircle2 class="size-4" aria-hidden="true" />
            {{
              isLessonCompleted(unitId, lessonId)
                ? "Completed"
                : "Complete Lesson"
            }}
          </UiButton>
        </UiCardContent>
      </UiCard>
    </section>

    <!-- Previous / Next -->
    <nav
      class="flex flex-wrap items-center justify-between gap-3"
      aria-label="Previous and next lessons"
    >
      <NuxtLink
        v-if="adjacent.previous"
        :to="
          getLessonPath(adjacent.previous.unit.id, adjacent.previous.lesson.id)
        "
        class="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
      >
        <ArrowLeft class="size-4" aria-hidden="true" />
        Previous Lesson
      </NuxtLink>

      <span v-else />

      <NuxtLink
        v-if="adjacent.next"
        :to="getLessonPath(adjacent.next.unit.id, adjacent.next.lesson.id)"
        class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Next Lesson
        <ArrowRight class="size-4" aria-hidden="true" />
      </NuxtLink>

      <NuxtLink
        v-else
        to="/learn"
        class="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
      >
        Back to Learning
      </NuxtLink>
    </nav>

    <!-- Help -->
    <PageHelp
      text="Read the lesson, explore its examples, and complete the interactive questions. Your answers are checked in the browser. You can revisit completed lessons at any time."
    />
  </template>

  <UiCard v-else class="border-dashed">
    <UiCardContent
      class="flex min-h-64 flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <h2 class="text-lg font-semibold">Lesson not found</h2>

      <p class="text-sm text-muted-foreground">
        This lesson doesn't exist or may have been moved.
      </p>

      <NuxtLink
        to="/learn"
        class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        <ArrowLeft class="size-4" aria-hidden="true" />
        Back to Learning
      </NuxtLink>
    </UiCardContent>
  </UiCard>
</template>
