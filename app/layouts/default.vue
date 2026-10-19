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
  <UiSidebarProvider class="min-h-svh">
    <Sidebar />

    <UiSidebarInset class="min-w-0">
      <header
        class="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:hidden"
      >
        <UiSidebarTrigger class="-ml-1" />

        <div class="flex min-w-0 flex-1 justify-center">
          <Logo />
        </div>

        <SwitcherTheme />
      </header>

      <main class="min-w-0 flex-1 py-4 px-2.5 space-y-4">
        <slot />
      </main>
    </UiSidebarInset>
  </UiSidebarProvider>
</template>
