<script setup lang="ts">
import { computed, ref } from "vue";
import {
  BookOpen,
  Check,
  Copy,
  Search,
  X,
} from "@lucide/vue";

type CheatItem = {
  syntax: string;
  name: string;
  description: string;
  example: string;
  exampleDescription: string;
};

type CheatCategory = {
  id: string;
  title: string;
  description: string;
  items: CheatItem[];
};

const search = ref("");
const activeCategory = ref("all");
const copiedSyntax = ref<string | null>(null);

const categories: CheatCategory[] = [
  {
    id: "characters",
    title: "Character Classes",
    description: "Match specific characters or groups of characters.",
    items: [
      {
        syntax: ".",
        name: "Any Character",
        description:
          "Matches any character except line terminators, unless the s flag is enabled.",
        example: "a.c",
        exampleDescription: "Matches abc, a1c, a-c",
      },
      {
        syntax: "\\d",
        name: "Digit",
        description: "Matches an ASCII digit from 0 to 9.",
        example: "\\d+",
        exampleDescription: "Matches 123 in abc123",
      },
      {
        syntax: "\\D",
        name: "Non-Digit",
        description: "Matches any character that is not an ASCII digit.",
        example: "\\D+",
        exampleDescription: "Matches abc in abc123",
      },
      {
        syntax: "\\w",
        name: "Word Character",
        description:
          "Matches ASCII letters, digits, and underscores. Unicode case folding can extend this with the i and u flags.",
        example: "\\w+",
        exampleDescription: "Matches hello_123",
      },
      {
        syntax: "\\W",
        name: "Non-Word Character",
        description: "Matches characters outside the word character class.",
        example: "\\W+",
        exampleDescription: "Matches spaces and punctuation",
      },
      {
        syntax: "\\s",
        name: "Whitespace",
        description:
          "Matches whitespace characters, including spaces, tabs, and line breaks.",
        example: "\\s+",
        exampleDescription: "Matches the space in Hello World",
      },
      {
        syntax: "\\S",
        name: "Non-Whitespace",
        description: "Matches any non-whitespace character.",
        example: "\\S+",
        exampleDescription: "Matches Hello in Hello World",
      },
      {
        syntax: "[abc]",
        name: "Character Set",
        description: "Matches one character from the specified set.",
        example: "[aeiou]",
        exampleDescription: "Matches vowels",
      },
      {
        syntax: "[^abc]",
        name: "Negated Set",
        description: "Matches one character not included in the specified set.",
        example: "[^0-9]+",
        exampleDescription: "Matches non-digit sequences",
      },
      {
        syntax: "[a-z]",
        name: "Character Range",
        description: "Matches one character within the specified range.",
        example: "[A-Z]+",
        exampleDescription: "Matches uppercase ASCII letters",
      },
    ],
  },
  {
    id: "anchors",
    title: "Anchors & Boundaries",
    description: "Match positions rather than characters.",
    items: [
      {
        syntax: "^",
        name: "Start of Input",
        description:
          "Matches the start of the input, or the start of a line with the m flag.",
        example: "^Hello",
        exampleDescription: "Matches Hello at the beginning",
      },
      {
        syntax: "$",
        name: "End of Input",
        description:
          "Matches the end of the input, or the end of a line with the m flag. It can also match before a final line terminator.",
        example: "world$",
        exampleDescription: "Matches world at the end",
      },
      {
        syntax: "\\b",
        name: "Word Boundary",
        description:
          "Matches a boundary between a word character and a non-word character.",
        example: "\\bcat\\b",
        exampleDescription: "Matches cat but not category",
      },
      {
        syntax: "\\B",
        name: "Non-Word Boundary",
        description: "Matches a position that is not a word boundary.",
        example: "\\Bcat\\B",
        exampleDescription: "Matches cat inside scattered",
      },
    ],
  },
  {
    id: "quantifiers",
    title: "Quantifiers",
    description: "Control how many times a pattern can repeat.",
    items: [
      {
        syntax: "*",
        name: "Zero or More",
        description: "Matches the preceding element zero or more times.",
        example: "ab*c",
        exampleDescription: "Matches ac, abc, abbc",
      },
      {
        syntax: "+",
        name: "One or More",
        description: "Matches the preceding element one or more times.",
        example: "ab+c",
        exampleDescription: "Matches abc and abbc, but not ac",
      },
      {
        syntax: "?",
        name: "Zero or One",
        description: "Makes the preceding element optional.",
        example: "colou?r",
        exampleDescription: "Matches color and colour",
      },
      {
        syntax: "{n}",
        name: "Exact Count",
        description: "Matches the preceding element exactly n times.",
        example: "\\d{4}",
        exampleDescription: "Matches four consecutive digits",
      },
      {
        syntax: "{n,}",
        name: "Minimum Count",
        description: "Matches the preceding element at least n times.",
        example: "\\d{2,}",
        exampleDescription: "Matches two or more digits",
      },
      {
        syntax: "{n,m}",
        name: "Range Count",
        description: "Matches the preceding element between n and m times.",
        example: "\\d{2,4}",
        exampleDescription: "Matches two to four digits",
      },
      {
        syntax: "*?",
        name: "Lazy Zero or More",
        description:
          "Matches as few repetitions as possible while allowing the pattern to succeed.",
        example: "<.*?>",
        exampleDescription:
          "Matches individual tags instead of spanning multiple tags",
      },
      {
        syntax: "+?",
        name: "Lazy One or More",
        description: "Matches one or more repetitions, preferring fewer.",
        example: "a+?",
        exampleDescription: "Initially matches one a",
      },
      {
        syntax: "??",
        name: "Lazy Optional",
        description: "Prefers zero repetitions, but can match one if needed.",
        example: "colou??r",
        exampleDescription:
          "Matches color and colour, preferring the shorter choice",
      },
    ],
  },
  {
    id: "groups",
    title: "Groups & Alternation",
    description: "Group expressions, capture values, and define alternatives.",
    items: [
      {
        syntax: "(abc)",
        name: "Capturing Group",
        description: "Groups a pattern and captures the matched substring.",
        example: "(\\d{4})-(\\d{2})",
        exampleDescription: "Captures year and month separately",
      },
      {
        syntax: "(?:abc)",
        name: "Non-Capturing Group",
        description: "Groups a pattern without creating a capture.",
        example: "(?:https?|ftp)",
        exampleDescription: "Matches http, https, or ftp",
      },
      {
        syntax: "(?<name>abc)",
        name: "Named Capturing Group",
        description: "Captures a matched substring under a specified name.",
        example: "(?<year>\\d{4})",
        exampleDescription: "Captures a year as year",
      },
      {
        syntax: "a|b",
        name: "Alternation",
        description:
          "Matches either the expression on the left or the expression on the right.",
        example: "cat|dog",
        exampleDescription: "Matches cat or dog",
      },
      {
        syntax: "\\1",
        name: "Numeric Backreference",
        description:
          "Matches the same text captured by the corresponding numbered group.",
        example: "(\\w+)\\s+\\1",
        exampleDescription: "Matches repeated words such as hello hello",
      },
      {
        syntax: "\\k<name>",
        name: "Named Backreference",
        description: "Matches the same text captured by a named group.",
        example: "(?<word>\\w+)\\s+\\k<word>",
        exampleDescription: "Matches repeated words using a named group",
      },
    ],
  },
  {
    id: "lookarounds",
    title: "Lookarounds",
    description: "Check surrounding text without consuming it.",
    items: [
      {
        syntax: "(?=abc)",
        name: "Positive Lookahead",
        description:
          "Requires the following text to match the specified pattern.",
        example: "\\d+(?=px)",
        exampleDescription: "Matches 20 in 20px",
      },
      {
        syntax: "(?!abc)",
        name: "Negative Lookahead",
        description:
          "Requires the following text not to match the specified pattern.",
        example: "foo(?!bar)",
        exampleDescription: "Matches foo when it is not followed by bar",
      },
      {
        syntax: "(?<=abc)",
        name: "Positive Lookbehind",
        description:
          "Requires the preceding text to match the specified pattern.",
        example: "(?<=\\$)\\d+",
        exampleDescription: "Matches 100 in $100",
      },
      {
        syntax: "(?<!abc)",
        name: "Negative Lookbehind",
        description:
          "Requires the preceding text not to match the specified pattern.",
        example: "(?<!\\$)\\b\\d+",
        exampleDescription: "Matches numbers not immediately preceded by $",
      },
    ],
  },
  {
    id: "escapes",
    title: "Escapes & Special Characters",
    description: "Match special characters and character escapes.",
    items: [
      {
        syntax: "\\.",
        name: "Literal Dot",
        description: "Matches a period instead of treating it as a wildcard.",
        example: "example\\.com",
        exampleDescription: "Matches example.com literally",
      },
      {
        syntax: "\\\\",
        name: "Literal Backslash",
        description: "Matches a backslash character.",
        example: "C:\\\\Users",
        exampleDescription: "Matches C:\\Users",
      },
      {
        syntax: "\\n",
        name: "Newline",
        description: "Matches a line feed character.",
        example: "Hello\\nWorld",
        exampleDescription: "Matches text separated by a newline",
      },
      {
        syntax: "\\t",
        name: "Tab",
        description: "Matches a horizontal tab character.",
        example: "\\t+",
        exampleDescription: "Matches consecutive tabs",
      },
      {
        syntax: "\\r",
        name: "Carriage Return",
        description: "Matches a carriage return character.",
        example: "\\r\\n",
        exampleDescription: "Matches Windows-style line endings",
      },
      {
        syntax: "\\xHH",
        name: "Hex Escape",
        description:
          "Matches a character specified by a two-digit hexadecimal code.",
        example: "\\x41",
        exampleDescription: "Matches A",
      },
      {
        syntax: "\\uHHHH",
        name: "Unicode Escape",
        description:
          "Matches a character specified by four hexadecimal digits.",
        example: "\\u0041",
        exampleDescription: "Matches A",
      },
      {
        syntax: "\\u{H}",
        name: "Unicode Code Point",
        description:
          "Matches a Unicode code point when the u or v flag is enabled.",
        example: "\\u{1F600}",
        exampleDescription: "Matches 😀 with the u or v flag",
      },
      {
        syntax: "\\p{L}",
        name: "Unicode Property",
        description: "Matches a Unicode letter with the u or v flag.",
        example: "\\p{L}+",
        exampleDescription:
          "Matches sequences of letters from different scripts",
      },
      {
        syntax: "\\P{L}",
        name: "Negated Unicode Property",
        description:
          "Matches characters outside the Unicode Letter property with the u or v flag.",
        example: "\\P{L}+",
        exampleDescription: "Matches non-letter sequences",
      },
    ],
  },
  {
    id: "flags",
    title: "Regex Flags",
    description: "Change how the JavaScript regex engine processes patterns.",
    items: [
      {
        syntax: "g",
        name: "Global",
        description:
          "Finds all matches instead of stopping after the first in supported operations.",
        example: "/cat/g",
        exampleDescription: "Finds every cat in a string",
      },
      {
        syntax: "i",
        name: "Ignore Case",
        description: "Enables case-insensitive matching.",
        example: "/hello/i",
        exampleDescription: "Matches hello, Hello, HELLO",
      },
      {
        syntax: "m",
        name: "Multiline",
        description: "Changes ^ and $ to recognize line boundaries.",
        example: "/^hello/m",
        exampleDescription: "Matches hello at the start of a line",
      },
      {
        syntax: "s",
        name: "Dot All",
        description: "Allows the dot character to match line terminators.",
        example: "/a.b/s",
        exampleDescription: "Matches a and b separated by a newline",
      },
      {
        syntax: "u",
        name: "Unicode",
        description: "Enables Unicode-aware matching and code point escapes.",
        example: "/\\u{1F600}/u",
        exampleDescription: "Matches 😀",
      },
      {
        syntax: "v",
        name: "Unicode Sets",
        description:
          "Enables Unicode-aware matching with enhanced character set operations.",
        example: "/[\\p{L}&&\\p{Script=Greek}]/v",
        exampleDescription: "Matches a Greek letter",
      },
      {
        syntax: "y",
        name: "Sticky",
        description:
          "Requires a match to begin exactly at the regex lastIndex.",
        example: "/\\d+/y",
        exampleDescription: "Matches digits starting at lastIndex",
      },
      {
        syntax: "d",
        name: "Has Indices",
        description:
          "Adds start and end indices for matches and capturing groups.",
        example: "/(cat)/d",
        exampleDescription: "Provides match.indices",
      },
    ],
  },
  {
    id: "replacement",
    title: "Replacement Tokens",
    description: "Use captured values and matched text in String.replace().",
    items: [
      {
        syntax: "$&",
        name: "Full Match",
        description: "Inserts the entire matched substring.",
        example: "[$&]",
        exampleDescription: "Wraps each match in brackets",
      },
      {
        syntax: "$1",
        name: "First Capturing Group",
        description: "Inserts the text captured by the first group.",
        example: "$2 $1",
        exampleDescription: "Swaps two captured words",
      },
      {
        syntax: "$2",
        name: "Second Capturing Group",
        description: "Inserts the text captured by the second group.",
        example: "$2, $1",
        exampleDescription: "Reorders two captured values",
      },
      {
        syntax: "$<name>",
        name: "Named Capturing Group",
        description: "Inserts the value captured by a named group.",
        example: "$<last>, $<first>",
        exampleDescription: "Reorders named captures",
      },
      {
        syntax: "$$",
        name: "Literal Dollar Sign",
        description: "Inserts a literal dollar sign.",
        example: "$$100",
        exampleDescription: "Produces $100",
      },
      {
        syntax: "$`",
        name: "Before Match",
        description:
          "Inserts the part of the original string before the match.",
        example: "$`",
        exampleDescription: "Reuses text preceding the match",
      },
      {
        syntax: "$'",
        name: "After Match",
        description: "Inserts the part of the original string after the match.",
        example: "$'",
        exampleDescription: "Reuses text following the match",
      },
    ],
  },
];

