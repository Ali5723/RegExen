<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  ArrowRightLeft,
  Check,
  Copy,
  Download,
  Info,
  ListFilter,
  Replace,
  Search,
} from "@lucide/vue";

type Mode = "replace" | "extract";

type ExtractedMatch = {
  index: number;
  value: string;
  start: number;
  end: number;
  groups: (string | undefined)[];
  namedGroups: Record<string, string | undefined>;
};

const patternInput = ref<string>("");
const testString = ref("");
const flags = ref<string[]>([]);
const activatedFlags = flags;
const replacement = ref("");
const mode = ref<Mode>("replace");

const global = ref(true);

const copied = ref(false);
const search = ref("");

const validation = computed(() => {
  if (!patternInput.value) {
    return { valid: true, error: null as string | null };
  }

  try {
    new RegExp(patternInput.value, flags.value.join(""));
    return { valid: true, error: null as string | null };
  } catch (error) {
    return {
      valid: false,
      error:
        error instanceof Error ? error.message : "Invalid regular expression.",
    };
  }
});

const matches = computed<ExtractedMatch[]>(() => {
  if (!patternInput.value || !testString.value || !validation.value.valid) {
    return [];
  }

  try {
    const results: ExtractedMatch[] = [];

    const currentFlags = flags.value.join("");
    const scanFlags = flags.value.includes("g")
      ? currentFlags
      : `${currentFlags}g`;

    const scanner = new RegExp(patternInput.value, scanFlags);

    for (const match of testString.value.matchAll(scanner)) {
      results.push({
        index: results.length + 1,
        value: match[0],
        start: match.index,
        end: match.index + match[0].length,
        groups: match.slice(1),
        namedGroups: match.groups ? { ...match.groups } : {},
      });

      if (!global.value) break;

      if (results.length >= 1000) break;
    }

    return results;
  } catch {
    return [];
  }
});

const replaceResult = computed(() => {
  if (!patternInput.value || !validation.value.valid) {
    return testString.value;
  }

  try {
    const regex = new RegExp(patternInput.value, flags.value.join(""));

    return testString.value.replace(regex, replacement.value);
  } catch {
    return testString.value;
  }
});

const filteredMatches = computed(() => {
  const query = search.value.trim().toLowerCase();

  if (!query) return matches.value;

  return matches.value.filter((match) =>
    [
      match.value,
      ...match.groups.filter((value): value is string => value !== undefined),
      ...Object.values(match.namedGroups).filter(
        (value): value is string => value !== undefined,
      ),
    ].some((value) => value.toLowerCase().includes(query)),
  );
});

const totalGroups = computed(() =>
  matches.value.reduce(
    (total, match) =>
      total + match.groups.filter((group) => group !== undefined).length,
    0,
  ),
);

const hasChanges = computed(() => replaceResult.value !== testString.value);

const output = computed(() => {
  if (mode.value === "replace") return replaceResult.value;

  return matches.value.map((match) => match.value).join("\n");
});

const copyOutput = async () => {
  if (!output.value) return;

  try {
    await navigator.clipboard.writeText(output.value + allLove);
    copied.value = true;
  } catch {
    copied.value = false;
  }
};

watch([patternInput, testString, replacement, mode, flags], () => {
  copied.value = false;
});

