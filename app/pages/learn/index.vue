<script setup lang="ts">
import { computed, onMounted } from "vue";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Play,
} from "@lucide/vue";
import { getLearnUnits, getLessonPath } from "~/utils/learn/course";

const units = getLearnUnits();

const {
  progress,
  initialize,
  completedCount,
  totalLessons,
  completionPercentage,
  isLessonCompleted,
} = useLearnProgress();

onMounted(initialize);

const getUnitProgress = (unitId: string) => {
  const unit = units.find((item) => item.id === unitId);

  if (!unit) return { completed: 0, total: 0, percentage: 0 };

  const completed = unit.lessons.filter((lesson) =>
    isLessonCompleted(unitId, lesson.id),
  ).length;

  return {
    completed,
    total: unit.lessons.length,
    percentage: unit.lessons.length
      ? Math.round((completed / unit.lessons.length) * 100)
      : 0,
  };
};

const continuePath = computed(() => {
  if (progress.value.lastLesson) {
    const [unitId, lessonId] = progress.value.lastLesson.split("/");

    if (unitId && lessonId) {
      return getLessonPath(unitId, lessonId);
    }
  }

  const firstUnit = units[0];
  const firstLesson = firstUnit?.lessons[0];

  return firstUnit && firstLesson
    ? getLessonPath(firstUnit.id, firstLesson.id)
    : null;
});
</script>

<template>
  <!-- Title -->
  <PageTitle
    :title="pagesList.learning.name"
    :description="pagesList.learning.description"
  />

  <!-- Overview -->
  <section aria-labelledby="learning-overview-title">
    <UiCard class="flex flex-col gap-4">
      <UiCardHeader class="flex flex-col">
        <UiCardTitle id="learning-overview-title" class="section-title!">
          Your Learning Journey
        </UiCardTitle>

        <UiCardDescription class="section-label!">
          Learn regular expressions through structured lessons, practical
          examples, and interactive challenges.
        </UiCardDescription>
      </UiCardHeader>

      <UiCardContent class="space-y-4">
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div class="rounded-lg border border-border bg-muted/30 p-4">
            <p class="text-xs text-muted-foreground">Units</p>

            <p class="mt-1 text-2xl font-semibold tabular-nums">
              {{ units.length }}
            </p>
          </div>

          <div class="rounded-lg border border-border bg-muted/30 p-4">
            <p class="text-xs text-muted-foreground">Completed</p>

            <p class="mt-1 text-2xl font-semibold tabular-nums">
              {{ completedCount }}
            </p>
          </div>

          <div
            class="col-span-2 rounded-lg border border-border bg-muted/30 p-4 sm:col-span-1"
          >
            <p class="text-xs text-muted-foreground">Progress</p>

            <p class="mt-1 text-2xl font-semibold tabular-nums">
              {{ completionPercentage }}%
            </p>
          </div>
        </div>

        <div class="space-y-2">
          <div
            class="flex items-center justify-between text-xs text-muted-foreground"
          >
            <span> {{ completedCount }} of {{ totalLessons }} lessons </span>

            <span class="tabular-nums"> {{ completionPercentage }}% </span>
          </div>

          <div
            class="h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            :aria-valuenow="completionPercentage"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Overall learning progress"
          >
            <div
              class="h-full rounded-full bg-primary transition-all duration-300"
              :style="{ width: `${completionPercentage}%` }"
            />
          </div>
        </div>

        <NuxtLink
          v-if="continuePath"
          :to="continuePath"
          class="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Play class="size-4" aria-hidden="true" />
          Continue Learning
          <ArrowRight class="size-4" aria-hidden="true" />
        </NuxtLink>
      </UiCardContent>
    </UiCard>
  </section>

  <!-- Units -->
  <section aria-labelledby="learning-units-title">
    <div class="space-y-4">
      <div>
        <h2 id="learning-units-title" class="text-lg font-semibold">
          Learning Units
        </h2>

        <p class="text-sm text-muted-foreground">
          Follow the lessons in order or explore any topic.
        </p>
      </div>

      <UiCard
        v-for="(unit, index) in units"
        :key="unit.id"
        class="flex flex-col gap-4"
      >
        <UiCardHeader class="flex flex-col gap-4">
          <div class="flex items-start gap-3">
            <div class="rounded-xl bg-primary/10 p-3 text-primary">
              <BookOpen class="size-5" aria-hidden="true" />
            </div>

            <div class="min-w-0 flex-1 space-y-1">
              <p class="text-xs text-muted-foreground">
                Unit {{ index + 1 }}
                <span class="mx-1">·</span>
                <span class="capitalize">
                  {{ unit.level }}
                </span>
              </p>

              <div class="flex flex-col">
                <UiCardTitle class="section-title!">
                  {{ unit.title }}
                </UiCardTitle>

                <UiCardDescription class="section-label!">
                  {{ unit.description }}
                </UiCardDescription>
              </div>
            </div>
          </div>
        </UiCardHeader>

        <UiCardContent class="space-y-4">
          <!-- Unit progress -->
          <div class="space-y-2">
            <div
              class="flex items-center justify-between text-xs text-muted-foreground"
            >
              <span>
                {{ getUnitProgress(unit.id).completed }}
                of
                {{ getUnitProgress(unit.id).total }}
                lessons completed
              </span>

              <span class="tabular-nums">
                {{ getUnitProgress(unit.id).percentage }}%
              </span>
            </div>

            <div class="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                class="h-full rounded-full bg-primary transition-all"
                :style="{
                  width: `${getUnitProgress(unit.id).percentage}%`,
                }"
              />
            </div>
          </div>

          <!-- Lessons -->
          <div class="overflow-hidden rounded-lg border border-border">
            <NuxtLink
              v-for="(lesson, lessonIndex) in unit.lessons"
              :key="lesson.id"
              :to="getLessonPath(unit.id, lesson.id)"
              class="flex items-center gap-3 border-b border-border p-4 transition-colors last:border-b-0 hover:bg-muted/50"
            >
              <div
                class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/50"
              >
                <CheckCircle2
                  v-if="isLessonCompleted(unit.id, lesson.id)"
                  class="size-4 text-green-600 dark:text-green-400"
                  aria-hidden="true"
                />

                <span v-else class="text-xs tabular-nums text-muted-foreground">
                  {{ lessonIndex + 1 }}
                </span>
              </div>

              <div class="min-w-0 flex-1 space-y-1">
                <p class="label">
                  {{ lesson.title }}
                </p>

                <p class="text-xs text-muted-foreground">
                  {{ lesson.description }}
                </p>
              </div>

              <ChevronRight
                class="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </NuxtLink>
          </div>
        </UiCardContent>
      </UiCard>
    </div>
  </section>

  <!-- Help -->
  <PageHelp
    text="Learn Regex is organized into units and lessons. Complete interactive questions to practice each concept, and mark lessons as finished to track your progress. Your progress is saved locally in this browser."
  />
</template>
