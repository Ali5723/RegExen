import { parseRegex } from "./parser";
import type {
  ExecutionResult,
  ExecutionStep,
  ExecutionStepType,
  RegexNode,
} from "./types";

type TraceOptions = {
  ignoreCase?: boolean;
  multiline?: boolean;
  dotAll?: boolean;
  maxSteps?: number;
};

type State = {
  index: number;
};

export function traceRegex(
  pattern: string,
  input: string,
  options: TraceOptions = {},
): ExecutionResult {
  const steps: ExecutionStep[] = [];
  const maxSteps = Math.max(100, Math.min(options.maxSteps ?? 3000, 10000));

  let truncated = false;
  let matchStart = 0;
  let currentEnd = 0;

  const emit = (
    type: ExecutionStepType,
    node: Pick<RegexNode, "start" | "end">,
    index: number,
    message: string,
  ) => {
    if (steps.length >= maxSteps) {
      truncated = true;
      throw new Error("Execution step limit reached.");
    }

    steps.push({
      id: steps.length,
      type,
      patternStart: node.start,
      patternEnd: node.end,
      inputIndex: index,
      matchStart,
      matchEnd: currentEnd,
      message,
    });
  };

  const result = (
    matched: boolean,
    error: string | null = null,
  ): ExecutionResult => ({
    steps,
    matched,
    match: matched ? input.slice(matchStart, currentEnd) : null,
    matchStart: matched ? matchStart : -1,
    matchEnd: matched ? currentEnd : -1,
    truncated,
    error,
  });

  try {
    if (!pattern) {
      return result(false, "Enter a regex pattern.");
    }

    const ast = parseRegex(pattern);

    const flags =
      (options.ignoreCase ? "i" : "") +
      (options.multiline ? "m" : "") +
      (options.dotAll ? "s" : "");

    const matchesCharacter = (node: RegexNode, character: string): boolean => {
      const source = pattern.slice(node.start, node.end);

      return new RegExp(`^(?:${source})$`, flags).test(character);
    };

    const isWord = (character: string | undefined) =>
      character !== undefined && /[A-Za-z0-9_]/.test(character);

    // A generator lets the engine enumerate alternatives
    // in backtracking order.
    function* walk(node: RegexNode, state: State): Generator<State> {
      const index = state.index;

      if (node.type === "sequence") {
        yield* walkSequence(node.children, 0, state);
        return;
      }

      if (node.type === "alternation") {
        for (const branch of node.branches) {
          emit("info", node, index, "Trying an alternative branch.");

          let succeeded = false;

          for (const next of walk(branch, state)) {
            succeeded = true;
            yield next;
          }

          if (!succeeded) {
            emit(
              "backtrack",
              node,
              index,
              "Alternative failed. Trying another branch.",
            );
          }
        }
        return;
      }

      if (node.type === "quantifier") {
        yield* repeat(node, state, 0);
        return;
      }

      if (node.type === "start") {
        const valid =
          index === 0 ||
          (options.multiline &&
            index > 0 &&
            /[\n\r\u2028\u2029]/.test(input[index - 1]!));

        emit(
          valid ? "match" : "mismatch",
          node,
          index,
          valid ? "Start anchor satisfied." : "Start anchor failed.",
        );

        if (valid) yield state;
        return;
      }

      if (node.type === "end") {
        const valid =
          index === input.length ||
          (index === input.length - 1 &&
            /[\n\r\u2028\u2029]/.test(input[index]!)) ||
          (options.multiline &&
            index < input.length &&
            /[\n\r\u2028\u2029]/.test(input[index]!));

        emit(
          valid ? "match" : "mismatch",
          node,
          index,
          valid ? "End anchor satisfied." : "End anchor failed.",
        );

        if (valid) yield state;
        return;
      }

      if (node.type === "wordBoundary" || node.type === "nonWordBoundary") {
        const boundary = isWord(input[index - 1]) !== isWord(input[index]);

        const valid = node.type === "wordBoundary" ? boundary : !boundary;

        emit(
          valid ? "match" : "mismatch",
          node,
          index,
          valid
            ? "Word boundary assertion satisfied."
            : "Word boundary assertion failed.",
        );

        if (valid) yield state;
        return;
      }

      const character = input[index];

      if (character === undefined) {
        emit("mismatch", node, index, "End of input reached.");
        return;
      }

      const valid = matchesCharacter(node, character);

      emit(
        valid ? "match" : "mismatch",
        node,
        index,
        valid
          ? `Matched ${JSON.stringify(character)}.`
          : `Character ${JSON.stringify(character)} did not match.`,
      );

      if (valid) {
        currentEnd = Math.max(currentEnd, index + 1);
        yield { index: index + 1 };
      }
    }

    function* walkSequence(
      nodes: RegexNode[],
      position: number,
      state: State,
    ): Generator<State> {
      if (position >= nodes.length) {
        yield state;
        return;
      }

      const node = nodes[position]!;

      for (const next of walk(node, state)) {
        let completed = false;

        for (const final of walkSequence(nodes, position + 1, next)) {
          completed = true;
          yield final;
        }

        if (!completed) {
          emit(
            "backtrack",
            node,
            next.index,
            "Later expression failed. Backtracking.",
          );
        }
      }
    }

    function* repeat(
      node: Extract<RegexNode, { type: "quantifier" }>,
      state: State,
      count: number,
    ): Generator<State> {
      const canStop = count >= node.min;
      const canContinue = count < node.max;

      if (!node.greedy && canStop) {
        yield state;
      }

      if (canContinue) {
        for (const next of walk(node.child, state)) {
          if (next.index === state.index) {
            // Prevent infinite repetition of empty matches.
            if (count + 1 >= node.min) {
              yield next;
            }
            continue;
          }

          yield* repeat(node, next, count + 1);

          emit(
            "backtrack",
            node,
            next.index,
            "Reconsidering the repetition count.",
          );
        }
      }

      if (node.greedy && canStop) {
        yield state;
      }
    }

    for (let start = 0; start <= input.length; start++) {
      matchStart = start;
      currentEnd = start;

      emit("start", ast, start, `Starting match attempt at index ${start}.`);

      for (const state of walk(ast, { index: start })) {
        currentEnd = state.index;

        emit("success", ast, state.index, "The pattern matched successfully.");

        return result(true);
      }
    }

    emit("failure", ast, input.length, "No match found in the input.");

    return result(false);
  } catch (error) {
    return result(
      false,
      error instanceof Error
        ? error.message
        : "Unable to visualize this pattern.",
    );
  }
}
