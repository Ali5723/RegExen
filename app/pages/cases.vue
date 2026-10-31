<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  FlaskConical,
  Info,
  Play,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Upload,
  XCircle,
} from "@lucide/vue";

type ExpectedResult = "match" | "no-match";
type ResultFilter = "all" | "passed" | "failed";

type TestCase = {
  id: string;
  input: string;
  expected: ExpectedResult;
};

type TestResult = TestCase & {
  actual: boolean | null;
  passed: boolean;
  error: string | null;
};

type SavedTestCases = {
  version: 1;
  cases: TestCase[];
};

const STORAGE_KEY = "regexen-test-cases";

const patternInput = ref<string>("");
const testCases = ref<TestCase[]>([]);
const search = ref("");
const filter = ref<ResultFilter>("all");

const autoRun = ref(true);
const hasRun = ref(false);
const copied = ref(false);
const importError = ref("");
const fileInput = ref<HTMLInputElement | null>(null);

const createId = () => {
  return crypto.randomUUID();
};

const createCase = (
  input = "",
  expected: ExpectedResult = "match",
): TestCase => ({
  id: createId(),
  input,
  expected,
});

const defaultCases = (): TestCase[] => [
  createCase("Ali_123", "match"),
  createCase("Ahmed", "match"),
  createCase("ab", "no-match"),
  createCase("123Ali", "no-match"),
  createCase("Ali@123", "no-match"),
];

const regexValidation = computed(() => {
  if (!patternInput.value) {
    return {
      valid: false,
      error: null as string | null,
    };
  }

  try {
    new RegExp(patternInput.value);

    return {
      valid: true,
      error: null as string | null,
    };
  } catch (error) {
    return {
      valid: false,
      error:
        error instanceof Error ? error.message : "Invalid regular expression.",
    };
  }
});

const evaluateCase = (testCase: TestCase): TestResult => {
  if (!regexValidation.value.valid) {
    return {
      ...testCase,
      actual: null,
      passed: false,
      error: regexValidation.value.error,
    };
  }

  try {
    // Create a fresh RegExp for each case to avoid
    // stateful lastIndex behavior.
    const regex = new RegExp(patternInput.value);

    const actual = regex.test(testCase.input);
    const expected = testCase.expected === "match";

    return {
      ...testCase,
      actual,
      passed: actual === expected,
      error: null,
    };
  } catch (error) {
    return {
      ...testCase,
      actual: null,
      passed: false,
      error: error instanceof Error ? error.message : "Failed to execute test.",
    };
  }
};

const results = computed<TestResult[]>(() => {
  if (!hasRun.value) return [];

  return testCases.value.map(evaluateCase);
});

const passedCount = computed(
  () => results.value.filter((result) => result.passed).length,
);

const failedCount = computed(
  () => results.value.filter((result) => !result.passed).length,
);

const successRate = computed(() => {
  if (!results.value.length) return 0;

  return Math.round((passedCount.value / results.value.length) * 100);
});

const filteredCases = computed(() => {
  const query = search.value.trim().toLowerCase();

  return testCases.value.filter((testCase) => {
    const matchesSearch = testCase.input.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (filter.value === "all" || !hasRun.value) {
      return true;
    }

    const result = results.value.find((item) => item.id === testCase.id);

    if (!result) return false;

    return filter.value === "passed" ? result.passed : !result.passed;
  });
});

const getResult = (id: string) => {
  return results.value.find((result) => result.id === id);
};

const runTests = () => {
  if (!regexValidation.value.valid || !testCases.value.length) {
    hasRun.value = false;
    return;
  }

  hasRun.value = true;
};

const addCase = () => {
  testCases.value.push(createCase());
};

const removeCase = (id: string) => {
  testCases.value = testCases.value.filter((testCase) => testCase.id !== id);
};

const duplicateCase = (testCase: TestCase) => {
  const index = testCases.value.findIndex((item) => item.id === testCase.id);

  testCases.value.splice(
    index + 1,
    0,
    createCase(testCase.input, testCase.expected),
  );
};

