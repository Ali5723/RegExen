export type RegexNode =
  | {
      type: "literal";
      value: string;
      start: number;
      end: number;
    }
  | {
      type:
        | "dot"
        | "digit"
        | "word"
        | "space"
        | "nonDigit"
        | "nonWord"
        | "nonSpace"
        | "start"
        | "end"
        | "wordBoundary"
        | "nonWordBoundary";
      start: number;
      end: number;
    }
  | {
      type: "characterClass";
      source: string;
      start: number;
      end: number;
    }
  | {
      type: "sequence";
      children: RegexNode[];
      start: number;
      end: number;
    }
  | {
      type: "alternation";
      branches: RegexNode[];
      start: number;
      end: number;
    }
  | {
      type: "quantifier";
      child: RegexNode;
      min: number;
      max: number;
      greedy: boolean;
      start: number;
      end: number;
    };

export type ExecutionStepType =
  | "start"
  | "match"
  | "mismatch"
  | "backtrack"
  | "success"
  | "failure"
  | "info";

export type ExecutionStep = {
  id: number;
  type: ExecutionStepType;
  patternStart: number;
  patternEnd: number;
  inputIndex: number;
  matchStart: number;
  matchEnd: number;
  message: string;
};

export type ExecutionResult = {
  steps: ExecutionStep[];
  matched: boolean;
  match: string | null;
  matchStart: number;
  matchEnd: number;
  truncated: boolean;
  error: string | null;
};