const downloadOutput = () => {
  if (!output.value || !import.meta.client) return;

  const blob = new Blob([output.value], {
    type: "text/plain;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download =
    mode.value === "replace" ? "regexen-replaced.txt" : "regexen-extracted.txt";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};

const clearAll = () => {
  patternInput.value = "";
  testString.value = "";
  replacement.value = "";
  search.value = "";
  copied.value = false;
};
</script>

<template>
  <!-- Page title -->
  <PageTitle
    :title="pagesList.replace.name"
    :description="pagesList.replace.description"
  />

  <!-- Pattern -->
  <section aria-label="Regex pattern">
    <PatternInput v-model="patternInput" />
  </section>

  <!-- Flags Buttons -->
  <section aria-label="Regex flags">
    <PatternFlags v-model="activatedFlags" />
  </section>

  <!-- Validation -->
  <section aria-label="Pattern validation">
    <PatternValidator :pattern-input="patternInput" />
  </section>

  <!-- Mode selection -->
  <section aria-labelledby="operation-title">
    <UiCard class="flex flex-col gap-4">
      <UiCardHeader class="flex flex-col">
        <UiCardTitle id="operation-title" class="section-title!">
          Operation
        </UiCardTitle>

        <UiCardDescription class="section-label!">
          Choose how you want to process your text.
        </UiCardDescription>
      </UiCardHeader>

      <UiCardContent>
        <div
          class="grid grid-cols-2 gap-3"
          role="group"
          aria-label="Regex operation"
        >
          <UiButton
            type="button"
            :variant="mode === 'replace' ? 'default' : 'outline'"
            class="h-auto min-h-12 justify-center gap-2"
            :aria-pressed="mode === 'replace'"
            @click="mode = 'replace'"
          >
            <Replace class="size-4 shrink-0" aria-hidden="true" />
            Replace
          </UiButton>

          <UiButton
            type="button"
            :variant="mode === 'extract' ? 'default' : 'outline'"
            class="h-auto min-h-12 justify-center gap-2"
            :aria-pressed="mode === 'extract'"
            @click="mode = 'extract'"
          >
            <ListFilter class="size-4 shrink-0" aria-hidden="true" />
            Extract
          </UiButton>
        </div>
      </UiCardContent>
    </UiCard>
  </section>

  <!-- Text input -->
  <section aria-labelledby="input-text-title">
    <UiCard class="flex flex-col gap-4">
      <UiCardHeader class="flex flex-col gap-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="flex flex-col">
            <UiCardTitle id="input-text-title" class="section-title!">
              Input Text
            </UiCardTitle>

            <UiCardDescription class="section-label!">
              Enter the text you want to process.
            </UiCardDescription>
          </div>

          <UiButton
            variant="outline"
            size="sm"
            :disabled="!patternInput && !testString && !replacement"
            @click="clearAll"
          >
            Clear all
          </UiButton>
        </div>
      </UiCardHeader>

      <UiCardContent>
        <UiTextarea
          v-model="testString"
          aria-label="Input text"
          placeholder="Enter or paste your text here..."
          class="min-h-40 resize-y font-mono text-sm"
          spellcheck="false"
        />

        <div
          class="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"
        >
          <span>{{ testString.length }} characters</span>
          <span>{{ matches.length }} matches</span>
        </div>
      </UiCardContent>
    </UiCard>
  </section>

  <!-- Replacement input -->
  <section v-if="mode === 'replace'" aria-labelledby="replacement-title">
    <UiCard class="flex flex-col gap-4">
      <UiCardHeader class="flex flex-col">
        <UiCardTitle id="replacement-title" class="section-title!">
          Replacement
        </UiCardTitle>

        <UiCardDescription class="section-label!">
          Enter the replacement text. Use $& for the full match, $1 for a
          capturing group, or $&lt;name&gt; for a named group.
        </UiCardDescription>
      </UiCardHeader>

      <UiCardContent class="space-y-3">
        <UiTextarea
          v-model="replacement"
          aria-label="Replacement text"
          placeholder="Enter replacement text..."
          class="min-h-24 resize-y font-mono text-sm"
          spellcheck="false"
        />

        <div class="flex flex-wrap gap-2">
          <code
            v-for="item in ['$&', '$1', '$2', '$<name>', '$$']"
            :key="item"
            class="rounded-md border border-border bg-muted/30 px-2.5 py-1.5 font-mono text-xs text-muted-foreground"
          >
            {{ item }}
          </code>
        </div>
      </UiCardContent>
    </UiCard>
  </section>

  <!-- Empty state -->
  <UiCard v-if="!patternInput || !testString" class="border-dashed">
    <UiCardContent
      class="flex min-h-64 flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <div class="rounded-xl bg-primary/10 p-4 text-primary">
        <ArrowRightLeft class="size-7" aria-hidden="true" />
      </div>

      <div class="space-y-2">
        <h2 class="text-lg font-semibold">
          {{ mode === "replace" ? "Transform your text" : "Extract matches" }}
        </h2>

        <p class="max-w-md text-sm text-muted-foreground">
          Enter a regex pattern and some input text to
          {{
            mode === "replace"
              ? "see the replacement result"
              : "extract matching values and capture groups"
          }}.
        </p>
      </div>
    </UiCardContent>
  </UiCard>

  <template v-else>
    <!-- Overview -->
    <section aria-labelledby="results-overview">
      <UiCard class="flex flex-col gap-4">
        <UiCardHeader class="flex flex-col">
          <UiCardTitle id="results-overview" class="section-title!">
            Results Overview
          </UiCardTitle>

          <UiCardDescription class="section-label!">
            A quick summary of your regex operation.
          </UiCardDescription>
        </UiCardHeader>

        <UiCardContent>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div class="rounded-lg border border-border bg-muted/30 p-4">
              <p class="text-xs text-muted-foreground">Matches</p>

              <p class="mt-1 text-2xl font-semibold tabular-nums">
                {{ matches.length }}
              </p>
            </div>

            <div class="rounded-lg border border-border bg-muted/30 p-4">
              <p class="text-xs text-muted-foreground">
                {{ mode === "replace" ? "Output length" : "Captured groups" }}
              </p>

              <p class="mt-1 text-2xl font-semibold tabular-nums">
                {{ mode === "replace" ? replaceResult.length : totalGroups }}
              </p>
            </div>

            <div
              class="col-span-2 rounded-lg border border-border bg-muted/30 p-4 sm:col-span-1"
            >
              <p class="text-xs text-muted-foreground">
                {{ mode === "replace" ? "Text changed" : "Input length" }}
              </p>

              <p class="mt-1 text-2xl font-semibold tabular-nums">
                {{
                  mode === "replace"
                    ? hasChanges
                      ? "Yes"
                      : "No"
                    : testString.length
                }}
              </p>
            </div>
          </div>
        </UiCardContent>
      </UiCard>
    </section>

    <!-- Output -->
    <section aria-labelledby="output-title">
      <UiCard class="flex flex-col gap-4">
        <UiCardHeader class="flex flex-col gap-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="flex flex-col">
              <UiCardTitle id="output-title" class="section-title!">
                {{
                  mode === "replace" ? "Replacement Result" : "Extracted Text"
                }}
              </UiCardTitle>

              <UiCardDescription class="section-label!">
                {{
                  mode === "replace"
                    ? "Preview the transformed text."
                    : "View all extracted matches, one per line."
                }}
              </UiCardDescription>
            </div>

            <div class="flex flex-wrap gap-2">
              <UiButton
                variant="outline"
                size="sm"
                :disabled="!output || !validation.valid"
                @click="copyOutput"
              >
                <Check v-if="copied" class="size-4" aria-hidden="true" />

                <Copy v-else class="size-4" aria-hidden="true" />

                {{ copied ? "Copied" : "Copy" }}
              </UiButton>

              <UiButton
                variant="outline"
                size="sm"
                :disabled="!output || !validation.valid"
                @click="downloadOutput"
              >
                <Download class="size-4" aria-hidden="true" />
                Download
              </UiButton>
            </div>
          </div>
        </UiCardHeader>

        <UiCardContent>
          <div
            v-if="!validation.valid"
            role="alert"
            class="mb-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-muted-foreground"
          >
            <Info
              class="mt-0.5 size-4 shrink-0 text-destructive"
              aria-hidden="true"
            />
            <p>{{ validation.error }}</p>
          </div>

          <UiTextarea
            :model-value="validation.valid ? output : ''"
            readonly
            aria-label="Regex operation output"
            placeholder="Your output will appear here..."
            class="min-h-48 resize-y font-mono text-sm"
            spellcheck="false"
          />

          <p class="mt-3 text-xs text-muted-foreground" aria-live="polite">
            {{ validation.valid ? output.length : 0 }} output characters
          </p>
        </UiCardContent>
      </UiCard>
    </section>

    <!-- Extracted matches -->
    <section
      v-if="mode === 'extract'"
      aria-labelledby="extracted-matches-title"
    >
      <UiCard class="flex flex-col gap-4">
        <UiCardHeader class="flex flex-col gap-4">
          <div class="flex flex-col">
            <UiCardTitle id="extracted-matches-title" class="section-title!">
              Extracted Matches
            </UiCardTitle>

            <UiCardDescription class="section-label!">
              Inspect matched text, positions, and capturing groups.
            </UiCardDescription>
          </div>

          <div class="relative">
            <Search
              class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />

            <UiInput
              v-model="search"
              aria-label="Search extracted matches"
              placeholder="Search matches or captured values..."
              class="pl-9"
            />
          </div>
        </UiCardHeader>

        <UiCardContent class="space-y-3">
          <p class="text-xs text-muted-foreground" aria-live="polite">
            Showing {{ filteredMatches.length }} of {{ matches.length }} matches
          </p>

          <div
            v-if="filteredMatches.length"
            class="overflow-hidden rounded-lg border border-border"
          >
            <div
              v-for="(match, index) in filteredMatches"
              :key="`${match.start}-${match.index}`"
              class="flex flex-col gap-3 p-4"
              :class="{
                'border-b border-border': index !== filteredMatches.length - 1,
              }"
            >
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex min-w-0 items-center gap-3">
                  <span
                    class="w-5 shrink-0 text-xs tabular-nums text-muted-foreground"
                    aria-hidden="true"
                  >
                    {{ match.index }}
                  </span>

                  <code
                    class="min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-md bg-primary/10 px-2.5 py-1.5 font-mono text-sm font-semibold text-primary"
                  >
                    {{ match.value || "(empty match)" }}
                  </code>
                </div>

                <span
                  class="shrink-0 text-xs tabular-nums text-muted-foreground"
                  :aria-label="`Characters ${match.start + 1} through ${match.end}`"
                >
                  {{ match.start }}–{{ match.end }}
                </span>
              </div>

              <!-- Capturing groups -->
              <div v-if="match.groups.length" class="flex flex-wrap gap-2 pl-8">
                <div
                  v-for="(group, groupIndex) in match.groups"
                  :key="groupIndex"
                  class="flex min-w-0 items-center gap-2 rounded-md border border-border bg-muted/30 px-2.5 py-1.5"
                >
                  <span class="text-xs text-muted-foreground">
                    Group {{ groupIndex + 1 }}
                  </span>

                  <code class="max-w-40 truncate font-mono text-xs">
                    {{ group ?? "(unmatched)" }}
                  </code>
                </div>
              </div>

              <!-- Named groups -->
              <div
                v-if="Object.keys(match.namedGroups).length"
                class="flex flex-wrap gap-2 pl-8"
              >
                <div
                  v-for="(value, name) in match.namedGroups"
                  :key="name"
                  class="flex min-w-0 items-center gap-2 rounded-md border border-border bg-muted/30 px-2.5 py-1.5"
                >
                  <span class="text-xs text-muted-foreground">
                    {{ name }}
                  </span>

                  <code class="max-w-40 truncate font-mono text-xs">
                    {{ value ?? "(unmatched)" }}
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div
            v-else
            class="rounded-lg border border-dashed border-border p-8 text-center"
          >
            <p class="text-sm text-muted-foreground">
              {{
                matches.length
                  ? "No matches match your search."
                  : "No matches found for this pattern."
              }}
            </p>
          </div>
        </UiCardContent>
      </UiCard>
    </section>

    <!-- Help -->
    <PageHelp
      text="This tool uses the JavaScript RegExp engine. Replacement supports
        JavaScript substitution patterns, including $&, $1, $2, $&lt;name&gt;,
        and $$. Extraction displays matched text and capturing groups. Results
        are limited to the first 1,000 matches in the match list to keep the
        interface responsive."
    />
  </template>
</template>
