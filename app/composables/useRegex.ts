export const useRegex = () => {
  const escapeDescriptions: Record<string, string> = {
    "\\d": "Matches any ASCII digit (0–9).",
    "\\D": "Matches any character that is not an ASCII digit.",
    "\\w": "Matches an ASCII word character (letter, digit, or underscore).",
    "\\W": "Matches a non-word character.",
    "\\s": "Matches a whitespace character.",
    "\\S": "Matches a non-whitespace character.",
    "\\b": "Matches a word boundary.",
    "\\B": "Matches a position that is not a word boundary.",
    "\\n": "Matches a newline character.",
    "\\r": "Matches a carriage return.",
    "\\t": "Matches a tab character.",
    "\\f": "Matches a form feed.",
    "\\v": "Matches a vertical tab.",
    "\\0": "Matches a null character.",
  };

  const specialDescriptions: Record<string, [string, string]> = {
    "^": [
      "Anchor",
      "Matches the beginning of the input (or line with the m flag).",
    ],
    $: ["Anchor", "Matches the end of the input (or line with the m flag)."],
    ".": [
      "Wildcard",
      "Matches any character except line terminators, unless the s flag is enabled.",
    ],
    "|": [
      "Alternation",
      "Matches either the expression on the left or the one on the right.",
    ],
    "*": ["Quantifier", "Repeats the preceding element zero or more times."],
    "+": ["Quantifier", "Repeats the preceding element one or more times."],
    "?": ["Quantifier", "Repeats the preceding element zero or one time."],
    "(": ["Group", "Starts a capturing group."],
    ")": ["Group", "Ends a group."],
  };

  function explainRegex(pattern: string): RegexExplanation {
    if (!pattern) {
      return { tokens: [], valid: true, error: null };
    }

    let error: string | null = null;

    try {
      new RegExp(pattern);
    } catch (err) {
      error =
        err instanceof Error ? err.message : "Invalid regular expression.";
    }

    const tokens: RegexToken[] = [];
    let index = 0;

    const add = (value: string, type: string, description: string) => {
      tokens.push({
        id: tokens.length,
        value,
        type,
        description,
        start: index,
        end: index + value.length,
      });

      index += value.length;
    };

    while (index < pattern.length) {
      const rest = pattern.slice(index);
      const char = pattern[index]!;

      // Character classes: [abc], [^abc], [a-z]
      if (char === "[") {
        let end = index + 1;
        let escaped = false;

        while (end < pattern.length) {
          const current = pattern[end]!;

          if (escaped) {
            escaped = false;
          } else if (current === "\\") {
            escaped = true;
          } else if (current === "]") {
            end++;
            break;
          }

          end++;
        }

        const value = pattern.slice(index, end);
        const negated = value.startsWith("[^");

        add(
          value,
          "Character Class",
          negated
            ? "Matches a character that is not included in this character class."
            : "Matches one character from the specified character class.",
        );
        continue;
      }

      // Unicode properties: \p{Letter}, \P{Number}
      const unicodeProperty = rest.match(/^\\[pP]\{[^}]+\}/);

      if (unicodeProperty) {
        const value = unicodeProperty[0];

        add(
          value,
          "Unicode Property",
          value.startsWith("\\P")
            ? "Matches a character outside the specified Unicode property (requires the u or v flag)."
            : "Matches a character with the specified Unicode property (requires the u or v flag).",
        );
        continue;
      }

      // Named backreferences: \k<name>
      const namedReference = rest.match(/^\\k<[^>]+>/);

      if (namedReference) {
        add(
          namedReference[0],
          "Backreference",
          "Matches the text previously captured by the named group.",
        );
        continue;
      }

      // Numeric backreferences: \1, \2...
      const numericReference = rest.match(/^\\[1-9][0-9]*/);

      if (numericReference) {
        add(
          numericReference[0],
          "Backreference",
          "References a numbered capturing group. Interpretation depends on the pattern and flags.",
        );
        continue;
      }

      // Hex, Unicode, and control escapes
      const encodedEscape = rest.match(
        /^\\(?:u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|c[A-Za-z])/,
      );

      if (encodedEscape) {
        add(
          encodedEscape[0],
          "Character Escape",
          "Represents a character using an encoded escape sequence.",
        );
        continue;
      }

      // Other escaped characters
      if (char === "\\") {
        const value = pattern.slice(index, index + 2);

        add(
          value,
          "Escape",
          escapeDescriptions[value] ??
            "Matches or represents an escaped character, depending on the regex syntax.",
        );
        continue;
      }

      // Named capturing groups
      const namedGroup = rest.match(/^\(\?<([A-Za-z_$][\w$]*)>/);

      if (namedGroup) {
        add(
          namedGroup[0],
          "Named Group",
          `Starts a capturing group named "${namedGroup[1]}".`,
        );
        continue;
      }

      // Lookarounds and special groups
      const groups: [string, string, string][] = [
        [
          "(?<=",
          "Positive Lookbehind",
          "Requires the preceding text to match without consuming it.",
        ],
        [
          "(?<!",
          "Negative Lookbehind",
          "Requires the preceding text not to match without consuming it.",
        ],
        [
          "(?=",
          "Positive Lookahead",
          "Requires the following text to match without consuming it.",
        ],
        [
          "(?!",
          "Negative Lookahead",
          "Requires the following text not to match without consuming it.",
        ],
        [
          "(?:",
          "Non-Capturing Group",
          "Groups expressions without creating a capture.",
        ],
      ];

      const group = groups.find(([prefix]) => rest.startsWith(prefix));

      if (group) {
        add(group[0], group[1], group[2]);
        continue;
      }

      // Quantifiers: {n}, {n,}, {n,m}, optionally lazy
      const range = rest.match(/^\{\d+(?:,\d*)?\}\??/);

      if (range) {
        add(
          range[0],
          "Quantifier",
          `Controls how many times the preceding element repeats${range[0].endsWith("?") ? " using lazy matching" : ""}.`,
        );
        continue;
      }

      // Lazy quantifiers
      const lazy = rest.match(/^[*+?]\?/);

      if (lazy) {
        add(
          lazy[0],
          "Lazy Quantifier",
          "Repeats the preceding element as few times as possible while allowing a match.",
        );
        continue;
      }

      // Standard regex operators
      if (specialDescriptions[char]) {
        const [type, description] = specialDescriptions[char];

        add(char, type, description);
        continue;
      }

      // Literal text (group consecutive characters)
      let end = index + 1;

      while (
        end < pattern.length &&
        !/[\\[\](){}*+?|.^$]/.test(pattern[end]!)
      ) {
        end++;
      }

      const value = pattern.slice(index, end);

      add(value, "Literal", `Matches the literal text "${value}".`);
    }

    return {
      tokens,
      valid: error === null,
      error,
    };
  }

  return { explainRegex };
};