const clearCases = () => {
  testCases.value = [];
  hasRun.value = false;
};

const resetCases = () => {
  testCases.value = defaultCases();
  hasRun.value = false;
  search.value = "";
  filter.value = "all";
};

const exportCases = () => {
  if (!import.meta.client) return;

  const data: SavedTestCases = {
    version: 1,
    cases: testCases.value,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "regexen-test-cases.json";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};

const triggerImport = () => {
  fileInput.value?.click();
};

const isValidImportedCase = (
  value: unknown,
): value is {
  input: string;
  expected: ExpectedResult;
} => {
  if (
    typeof value !== "object" ||
    value === null ||
    !("input" in value) ||
    !("expected" in value)
  ) {
    return false;
  }

  return (
    typeof value.input === "string" &&
    (value.expected === "match" || value.expected === "no-match")
  );
};

const parseImportedCases = (data: unknown): TestCase[] => {
  if (
    typeof data !== "object" ||
    data === null ||
    !("version" in data) ||
    data.version !== 1 ||
    !("cases" in data) ||
    !Array.isArray(data.cases)
  ) {
    throw new Error("Invalid test cases file format.");
  }

  if (!data.cases.every(isValidImportedCase)) {
    throw new Error("The file contains invalid test cases.");
  }

  return data.cases.map((item) => createCase(item.input, item.expected));
};

const importCases = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  importError.value = "";

  try {
    const text = await file.text();
    const data: unknown = JSON.parse(text);

    testCases.value = parseImportedCases(data);

    hasRun.value = false;
    search.value = "";
    filter.value = "all";
  } catch (error) {
    importError.value =
      error instanceof Error ? error.message : "Failed to import test cases.";
  } finally {
    input.value = "";
  }
};

const copyResults = async () => {
  if (!results.value.length) return;

  const summary = results.value
    .map((result, index) => {
      const status = result.passed ? "PASS" : "FAIL";
      const expected = result.expected === "match" ? "Match" : "No match";
      const actual =
        result.actual === null ? "Error" : result.actual ? "Match" : "No match";

      return [
        `${index + 1}. ${status}`,
        `Input: ${JSON.stringify(result.input)}`,
        `Expected: ${expected}`,
        `Actual: ${actual}`,
      ].join("\n");
    })
    .join("\n\n");

  try {
    await navigator.clipboard.writeText(summary + allLove);
    copied.value = true;
  } catch {
    copied.value = false;
  }
};

watch(
  [patternInput, testCases],
  () => {
    copied.value = false;

    if (autoRun.value) {
      runTests();
    } else {
      hasRun.value = false;
    }
  },
  { deep: true },
);

watch(autoRun, (enabled) => {
  if (enabled) runTests();
});

watch(
  testCases,
  (value) => {
    if (!import.meta.client) return;

    const data: SavedTestCases = {
      version: 1,
      cases: value,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  { deep: true },
);

onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const data: unknown = JSON.parse(saved);
      testCases.value = parseImportedCases(data);
    } else {
      testCases.value = defaultCases();
    }
  } catch {
    testCases.value = defaultCases();
  }
});
</script>

