import type { RegexNode } from "./types";

export function parseRegex(pattern: string): RegexNode {
  let index = 0;

  const fail = (message: string): never => {
    throw new Error(`${message} at position ${index}.`);
  };

  const sequence = (): RegexNode => {
    const start = index;
    const children: RegexNode[] = [];

    while (
      index < pattern.length &&
      pattern[index] !== ")" &&
      pattern[index] !== "|"
    ) {
      children.push(quantified());
    }

    return {
      type: "sequence",
      children,
      start,
      end: index,
    };
  };

  const expression = (): RegexNode => {
    const start = index;
    const branches: RegexNode[] = [sequence()];

    while (pattern[index] === "|") {
      index++;
      branches.push(sequence());
    }

    if (branches.length === 1) return branches[0]!;

    return {
      type: "alternation",
      branches,
      start,
      end: index,
    };
  };

  const atom = (): RegexNode => {
    const start = index;
    const char = pattern[index++];

    if (!char) fail("Unexpected end of pattern");

    if (char === "(") {
      if (pattern[index] === "?") {
        if (pattern.slice(index, index + 2) !== "?:") {
          fail("Lookarounds and special groups are not supported");
        }
        index += 2;
      } else {
        fail("Capturing groups are not supported yet. Use (?:...)");
      }

      const node = expression();

      if (pattern[index] !== ")") {
        fail("Unclosed group");
      }

      index++;
      return { ...node, start, end: index };
    }

    if (char === "[") {
      let escaped = false;

      while (index < pattern.length) {
        const current = pattern[index++]!;

        if (escaped) {
          escaped = false;
          continue;
        }

        if (current === "\\") {
          escaped = true;
          continue;
        }

        if (current === "]") {
          return {
            type: "characterClass",
            source: pattern.slice(start, index),
            start,
            end: index,
          };
        }
      }

      fail("Unclosed character class");
    }

    if (char === "\\") {
      const escaped = pattern[index++];

      if (escaped === undefined) {
        fail("Incomplete escape sequence");
      }

      // fail() throws, but explicitly narrow for strict indexed access.
      const escape = escaped as string;

      const escapeTypes: Record<string, RegexNode["type"]> = {
        d: "digit",
        D: "nonDigit",
        w: "word",
        W: "nonWord",
        s: "space",
        S: "nonSpace",
        b: "wordBoundary",
        B: "nonWordBoundary",
      };

      const type = escapeTypes[escape];

      if (type) {
        return { type, start, end: index } as RegexNode;
      }

      if (/^[1-9]$/.test(escape)) {
        fail("Backreferences are not supported");
      }

      if ("pPkKxuc".includes(escape)) {
        fail("This escape sequence is not supported yet");
      }

      const escapedLiterals: Record<string, string> = {
        n: "\n",
        r: "\r",
        t: "\t",
        f: "\f",
        v: "\v",
        "0": "\0",
      };

      if (escape in escapedLiterals || /[\\^$.*+?()[\]{}|/]/.test(escape)) {
        return {
          type: "literal",
          value: escapedLiterals[escape] ?? escape,
          start,
          end: index,
        };
      }

      fail(`Unsupported escape \\${escape}`);
    }

    if (char === ".") {
      return { type: "dot", start, end: index };
    }

    if (char === "^") {
      return { type: "start", start, end: index };
    }

    if (char === "$") {
      return { type: "end", start, end: index };
    }

    if ("*+?{}".includes(char!)) {
      fail("Quantifier without a target");
    }

    return {
      type: "literal",
      value: char!,
      start,
      end: index,
    };
  };

  const quantified = (): RegexNode => {
    const child = atom();
    const start = child.start;
    const char = pattern[index];

    if (!char || !"*+?{".includes(char)) return child;

    if (
      child.type === "start" ||
      child.type === "end" ||
      child.type === "wordBoundary" ||
      child.type === "nonWordBoundary"
    ) {
      fail("Assertions cannot be quantified");
    }

    let min = 0;
    let max = Infinity;

    if (char === "*") {
      index++;
    } else if (char === "+") {
      index++;
      min = 1;
    } else if (char === "?") {
      index++;
      max = 1;
    } else {
      const rest = pattern.slice(index);
      const match = rest.match(/^\{(\d+)(?:,(\d*))?\}/);

      if (match === null) {
        // JavaScript can interpret some malformed braces as
        // literals, but the visualizer deliberately rejects them.
        fail("Invalid quantifier");
      }

      const quantifierMatch = match!;
      min = Number(quantifierMatch[1]);
      max =
        quantifierMatch[2] === undefined
          ? min
          : quantifierMatch[2] === ""
            ? Infinity
            : Number(quantifierMatch[2]);

      if (
        !Number.isSafeInteger(min) ||
        (max !== Infinity && !Number.isSafeInteger(max)) ||
        max < min
      ) {
        fail("Invalid repetition range");
      }

      index += quantifierMatch[0].length;
    }

    let greedy = true;

    if (pattern[index] === "?") {
      greedy = false;
      index++;
    }

    if (pattern[index] === "+" || pattern[index] === "*") {
      fail("Possessive quantifiers are not supported");
    }

    return {
      type: "quantifier",
      child,
      min,
      max,
      greedy,
      start,
      end: index,
    };
  };

  const ast = expression();

  if (index !== pattern.length) {
    fail("Unexpected closing group or unsupported syntax");
  }

  return ast;
}
