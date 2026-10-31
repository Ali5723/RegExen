<script setup lang="ts">
import { computed, ref } from "vue";
import { BookOpenText, Check, Copy, Info, Layers3, Search } from "@lucide/vue";

const { explainRegex } = useRegex();

const patternInput = ref<string>("");
const search = ref("");
const copied = ref(false);

const explanation = computed(() => explainRegex(patternInput.value));

const filteredTokens = computed(() => {
  const query = search.value.trim().toLowerCase();

  if (!query) return explanation.value.tokens;

  return explanation.value.tokens.filter((token) =>
    [token.value, token.type, token.description].some((value) =>
      value.toLowerCase().includes(query),
    ),
  );
});

const categories = computed(
  () => new Set(explanation.value.tokens.map((token) => token.type)).size,
);

const summary = computed(() =>
  explanation.value.tokens
    .map((token) => `${token.value} — ${token.description}`)
    .join("\n"),
);

const copyExplanation = async () => {
  if (!summary.value) return;

  try {
    await navigator.clipboard.writeText(summary.value + allLove);
    copied.value = true;
  } catch {
    copied.value = false;
  }
};
</script>

<template>
  <!-- Page title -->
  <PageTitle
    :title="pagesList.explainer.name"
    :description="pagesList.explainer.description"
  />

  <!-- Pattern -->
  <section aria-label="Regex pattern">
    <PatternInput v-model="patternInput" />
  </section>

  <!-- Validation -->
  <section aria-label="Pattern validation">
    <PatternValidator :pattern-input="patternInput" />
  </section>

  <!-- Empty state -->
  <UiCard v-if="!patternInput" class="border-dashed">
    <UiCardContent
      class="flex min-h-64 flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <div class="rounded-xl bg-primary/10 p-4 text-primary">
        <BookOpenText class="size-7" aria-hidden="true" />
      </div>

      <div class="space-y-2">
        <h2 class="text-lg font-semibold">Understand your regex</h2>

        <p class="max-w-md text-sm text-muted-foreground">
          Enter a regular expression above to see a breakdown of its tokens,
          operators, groups, and matching rules.
        </p>
      </div>
    </UiCardContent>
  </UiCard>

  <template v-else>
    <!-- Summary -->
    <section aria-labelledby="explanation-overview">
      <UiCard class="flex flex-col gap-4">
        <UiCardHeader class="flex flex-col">
          <UiCardTitle class="section-title!"> Pattern Overview </UiCardTitle>

          <UiCardDescription class="section-label!">
            A quick summary of your regular expression.
          </UiCardDescription>
        </UiCardHeader>

        <UiCardContent>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div class="rounded-lg border border-border bg-muted/30 p-4">
              <p class="text-xs text-muted-foreground">Pattern length</p>
              <p class="mt-1 text-2xl font-semibold tabular-nums">
                {{ patternInput.length }}
              </p>
            </div>

            <div class="rounded-lg border border-border bg-muted/30 p-4">
              <p class="text-xs text-muted-foreground">Tokens</p>
              <p class="mt-1 text-2xl font-semibold tabular-nums">
                {{ explanation.tokens.length }}
              </p>
            </div>

            <div
              class="col-span-2 rounded-lg border border-border bg-muted/30 p-4 sm:col-span-1"
            >
              <p class="text-xs text-muted-foreground">Token types</p>
              <p class="mt-1 text-2xl font-semibold tabular-nums">
                {{ categories }}
              </p>
            </div>
          </div>
        </UiCardContent>
      </UiCard>
    </section>

    <!-- Token breakdown -->
    <section aria-labelledby="token-breakdown-title">
      <UiCard class="flex flex-col gap-4">
        <UiCardHeader class="flex flex-col gap-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <UiCardTitle class="flex items-center gap-2 section-title">
                Token Breakdown
              </UiCardTitle>

              <UiCardDescription class="section-label!">
                Explore what each part of your regex means.
              </UiCardDescription>
            </div>

            <UiButton
              variant="outline"
              size="sm"
              :disabled="!explanation.tokens.length"
              @click="copyExplanation"
            >
              <Check v-if="copied" class="size-4" aria-hidden="true" />
              <Copy v-else class="size-4" aria-hidden="true" />
              {{ copied ? "Copied" : "Copy explanation" }}
            </UiButton>
          </div>

          <!-- Search -->
          <div class="relative">
            <Search
              class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />

            <UiInput
              v-model="search"
              aria-label="Search regex tokens"
              placeholder="Search tokens or explanations..."
              class="pl-9"
            />
          </div>
        </UiCardHeader>

        <UiCardContent class="space-y-3">
          <div
            v-if="!explanation.valid"
            role="note"
            class="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-muted-foreground"
          >
            <Info
              class="mt-0.5 size-4 shrink-0 text-destructive"
              aria-hidden="true"
            />
            <p>
              This pattern is invalid in JavaScript without flags. The breakdown
              below is informational and may not represent a valid expression.
            </p>
          </div>

          <p class="text-xs text-muted-foreground" aria-live="polite">
            Showing {{ filteredTokens.length }} of
            {{ explanation.tokens.length }} tokens
          </p>

          <div
            v-if="filteredTokens.length"
            class="overflow-hidden rounded-lg border border-border"
          >
            <div
              v-for="(token, index) in filteredTokens"
              :key="token.id"
              class="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4"
              :class="{
                'border-b border-border': index !== filteredTokens.length - 1,
              }"
            >
              <!-- Token -->
              <div class="flex shrink-0 items-center gap-3 sm:w-36">
                <span
                  class="w-5 text-xs tabular-nums text-muted-foreground"
                  aria-hidden="true"
                >
                  {{ token.id + 1 }}
                </span>

                <code
                  class="min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-md bg-primary/10 px-2.5 py-1.5 font-mono text-sm font-semibold text-primary"
                >
                  {{ token.value }}
                </code>
              </div>

              <!-- Explanation -->
              <div class="min-w-0 flex-1 space-y-1.5">
                <p class="label">
                  {{ token.type }}
                </p>

                <p class="text-sm leading-relaxed text-muted-foreground">
                  {{ token.description }}
                </p>
              </div>

              <!-- Position -->
              <span
                class="shrink-0 text-xs tabular-nums text-muted-foreground"
                :aria-label="`Characters ${token.start + 1} through ${token.end}`"
              >
                {{ token.start }}–{{ token.end }}
              </span>
            </div>
          </div>

          <div
            v-else
            class="rounded-lg border border-dashed border-border p-8 text-center"
          >
            <p class="text-sm text-muted-foreground">
              No tokens match your search.
            </p>
          </div>
        </UiCardContent>
      </UiCard>
    </section>

    <!-- Help -->
    <PageHelp
      text="This explainer provides a simplified, token-based interpretation of
        JavaScript regular expressions. It does not simulate execution or fully
        parse every advanced regex construct."
    />
  </template>
</template>
