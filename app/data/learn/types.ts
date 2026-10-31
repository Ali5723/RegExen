export type LearnLevel = "beginner" | "intermediate" | "advanced";

export type LearnQuestion =
  | {
      id: string;
      type: "multiple-choice";
      question: string;
      options: { id: string; text: string }[];
      correctAnswer: string;
      explanation: string;
    }
  | {
      id: string;
      type: "true-false";
      question: string;
      correctAnswer: boolean;
      explanation: string;
    }
  | {
      id: string;
      type: "regex-challenge";
      question: string;
      placeholder?: string;
      flags?: string;
      testCases: {
        input: string;
        shouldMatch: boolean;
      }[];
      explanation: string;
    };

export type LearnBlock =
  | {
      type: "text";
      title?: string;
      content: string;
    }
  | {
      type: "code";
      title?: string;
      code: string;
      description?: string;
    }
  | {
      type: "regex-example";
      pattern: string;
      input: string;
      explanation: string;
      flags?: string;
    }
  | {
      type: "tip";
      title?: string;
      content: string;
    }
  | {
      type: "question";
      question: LearnQuestion;
    };

export type LearnLesson = {
  id: string;
  title: string;
  description: string;
  order: number;
  blocks: LearnBlock[];
};

export type LearnUnit = {
  id: string;
  title: string;
  description: string;
  level: LearnLevel;
  order: number;
  lessons: LearnLesson[];
};
