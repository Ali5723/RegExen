import type { LearnUnit } from "../types";

export const fundamentals: LearnUnit = {
  id: "fundamentals",
  title: "Regex Fundamentals",
  description:
    "Understand what regular expressions are and how basic patterns work.",
  level: "beginner",
  order: 1,

  lessons: [
    {
      id: "introduction",
      title: "Introduction to Regex",
      description: "Discover how regular expressions match text.",
      order: 1,
      blocks: [
        {
          type: "text",
          title: "What is Regex?",
          content:
            "A regular expression is a pattern used to search, match, and manipulate text. Instead of searching for one fixed string, you can describe rules that different strings must follow.",
        },
        {
          type: "regex-example",
          pattern: "cat",
          input: "The cat is sleeping.",
          explanation:
            "The pattern cat matches the exact sequence of characters c, a, and t.",
        },
        {
          type: "tip",
          title: "Remember",
          content:
            "Ordinary letters and numbers are literal characters. They usually match themselves.",
        },
        {
          type: "question",
          question: {
            id: "intro-q1",
            type: "multiple-choice",
            question: "What does the regex cat match?",
            options: [
              { id: "a", text: "Any three characters" },
              { id: "b", text: "The exact sequence cat" },
              { id: "c", text: "Every animal name" },
            ],
            correctAnswer: "b",
            explanation:
              "Literal characters match the exact characters written in the pattern.",
          },
        },
        {
          type: "question",
          question: {
            id: "intro-q2",
            type: "true-false",
            question: "Regular expressions can be used to validate input.",
            correctAnswer: true,
            explanation:
              "Regex is often used to check whether input follows a particular format.",
          },
        },
      ],
    },
    {
      id: "character-classes",
      title: "Character Classes",
      description:
        "Learn how to match digits, letters, and groups of characters.",
      order: 2,
      blocks: [
        {
          type: "text",
          title: "Matching Digits",
          content:
            "The \\d character class matches one ASCII digit from 0 to 9. Adding + means one or more repetitions.",
        },
        {
          type: "code",
          title: "Digit Pattern",
          code: "\\d+",
          description: "This pattern finds sequences of one or more digits.",
        },
        {
          type: "regex-example",
          pattern: "\\d+",
          input: "Order 123 costs 45 dollars.",
          explanation: "The pattern finds 123 and 45 as separate matches.",
          flags: "g",
        },
        {
          type: "question",
          question: {
            id: "classes-q1",
            type: "multiple-choice",
            question: "Which pattern matches one or more digits?",
            options: [
              { id: "a", text: "\\d?" },
              { id: "b", text: "\\d+" },
              { id: "c", text: "\\D+" },
            ],
            correctAnswer: "b",
            explanation:
              "\\d matches a digit and + requires one or more repetitions.",
          },
        },
        {
          type: "question",
          question: {
            id: "classes-q2",
            type: "regex-challenge",
            question: "Write a regex that matches exactly three ASCII digits.",
            placeholder: "^\\d{3}$",
            testCases: [
              { input: "123", shouldMatch: true },
              { input: "007", shouldMatch: true },
              { input: "12", shouldMatch: false },
              { input: "1234", shouldMatch: false },
              { input: "abc", shouldMatch: false },
              { input: "a123", shouldMatch: false },
              { input: "123a", shouldMatch: false },
            ],
            explanation:
              "Use anchors to require the entire input to match, and {3} to require exactly three digits.",
          },
        },
      ],
    },
  ],
};
