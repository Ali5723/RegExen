<script setup lang="ts">
const patternInput = ref<string>("");

const activatedFlags = ref<string[]>([]);

function isValidRegex(regexString: string) {
  if (patternInput.value === "") return false;

  try {
    new RegExp(regexString);
    return true;
  } catch {
    return false;
  }
}

const testInput = ref<string>("");
const testInputLines = computed(() => testInput.value.split("\n").length);
const testInputCharacters = computed(() => testInput.value.length);

const validateMatching = () => {
  if (!isValidRegex(patternInput.value)) return false;
  if (testInputCharacters.value === 0) return false;

  return true;
};

function matchPatternTest() {
  if (validateMatching() === false) return false;

  const mainRegex = new RegExp(
    patternInput.value,
    activatedFlags.value.join(""),
  );

  return testInput.value.match(mainRegex);
}

function getMatchMeta() {
  if (!validateMatching())
    return [] as Array<{ value: string; start: number; end: number }>;

  const flags = [...new Set([...activatedFlags.value, "g"])].join("");
  const regex = new RegExp(patternInput.value, flags);
  const matches: Array<{ value: string; start: number; end: number }> = [];

  let match: RegExpExecArray | null;

  while ((match = regex.exec(testInput.value)) !== null) {
    const value = match[0];
    const start = match.index;
    const end = start + value.length;

    matches.push({ value, start, end });

    if (value === "") {
      regex.lastIndex += 1;
    }
  }

  return matches;
}

const matchResults = ref<string[]>([]);
const matchRanges = ref<Array<{ start: number; end: number }>>([]);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const highlightedSegments = computed(() => {
  if (!validateMatching()) return [] as Array<{ start: number; end: number }>;

  const regexString = patternInput.value;
  const regexFlags = [...new Set([...activatedFlags.value, "g"])].join("");
  const regex = new RegExp(regexString, regexFlags);
  const segments: Array<{ start: number; end: number }> = [];

  let match: RegExpExecArray | null;

  while ((match = regex.exec(testInput.value)) !== null) {
    const matchedText = match[0];

    if (matchedText === "") {
      regex.lastIndex += 1;
      continue;
    }

    segments.push({
      start: match.index,
      end: match.index + matchedText.length,
    });

    if (match.index === regex.lastIndex) {
      regex.lastIndex += 1;
    }
  }

  return segments;
});

const highlightedInputHtml = computed(() => {
  if (!testInput.value) {
    return "<span class='text-muted-foreground/60'>Start typing in the test input to see matches.</span>";
  }

  if (highlightedSegments.value.length === 0) {
    return escapeHtml(testInput.value).replace(/\n/g, "<br>");
  }

  const input = testInput.value;
  let renderedHtml = "";
  let cursor = 0;

  for (const segment of highlightedSegments.value) {
    if (segment.start > cursor) {
      renderedHtml += escapeHtml(input.slice(cursor, segment.start));
    }

    renderedHtml += `<mark class="rounded-sm bg-amber-300/80 px-0.5 text-amber-950 shadow-[inset_0_0_0_1px_rgba(120,119,198,0.2)] dark:bg-amber-500/30 dark:text-amber-50">${escapeHtml(
      input.slice(segment.start, segment.end),
    )}</mark>`;

    cursor = segment.end;
  }

  if (cursor < input.length) {
    renderedHtml += escapeHtml(input.slice(cursor));
  }

  return renderedHtml.replace(/\n/g, "<br>");
});

watch(
  [patternInput, activatedFlags, testInput],
  () => {
    const result = matchPatternTest();
    const meta = getMatchMeta();

    if (result !== false) {
      matchResults.value = result ?? [];
    } else {
      matchResults.value = [];
    }

    matchRanges.value = meta.map(({ start, end }) => ({ start, end }));
  },
  { deep: true },
);

const matchEndScrollElement = ref<HTMLElement | null>(null);

function setMatchEndElement(element: Element | ComponentPublicInstance | null) {
  matchEndScrollElement.value = element instanceof HTMLElement ? element : null;
}

