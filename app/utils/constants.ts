import {
  FlaskConical,
  BookOpenText,
  Replace,
  ListChecks,
  PlayCircle,
  Workflow,
  Gauge,
  GitCompareArrows,
  BookOpen,
  GraduationCap,
} from "@lucide/vue";

export const navigationGroups = [
  { id: "tools", label: "Tools" },
  { id: "visualize", label: "Visualize & Analyze" },
  { id: "resources", label: "Resources" },
] as const;

export const pagesList = {
  tester: {
    path: "/",
    name: "Regex Tester",
    description: "Write, test, and debug regular expressions in real time.",
    icon: FlaskConical,
    group: "tools",
  },
  explainer: {
    path: "/explain",
    name: "Regex Explainer",
    description:
      "Break down regex patterns and understand what each part does.",
    icon: BookOpenText,
    group: "tools",
  },
  replace: {
    path: "/replace",
    name: "Replace & Extract",
    description: "Replace text and extract matching data using regex patterns.",
    icon: Replace,
    group: "tools",
  },
  cases: {
    path: "/cases",
    name: "Test Cases",
    description:
      "Create test cases and verify that your regex works as expected.",
    icon: ListChecks,
    group: "tools",
  },
  visualizer: {
    path: "/visualizer",
    name: "Execution Visualizer",
    description: "Explore how regex matching works step by step.",
    icon: PlayCircle,
    group: "visualize",
  },
  automata: {
    path: "/automata",
    name: "Automata Explorer",
    description: "Visualize supported regex patterns as finite-state machines.",
    icon: Workflow,
    group: "visualize",
  },
  performance: {
    path: "/performance",
    name: "Performance Lab",
    description:
      "Measure regex performance and identify potential bottlenecks.",
    icon: Gauge,
    group: "visualize",
  },
  compatibility: {
    path: "/compatibility",
    name: "Compatibility Lab",
    description: "Compare regex syntax and behavior across different engines.",
    icon: GitCompareArrows,
    group: "visualize",
  },
  cheatsheet: {
    path: "/cheatsheet",
    name: "Regex Cheatsheet",
    description:
      "Quickly find regex syntax, explanations, and copy-ready examples.",
    icon: BookOpen,
    group: "resources",
  },
  learning: {
    path: "/learn",
    name: "Learn Regex",
    description:
      "Master regular expressions through interactive lessons and challenges.",
    icon: GraduationCap,
    group: "resources",
  },
} as const;

export const navigationList = navigationGroups.map((group) => ({
  ...group,
  items: Object.values(pagesList).filter((page) => page.group === group.id),
}));

export type RegexToken = {
  id: number;
  value: string;
  type: string;
  description: string;
  start: number;
  end: number;
};

export type RegexExplanation = {
  tokens: RegexToken[];
  valid: boolean;
  error: string | null;
};

export const allLove = "\nMade with a whole lotta love <3";
