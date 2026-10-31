import { computed, watch } from "vue";
import { getAllLessons, getLessonKey } from "~/utils/learn/course";

type LearnProgress = {
  completedLessons: string[];
  correctQuestions: string[];
  lastLesson: string | null;
};

const STORAGE_KEY = "regexen-learn-progress-v1";

const initialProgress = (): LearnProgress => ({
  completedLessons: [],
  correctQuestions: [],
  lastLesson: null,
});

export const useLearnProgress = () => {
  const progress = useState<LearnProgress>("learn-progress", initialProgress);

  const initialized = useState<boolean>(
    "learn-progress-initialized",
    () => false,
  );

  const initialize = () => {
    if (!import.meta.client || initialized.value) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (
          parsed &&
          typeof parsed === "object" &&
          "completedLessons" in parsed &&
          "correctQuestions" in parsed &&
          "lastLesson" in parsed &&
          Array.isArray(parsed.completedLessons) &&
          Array.isArray(parsed.correctQuestions)
        ) {
          progress.value = {
            completedLessons: parsed.completedLessons.filter(
              (value): value is string => typeof value === "string",
            ),
            correctQuestions: parsed.correctQuestions.filter(
              (value): value is string => typeof value === "string",
            ),
            lastLesson:
              typeof parsed.lastLesson === "string" ? parsed.lastLesson : null,
          };
        }
      }
    } catch {
      progress.value = initialProgress();
    }

    initialized.value = true;
  };

  const persist = () => {
    if (!import.meta.client || !initialized.value) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress.value));
    } catch {
      // TODO: Storage may be unavailable or full.
    }
  };

  watch(progress, persist, { deep: true });

  const completedCount = computed(() => progress.value.completedLessons.length);

  const totalLessons = computed(() => getAllLessons().length);

  const completionPercentage = computed(() =>
    totalLessons.value
      ? Math.round((completedCount.value / totalLessons.value) * 100)
      : 0,
  );

  const isLessonCompleted = (unitId: string, lessonId: string) =>
    progress.value.completedLessons.includes(getLessonKey(unitId, lessonId));

  const completeLesson = (unitId: string, lessonId: string) => {
    const key = getLessonKey(unitId, lessonId);

    if (!progress.value.completedLessons.includes(key)) {
      progress.value.completedLessons.push(key);
    }
  };

  const isQuestionCorrect = (questionId: string) =>
    progress.value.correctQuestions.includes(questionId);

  const completeQuestion = (questionId: string) => {
    if (!isQuestionCorrect(questionId)) {
      progress.value.correctQuestions.push(questionId);
    }
  };

  const setLastLesson = (unitId: string, lessonId: string) => {
    progress.value.lastLesson = getLessonKey(unitId, lessonId);
  };

  return {
    progress,
    initialized,
    initialize,
    completedCount,
    totalLessons,
    completionPercentage,
    isLessonCompleted,
    completeLesson,
    isQuestionCorrect,
    completeQuestion,
    setLastLesson,
  };
};