<template>
  <!-- Page title -->
  <PageTitle
    :title="pagesList.cases.name"
    :description="pagesList.cases.description"
  />

  <!-- Pattern -->
  <section aria-label="Regex pattern">
    <PatternInput v-model="patternInput" />
  </section>

  <!-- Validation -->
  <section aria-label="Pattern validation">
    <PatternValidator :pattern-input="patternInput" />
  </section>

  <!-- Test configuration -->
  <section aria-labelledby="test-configuration-title">
    <UiCard class="flex flex-col gap-4">
      <UiCardHeader class="flex flex-col gap-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <UiCardTitle id="test-configuration-title" class="section-title!">
              Test Configuration
            </UiCardTitle>

            <UiCardDescription class="section-label!">
              Manage your test cases and execution settings.
            </UiCardDescription>
          </div>

          <div class="flex flex-wrap gap-2">
            <UiButton variant="outline" size="sm" @click="triggerImport">
              <Upload class="size-4" aria-hidden="true" />
              Import
            </UiButton>

            <UiButton
              variant="outline"
              size="sm"
              :disabled="!testCases.length"
              @click="exportCases"
            >
              <Download class="size-4" aria-hidden="true" />
              Export
            </UiButton>
          </div>
        </div>
      </UiCardHeader>

      <UiCardContent class="space-y-4">
        <input
          ref="fileInput"
          type="file"
          accept=".json,application/json"
          class="sr-only"
          aria-label="Import test cases JSON file"
          @change="importCases"
        />

        <!-- Auto run -->
        <div
          class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-4"
        >
          <div class="space-y-1">
            <p class="label">Auto-run tests</p>

            <p class="text-xs text-muted-foreground">
              Automatically update results when inputs change.
            </p>
          </div>

          <UiSwitch
            v-model:checked="autoRun"
            aria-label="Automatically run tests"
          />
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap items-center gap-2">
          <UiButton
            :disabled="!regexValidation.valid || !testCases.length"
            @click="runTests"
          >
            <Play class="size-4" aria-hidden="true" />
            Run All Tests
          </UiButton>

          <UiButton variant="outline" @click="addCase">
            <Plus class="size-4" aria-hidden="true" />
            Add Test Case
          </UiButton>

          <UiButton
            variant="outline"
            size="icon"
            aria-label="Reset test cases to examples"
            title="Reset to examples"
            @click="resetCases"
          >
            <RotateCcw class="size-4" aria-hidden="true" />
          </UiButton>
        </div>

        <div
          v-if="importError"
          role="alert"
          class="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-muted-foreground"
        >
          <Info
            class="mt-0.5 size-4 shrink-0 text-destructive"
            aria-hidden="true"
          />

          <p>{{ importError }}</p>
        </div>
      </UiCardContent>
    </UiCard>
  </section>

  <!-- Empty state -->
  <UiCard v-if="!patternInput" class="border-dashed">
    <UiCardContent
      class="flex min-h-64 flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <div class="rounded-xl bg-primary/10 p-4 text-primary">
        <FlaskConical class="size-7" aria-hidden="true" />
      </div>

      <div class="space-y-2">
        <h2 class="text-lg font-semibold">Test your regex with confidence</h2>

        <p class="max-w-md text-sm text-muted-foreground">
          Enter a regular expression above to validate it against multiple test
          cases and expected results.
        </p>
      </div>
    </UiCardContent>
  </UiCard>

  <template v-else>
    <!-- Results overview -->
    <section aria-labelledby="results-overview-title">
      <UiCard class="flex flex-col gap-4">
        <UiCardHeader class="flex flex-col">
          <UiCardTitle id="results-overview-title" class="section-title!">
            Results Overview
          </UiCardTitle>

          <UiCardDescription class="section-label!">
            A quick summary of your test results.
          </UiCardDescription>
        </UiCardHeader>

        <UiCardContent class="space-y-4">
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <!-- Passed -->
            <div class="rounded-lg border border-border bg-muted/30 p-4">
              <p class="text-xs text-muted-foreground">Passed</p>

              <p class="mt-1 text-2xl font-semibold tabular-nums">
                {{ hasRun ? passedCount : "—" }}
              </p>
            </div>

            <!-- Failed -->
            <div class="rounded-lg border border-border bg-muted/30 p-4">
              <p class="text-xs text-muted-foreground">Failed</p>

              <p class="mt-1 text-2xl font-semibold tabular-nums">
                {{ hasRun ? failedCount : "—" }}
              </p>
            </div>

            <!-- Success rate -->
            <div
              class="col-span-2 rounded-lg border border-border bg-muted/30 p-4 sm:col-span-1"
            >
              <p class="text-xs text-muted-foreground">Success rate</p>

              <p class="mt-1 text-2xl font-semibold tabular-nums">
                {{ hasRun ? `${successRate}%` : "—" }}
              </p>
            </div>
          </div>

          <!-- Progress -->
          <div v-if="hasRun && results.length" class="space-y-2">
            <div
              class="flex items-center justify-between gap-3 text-xs text-muted-foreground"
            >
              <span>
                {{ passedCount }} of {{ results.length }} tests passed
              </span>

              <span class="tabular-nums"> {{ successRate }}% </span>
            </div>

            <div
              class="h-2 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              :aria-valuenow="successRate"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="Test success rate"
            >
              <div
                class="h-full rounded-full bg-primary transition-all duration-300"
                :style="{ width: `${successRate}%` }"
              />
            </div>
          </div>
        </UiCardContent>
      </UiCard>
    </section>

    <!-- Test cases -->
    <section aria-labelledby="test-cases-title">
      <UiCard class="flex flex-col gap-4">
        <UiCardHeader class="flex flex-col gap-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <UiCardTitle id="test-cases-title" class="section-title!">
                Test Cases
              </UiCardTitle>

              <UiCardDescription class="section-label!">
                Define inputs and their expected matching behavior.
              </UiCardDescription>
            </div>

            <div class="flex flex-wrap gap-2">
              <UiButton
                v-if="hasRun"
                variant="outline"
                size="sm"
                @click="copyResults"
              >
                <Check v-if="copied" class="size-4" aria-hidden="true" />

                <Copy v-else class="size-4" aria-hidden="true" />

                {{ copied ? "Copied" : "Copy results" }}
              </UiButton>

              <UiButton variant="outline" size="sm" @click="addCase">
                <Plus class="size-4" aria-hidden="true" />
                Add Case
              </UiButton>
            </div>
          </div>

          <!-- Search -->
          <div class="relative">
            <Search
              class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />

            <UiInput
              v-model="search"
              aria-label="Search test cases"
              placeholder="Search test inputs..."
              class="pl-9"
            />
          </div>

          <!-- Filters -->
          <div
            class="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter test cases"
          >
            <UiButton
              v-for="option in [
                { value: 'all', label: 'All' },
                { value: 'passed', label: 'Passed' },
                { value: 'failed', label: 'Failed' },
              ] as const"
              :key="option.value"
              size="sm"
              :variant="filter === option.value ? 'default' : 'outline'"
              :aria-pressed="filter === option.value"
              :disabled="option.value !== 'all' && !hasRun"
              @click="filter = option.value"
            >
              {{ option.label }}
            </UiButton>
          </div>
        </UiCardHeader>

        <UiCardContent class="space-y-3">
          <p class="text-xs text-muted-foreground" aria-live="polite">
            Showing {{ filteredCases.length }} of {{ testCases.length }} test
            cases
          </p>

          <!-- Case list -->
          <div
            v-if="filteredCases.length"
            class="overflow-hidden rounded-lg border border-border"
          >
            <div
              v-for="(testCase, index) in filteredCases"
              :key="testCase.id"
              class="flex flex-col gap-4 p-4"
              :class="{
                'border-b border-border': index !== filteredCases.length - 1,
              }"
            >
              <!-- Case header -->
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <span class="text-xs tabular-nums text-muted-foreground">
                    #{{
                      testCases.findIndex((item) => item.id === testCase.id) + 1
                    }}
                  </span>

                  <div
                    v-if="hasRun"
                    class="flex items-center gap-1.5"
                    :class="
                      getResult(testCase.id)?.passed
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-destructive'
                    "
                  >
                    <CheckCircle2
                      v-if="getResult(testCase.id)?.passed"
                      class="size-4"
                      aria-hidden="true"
                    />

                    <XCircle v-else class="size-4" aria-hidden="true" />

                    <span class="label">
                      {{ getResult(testCase.id)?.passed ? "Passed" : "Failed" }}
                    </span>
                  </div>

                  <span v-else class="text-xs text-muted-foreground">
                    Not run
                  </span>
                </div>

                <!-- Case actions -->
                <div class="flex items-center gap-1">
                  <UiButton
                    variant="ghost"
                    size="icon"
                    class="size-8"
                    :aria-label="`Duplicate test case ${index + 1}`"
                    title="Duplicate case"
                    @click="duplicateCase(testCase)"
                  >
                    <Copy class="size-4" aria-hidden="true" />
                  </UiButton>

                  <UiButton
                    variant="ghost"
                    size="icon"
                    class="size-8 text-muted-foreground hover:text-destructive"
                    :aria-label="`Delete test case ${index + 1}`"
                    title="Delete case"
                    @click="removeCase(testCase.id)"
                  >
                    <Trash2 class="size-4" aria-hidden="true" />
                  </UiButton>
                </div>
              </div>

              <!-- Input -->
              <div class="space-y-2">
                <label :for="`case-input-${testCase.id}`" class="label">
                  Test Input
                </label>

                <UiTextarea
                  :id="`case-input-${testCase.id}`"
                  v-model="testCase.input"
                  placeholder="Enter text to test..."
                  class="min-h-20 resize-y font-mono text-sm"
                  spellcheck="false"
                />
              </div>

              <!-- Expected / Actual -->
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <!-- Expected -->
                <div class="space-y-2">
                  <p class="label">Expected Result</p>

                  <div
                    class="grid grid-cols-2 gap-2"
                    role="group"
                    :aria-label="`Expected result for test case ${index + 1}`"
                  >
                    <UiButton
                      size="sm"
                      :variant="
                        testCase.expected === 'match' ? 'default' : 'outline'
                      "
                      :aria-pressed="testCase.expected === 'match'"
                      @click="testCase.expected = 'match'"
                    >
                      Match
                    </UiButton>

                    <UiButton
                      size="sm"
                      :variant="
                        testCase.expected === 'no-match' ? 'default' : 'outline'
                      "
                      :aria-pressed="testCase.expected === 'no-match'"
                      @click="testCase.expected = 'no-match'"
                    >
                      No Match
                    </UiButton>
                  </div>
                </div>

                <!-- Actual -->
                <div class="space-y-2">
                  <p class="label">Actual Result</p>

                  <div
                    class="flex min-h-9 items-center rounded-md border border-border bg-muted/30 px-3 text-sm"
                    aria-live="polite"
                  >
                    <span v-if="!hasRun" class="text-muted-foreground">
                      Not run
                    </span>

                    <span
                      v-else-if="getResult(testCase.id)?.actual === null"
                      class="text-destructive"
                    >
                      Error
                    </span>

                    <span v-else class="font-medium">
                      {{
                        getResult(testCase.id)?.actual ? "Match" : "No Match"
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty list -->
          <div
            v-else
            class="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-8 text-center"
          >
            <div class="rounded-xl bg-primary/10 p-3 text-primary">
              <FlaskConical class="size-6" aria-hidden="true" />
            </div>

            <div class="space-y-1.5">
              <p class="label">
                {{
                  testCases.length
                    ? "No matching test cases"
                    : "No test cases yet"
                }}
              </p>

              <p class="max-w-sm text-sm text-muted-foreground">
                {{
                  testCases.length
                    ? "Try changing your search or result filter."
                    : "Add your first test case to start validating your regex."
                }}
              </p>
            </div>

            <UiButton
              v-if="!testCases.length"
              variant="outline"
              size="sm"
              @click="addCase"
            >
              <Plus class="size-4" aria-hidden="true" />
              Add Test Case
            </UiButton>
          </div>

          <!-- Footer actions -->
          <div
            v-if="testCases.length"
            class="flex flex-wrap items-center justify-between gap-3 pt-2"
          >
            <p class="text-xs text-muted-foreground">
              Test cases are saved automatically in your browser.
            </p>

            <UiButton
              variant="ghost"
              size="sm"
              class="text-muted-foreground hover:text-destructive"
              @click="clearCases"
            >
              <Trash2 class="size-4" aria-hidden="true" />
              Clear all
            </UiButton>
          </div>
        </UiCardContent>
      </UiCard>
    </section>

    <!-- Help -->
    <PageHelp
      text="Test cases compare the actual JavaScript RegExp result against your
        expected result. A test passes when both match. Use positive and
        negative cases to catch unexpected behavior and prevent regressions.
        Your test cases are stored locally in this browser."
    />
  </template>
</template>