const categoryOptions = computed(() => [
  { id: "all", title: "All Categories" },
  ...categories.map((category) => ({
    id: category.id,
    title: category.title,
  })),
]);

const filteredCategories = computed(() => {
  const query = search.value.trim().toLowerCase();

  return categories
    .filter(
      (category) =>
        activeCategory.value === "all" || category.id === activeCategory.value,
    )
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => {
        if (!query) return true;

        return [
          item.syntax,
          item.name,
          item.description,
          item.example,
          item.exampleDescription,
          category.title,
        ].some((value) => value.toLowerCase().includes(query));
      }),
    }))
    .filter((category) => category.items.length > 0);
});

const totalItems = computed(() =>
  categories.reduce((total, category) => total + category.items.length, 0),
);

const visibleItems = computed(() =>
  filteredCategories.value.reduce(
    (total, category) => total + category.items.length,
    0,
  ),
);

const copySyntax = async (syntax: string) => {
  try {
    await navigator.clipboard.writeText(syntax + allLove);
    copiedSyntax.value = syntax;
  } catch {
    copiedSyntax.value = null;
  }
};

const clearFilters = () => {
  search.value = "";
  activeCategory.value = "all";
};
</script>

<template>
  <!-- Page title -->
  <PageTitle
    :title="pagesList.cheatsheet.name"
    :description="pagesList.cheatsheet.description"
  />

  <!-- Search and filters -->
  <section aria-labelledby="cheatsheet-search-title">
    <UiCard class="flex flex-col gap-4">
      <UiCardHeader class="flex flex-col">
        <UiCardTitle id="cheatsheet-search-title" class="section-title!">
          Explore Regex Syntax
        </UiCardTitle>

        <UiCardDescription class="section-label!">
          Search expressions, operators, and examples to quickly find the syntax
          you need.
        </UiCardDescription>
      </UiCardHeader>

      <UiCardContent class="space-y-4">
        <!-- Search -->
        <div class="relative">
          <Search
            class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />

          <UiInput
            v-model="search"
            aria-label="Search regex cheatsheet"
            placeholder="Search syntax, names, or examples..."
            class="pr-10 pl-9"
          />

          <UiButton
            v-if="search"
            variant="ghost"
            size="icon"
            class="absolute top-1/2 right-1 size-7 -translate-y-1/2"
            aria-label="Clear search"
            @click="search = ''"
          >
            <X class="size-4" aria-hidden="true" />
          </UiButton>
        </div>

        <!-- Categories -->
        <div
          class="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter regex syntax by category"
        >
          <UiButton
            v-for="category in categoryOptions"
            :key="category.id"
            size="sm"
            :variant="activeCategory === category.id ? 'default' : 'outline'"
            :aria-pressed="activeCategory === category.id"
            @click="activeCategory = category.id"
          >
            {{ category.title }}
          </UiButton>
        </div>

        <!-- Results count -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-xs text-muted-foreground" aria-live="polite">
            Showing {{ visibleItems }} of {{ totalItems }} syntax references
          </p>

          <UiButton
            v-if="search || activeCategory !== 'all'"
            variant="ghost"
            size="sm"
            class="text-muted-foreground"
            @click="clearFilters"
          >
            <X class="size-4" aria-hidden="true" />
            Clear filters
          </UiButton>
        </div>
      </UiCardContent>
    </UiCard>
  </section>

  <!-- Categories -->
  <template v-if="filteredCategories.length">
    <section
      v-for="category in filteredCategories"
      :key="category.id"
      :aria-labelledby="`category-${category.id}`"
    >
      <UiCard class="flex flex-col gap-4">
        <UiCardHeader class="flex flex-col">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="flex flex-col">
              <UiCardTitle
                :id="`category-${category.id}`"
                class="section-title!"
              >
                {{ category.title }}
              </UiCardTitle>

              <UiCardDescription class="section-label!">
                {{ category.description }}
              </UiCardDescription>
            </div>

            <span
              class="rounded-md border border-border bg-muted/30 px-2.5 py-1 text-xs tabular-nums text-muted-foreground"
            >
              {{ category.items.length }}
              {{ category.items.length === 1 ? "item" : "items" }}
            </span>
          </div>
        </UiCardHeader>

        <UiCardContent>
          <div class="overflow-hidden rounded-lg border border-border">
            <div
              v-for="(item, index) in category.items"
              :key="`${category.id}-${item.syntax}`"
              class="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4"
              :class="{
                'border-b border-border': index !== category.items.length - 1,
              }"
            >
              <!-- Syntax -->
              <div
                class="flex shrink-0 items-center justify-between gap-2 sm:w-36 sm:justify-start"
              >
                <code
                  class="min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-md bg-primary/10 px-2.5 py-1.5 font-mono text-sm font-semibold text-primary"
                  :title="item.syntax"
                >
                  {{ item.syntax }}
                </code>

                <UiButton
                  variant="ghost"
                  size="icon"
                  class="size-8 shrink-0 sm:hidden"
                  :aria-label="`Copy ${item.name} syntax`"
                  :title="
                    copiedSyntax === item.syntax ? 'Copied' : 'Copy syntax'
                  "
                  @click="copySyntax(item.syntax)"
                >
                  <Check
                    v-if="copiedSyntax === item.syntax"
                    class="size-4"
                    aria-hidden="true"
                  />

                  <Copy v-else class="size-4" aria-hidden="true" />
                </UiButton>
              </div>

              <!-- Description -->
              <div class="min-w-0 flex-1 space-y-2">
                <div class="space-y-1.5">
                  <p class="label">
                    {{ item.name }}
                  </p>

                  <p class="text-sm leading-relaxed text-muted-foreground">
                    {{ item.description }}
                  </p>
                </div>

                <!-- Example -->
                <div
                  class="space-y-1.5 rounded-md border border-border bg-muted/30 p-3"
                >
                  <p class="text-xs font-medium text-muted-foreground">
                    Example
                  </p>

                  <code
                    class="block overflow-x-auto whitespace-pre font-mono text-sm text-foreground"
                  >
                    {{ item.example }}
                  </code>

                  <p class="text-xs leading-relaxed text-muted-foreground">
                    {{ item.exampleDescription }}
                  </p>
                </div>
              </div>

              <!-- Copy -->
              <UiButton
                variant="ghost"
                size="icon"
                class="hidden size-8 shrink-0 sm:inline-flex"
                :aria-label="`Copy ${item.name} syntax`"
                :title="copiedSyntax === item.syntax ? 'Copied' : 'Copy syntax'"
                @click="copySyntax(item.syntax)"
              >
                <Check
                  v-if="copiedSyntax === item.syntax"
                  class="size-4"
                  aria-hidden="true"
                />

                <Copy v-else class="size-4" aria-hidden="true" />
              </UiButton>
            </div>
          </div>
        </UiCardContent>
      </UiCard>
    </section>
  </template>

  <!-- No results -->
  <UiCard v-else class="border-dashed">
    <UiCardContent
      class="flex min-h-64 flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <div class="rounded-xl bg-primary/10 p-4 text-primary">
        <BookOpen class="size-7" aria-hidden="true" />
      </div>

      <div class="space-y-2">
        <h2 class="text-lg font-semibold">No syntax found</h2>

        <p class="max-w-md text-sm text-muted-foreground">
          No regex references match your current search or category. Try another
          keyword or clear your filters.
        </p>
      </div>

      <UiButton variant="outline" size="sm" @click="clearFilters">
        <X class="size-4" aria-hidden="true" />
        Clear filters
      </UiButton>
    </UiCardContent>
  </UiCard>

  <!-- Help -->
  <PageHelp
    text="This cheatsheet covers JavaScript regular expression syntax.
      Some features require specific flags or modern JavaScript
      environments. Replacement tokens are used in
      String.replace(), not inside the regex pattern itself.
      Backslashes are shown as they appear in regex patterns;
      JavaScript string literals may require additional escaping."
  />
</template>