const scrollToMatchEnd = () => {
  matchEndScrollElement.value?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};
</script>

<template>
  <!-- Title -->
  <PageTitle
    :title="pagesList.tester.name"
    :description="pagesList.tester.description"
  />

  <!-- Pattern Input -->
  <PatternInput v-model="patternInput" />

  <!-- Flags Buttons -->
  <PatternFlags v-model="activatedFlags" />

  <!-- Pattern Validation -->
  <PatternValidator :pattern-input="patternInput" />

  <!-- Test Input -->
  <UiField class="gap-2.5">
    <UiFieldLabel for="text" class="section-title!"> Test Input </UiFieldLabel>

    <UiInputGroup
      class="overflow-hidden border-border bg-card focus-within:border-primary/60"
    >
      <UiInputGroupTextarea
        id="text"
        v-model="testInput"
        placeholder="Write the text you want to test..."
        aria-label="Text to test against the pattern"
        class="min-h-32 resize-y font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground sm:min-h-40"
      />
    </UiInputGroup>

    <div
      v-if="testInput"
      class="rounded-xl border border-dashed border-border bg-muted/40 p-3"
    >
      <div class="mb-2 flex items-center justify-between gap-2">
        <span
          class="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground"
        >
          Highlighted matches
        </span>
        <span
          class="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300"
        >
          {{ highlightedSegments.length }}
          {{ highlightedSegments.length === 1 ? "match" : "matches" }}
        </span>
      </div>

      <pre
        class="min-h-20 whitespace-pre-wrap wrap-break-word font-mono text-sm leading-relaxed text-foreground"
        v-html="highlightedInputHtml"
      />
    </div>

    <UiFieldDescription class="text-right text-xs text-muted-foreground">
      {{ testInputLines }} lines · {{ testInputCharacters }} characters
    </UiFieldDescription>
  </UiField>

  <!-- Match Results -->
  <UiField class="gap-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <UiFieldLabel class="section-title!"> Match Results </UiFieldLabel>

      <UiButton
        type="button"
        :disabled="matchResults.length === 0"
        class="inline-flex items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-500/15 disabled:cursor-default disabled:opacity-60 dark:text-emerald-400"
        @click="scrollToMatchEnd"
      >
        {{ matchResults.length }}
        {{ matchResults.length === 1 ? "match" : "matches" }}
      </UiButton>
    </div>

    <div class="overflow-hidden rounded-xl border border-border bg-card">
      <!-- Empty state -->
      <div
        v-if="matchResults.length === 0"
        class="flex min-h-28 flex-col items-center justify-center gap-2 px-4 py-6 text-center"
      >
        <span class="text-sm font-medium text-muted-foreground">
          No matches found
        </span>
        <span class="text-xs text-muted-foreground/75">
          Try changing your pattern or test input.
        </span>
      </div>

      <!-- Match list -->

      <UiScrollArea class="h-80 w-full">
        <ul class="divide-y divide-border">
          <li
            v-for="(item, index) in matchResults"
            :key="index"
            :ref="
              index + 1 === matchResults.length ? setMatchEndElement : undefined
            "
            class="group flex items-start gap-3 px-3 py-3 transition-colors hover:bg-accent/60 sm:px-4"
          >
            <span
              class="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-semibold text-primary"
            >
              {{ index + 1 }}
            </span>

            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-3">
                <code
                  class="min-w-0 flex-1 break-all font-mono text-sm leading-6 text-foreground"
                >
                  {{
                    item === "" || item === " " || item === "\n"
                      ? "[empty]"
                      : item
                  }}
                </code>

                <span
                  class="shrink-0 rounded-md border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground"
                >
                  chars {{ matchRanges[index]?.start ?? 0 }}-{{
                    matchRanges[index]?.end ?? 0
                  }}
                </span>
              </div>
            </div>
          </li>
        </ul>
      </UiScrollArea>
    </div>
  </UiField>
</template>
