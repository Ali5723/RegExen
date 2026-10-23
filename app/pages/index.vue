<script setup lang="ts">
import { CircleCheck, CircleX, Copy } from "@lucide/vue";
import { toast } from "vue-sonner";

const patternInput = ref<string>("");

async function handleCopy() {
  if (!patternInput.value) {
    toast.error("Pattern input is empty");
  } else {
    try {
      await navigator.clipboard.writeText(patternInput.value);
      toast.info("Copied");
    } catch {
      toast.error("Failed to copy");
    }
  }
}

const flags: string[] = ["g", "i", "m", "s", "u"];
const activatedFlags = ref<string[]>([]);

function toggleFlag(pattern: string) {
  if (activatedFlags.value.includes(pattern)) {
    activatedFlags.value = activatedFlags.value.filter(
      (item) => item !== pattern,
    );
  } else {
    activatedFlags.value.push(pattern);
  }
}

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

const matchResults = ref<string[]>([]);

watch(
  [patternInput, activatedFlags, testInput],
  () => {
    // console.log(patternInput.value);
    // console.log(activatedFlags.value);
    // console.log(testInput.value);

    const result = matchPatternTest();
    if (result !== false) matchResults.value = result ?? [];
    else matchResults.value = [];
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
  <div class="flex flex-col gap-6">
    <!-- Title -->
    <header class="space-y-1.5">
      <h2 class="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        Regex Tester
      </h2>
      <p class="text-sm leading-relaxed text-muted-foreground">
        Write a pattern, test it against text, and see the results instantly.
      </p>
    </header>

    <!-- Pattern Input -->
    <UiField class="gap-2.5">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <UiFieldLabel
          for="pattern"
          class="text-sm font-semibold text-foreground"
        >
          Pattern
        </UiFieldLabel>

        <UiFieldDescription class="text-xs text-muted-foreground">
          Write without / /
        </UiFieldDescription>
      </div>

      <UiInputGroup
        class="min-h-11 border-border bg-card transition-colors focus-within:border-primary/60"
      >
        <UiInputGroupInput
          id="pattern"
          v-model="patternInput"
          placeholder="Write a pattern"
          aria-label="Regular expression pattern"
          class="font-mono text-sm text-foreground placeholder:text-muted-foreground"
        />

        <UiInputGroupAddon align="inline-end">
          <UiInputGroupButton
            aria-label="Copy pattern"
            variant="ghost"
            class="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            @click="handleCopy"
          >
            <Copy class="size-4" />
          </UiInputGroupButton>
        </UiInputGroupAddon>
      </UiInputGroup>
    </UiField>

    <!-- Flags Buttons -->
    <div class="space-y-2">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="text-sm font-semibold text-foreground">Flags</span>
        <span class="text-xs text-muted-foreground">
          Select regex modifiers
        </span>
      </div>

      <div class="flex flex-wrap gap-2">
        <UiButton
          v-for="item in flags"
          :key="item"
          type="button"
          size="sm"
          variant="outline"
          :aria-label="`Toggle ${item} flag`"
          :aria-pressed="activatedFlags.includes(item)"
          :class="[
            'h-9 min-w-9 rounded-lg border font-mono text-sm font-semibold transition-colors',
            activatedFlags.includes(item)
              ? 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15'
              : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-accent hover:text-accent-foreground',
          ]"
          @click="toggleFlag(item)"
        >
          {{ item }}
        </UiButton>
      </div>
    </div>

    <!-- Pattern Validation -->
    <div
      v-if="patternInput"
      role="status"
      aria-live="polite"
      class="flex min-h-5 items-center gap-2 text-xs font-medium"
    >
      <template v-if="isValidRegex(patternInput)">
        <CircleCheck
          class="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
        />
        <span class="text-emerald-700 dark:text-emerald-400">
          Valid pattern
        </span>
      </template>

      <template v-else>
        <CircleX class="size-4 shrink-0 text-destructive" />
        <span class="text-destructive"> Invalid pattern </span>
      </template>
    </div>

    <!-- Test Input -->
    <UiField class="gap-2.5">
      <UiFieldLabel for="text" class="text-sm font-semibold text-foreground">
        Test Input
      </UiFieldLabel>

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

      <UiFieldDescription class="text-right text-xs text-muted-foreground">
        {{ testInputLines }} lines · {{ testInputCharacters }} characters
      </UiFieldDescription>
    </UiField>

    <!-- Match Results -->
    <UiField class="gap-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <UiFieldLabel class="text-sm font-semibold text-foreground">
          Match Results
        </UiFieldLabel>

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
                index + 1 === matchResults.length
                  ? setMatchEndElement
                  : undefined
              "
              class="group flex items-start gap-3 px-3 py-3 transition-colors hover:bg-accent/60 sm:px-4"
            >
              <span
                class="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-semibold text-primary"
              >
                {{ index + 1 }}
              </span>

              <code
                class="min-w-0 flex-1 break-all font-mono text-sm leading-6 text-foreground"
              >
                {{
                  item === "" || item === " " || item === "\n"
                    ? "[empty]"
                    : item
                }}
              </code>
            </li>
          </ul>
        </UiScrollArea>
      </div>
    </UiField>
  </div>
</template>
