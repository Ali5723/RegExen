<script setup lang="ts">
import { onMounted } from "vue";

const theme = useCookie("theme", {
  default: () => "light",
});

onMounted(() => {
  document.documentElement.classList.toggle("dark", theme.value === "dark");
});
</script>

<template>
  <UiSidebarProvider>
    <Sidebar />
    <slot />
  </UiSidebarProvider>
</template>
