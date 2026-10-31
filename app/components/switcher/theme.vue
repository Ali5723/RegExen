<script setup lang="ts">
import { Moon, Sun } from "@lucide/vue";

const { theme, toggleTheme } = useTheme();

const themes: ("light" | "dark")[] = ["light", "dark"];
</script>

<template>
  <div @click="toggleTheme">
    <div v-for="mainTheme in themes" v-show="theme !== mainTheme">
      <component :is="mainTheme === 'light' ? Sun : Moon" class="size-5" />
    </div>
  </div>
</template>
