import { learnUnits } from "~/data/learn";
import type { LearnLesson, LearnUnit } from "~/data/learn/types";

export type LessonEntry = {
  unit: LearnUnit;
  lesson: LearnLesson;
};

export const getLearnUnits = (): LearnUnit[] =>
  [...learnUnits]
    .sort((a, b) => a.order - b.order)
    .map((unit) => ({
      ...unit,
      lessons: [...unit.lessons].sort((a, b) => a.order - b.order),
    }));

export const getAllLessons = (): LessonEntry[] =>
  getLearnUnits().flatMap((unit) =>
    unit.lessons.map((lesson) => ({ unit, lesson })),
  );

export const getLearnUnit = (unitId: string) =>
  getLearnUnits().find((unit) => unit.id === unitId);

export const getLearnLesson = (
  unitId: string,
  lessonId: string,
): LessonEntry | undefined => {
  const unit = getLearnUnit(unitId);
  const lesson = unit?.lessons.find((item) => item.id === lessonId);

  return unit && lesson ? { unit, lesson } : undefined;
};

export const getAdjacentLessons = (unitId: string, lessonId: string) => {
  const lessons = getAllLessons();

  const index = lessons.findIndex(
    ({ unit, lesson }) => unit.id === unitId && lesson.id === lessonId,
  );

  return {
    previous: index > 0 ? lessons[index - 1] : undefined,
    next:
      index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : undefined,
  };
};

export const getLessonPath = (unitId: string, lessonId: string) =>
  `/learn/${unitId}/${lessonId}`;

export const getLessonKey = (unitId: string, lessonId: string) =>
  `${unitId}/${lessonId}`;

export const checkRegexChallenge = (
  pattern: string,
  flags: string,
  testCases: { input: string; shouldMatch: boolean }[],
) => {
  try {
    const regex = new RegExp(pattern, flags);

    const results = testCases.map((testCase) => {
      // Reset lastIndex for global/sticky regexes.
      regex.lastIndex = 0;

      const actual = regex.test(testCase.input);

      return {
        ...testCase,
        actual,
        passed: actual === testCase.shouldMatch,
      };
    });

    return {
      valid: true,
      passed: results.every((result) => result.passed),
      results,
      error: null,
    };
  } catch (error) {
    return {
      valid: false,
      passed: false,
      results: [],
      error:
        error instanceof Error ? error.message : "Invalid regular expression.",
    };
  }
};
