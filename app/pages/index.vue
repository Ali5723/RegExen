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
  <!-- Title -->
  <div class="space-y-2 pb-2">
    <h2 class="text-xl font-bold">Regex Tester</h2>
    <p class="text-sm">
      Write a pattern, test it again with text, and see the results instantly.
    </p>
  </div>

  <!-- Pattern Input -->
  <UiField>
    <div class="flex justify-between items-center pe-9">
      <UiFieldLabel class="text-md font-bold" for="pattern">
        Pattern
      </UiFieldLabel>

      <UiFieldDescription> Write without / / </UiFieldDescription>
    </div>

    <UiInputGroup>
      <UiInputGroupInput
        placeholder="Write a pattern"
        class="text-sm"
        id="pattern"
        v-model="patternInput"
      />

      <UiInputGroupAddon align="inline-end">
        <UiInputGroupButton
          aria-label="Copy pattern"
          variant="secondary"
          @click="handleCopy"
        >
          <Copy class="size-4" />
        </UiInputGroupButton>
      </UiInputGroupAddon>
    </UiInputGroup>
  </UiField>

  <!-- Flags Buttons -->
  <UiButtonGroup class="gap-4 *:rounded-lg! *:size-10! mx-auto">
    <UiButton
      variant="secondary"
      v-for="item in flags"
      :class="[
        'border-2! bg-gray-300/25',
        activatedFlags.includes(item) ? 'bg-gray-400/15' : '',
      ]"
      @click="toggleFlag(item)"
    >
      <div
        :class="[
          'px-1.25 py-0.5',
          activatedFlags.includes(item)
            ? 'border-b-gray-300 border-b-2 rounded-xs'
            : '',
        ]"
      >
        {{ item }}
      </div>
    </UiButton>
  </UiButtonGroup>

  <!-- Pattern Validation -->
  <div
    class="*:flex *:gap-2 [&_svg]:size-4 *:justify-center *:items-center *:text-sm"
  >
    <p class="text-green-500" v-if="isValidRegex(patternInput)">
      <CircleCheck /> Valid Pattern
    </p>
    <p class="text-red-500" v-else v-show="!!patternInput">
      <CircleX /> Invalid Pattern
    </p>
  </div>

  <!-- Test Input -->
  <UiField>
    <UiFieldLabel class="text-md font-bold" for="text">
      Test Input
    </UiFieldLabel>

    <UiInputGroup>
      <UiInputGroupTextarea
        placeholder="Write the text"
        class="text-sm"
        id="text"
        v-model="testInput"
      >
      </UiInputGroupTextarea>
    </UiInputGroup>

    <UiFieldDescription class="text-right">
      {{ testInputLines }} lines &#x2022; {{ testInputCharacters }} characters
    </UiFieldDescription>
  </UiField>

  <!-- Match Results -->
  <UiField>
    <div class="flex justify-between items-center">
      <UiFieldLabel class="text-md font-bold"> Match Results </UiFieldLabel>
      <UiFieldDescription
        class="bg-green-200 text-green-900 font-bold px-2 py-1 rounded-md cursor-pointer"
        @click="scrollToMatchEnd"
      >
        {{ matchResults.length }} matches
      </UiFieldDescription>
    </div>

    <ul>
      <li
        v-for="(item, index) in matchResults"
        :ref="
          index + 1 === matchResults.length ? setMatchEndElement : undefined
        "
      >
        {{ !["", " ", "\n"].includes(item) ? item : "[empty]" }}
      </li>
    </ul>
  </UiField>
</template>
