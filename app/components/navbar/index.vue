<script setup lang="ts">
import { ref } from "vue";

const isSheetOpen = ref<boolean>(false);
</script>

<template>
  <header
    class="px-6 py-4 sm:px-10 md:px-14 lg:px-18 backdrop-blur-xs bg-black/80 sticky top-0 z-10 transition-all duration-500"
  >
    <UiNavigationMenu
      class="flex justify-around min-[500px]:justify-between max-w-full"
    >
      <Logo />

      <UiNavigationMenuList>
        <div class="hidden min-[500px]:flex gap-2 sm:gap-4 md:gap-6 lg:gap-8">
          <NavbarItems />
        </div>

        <div class="min-[500px]:hidden">
          <UiSheet v-model:open="isSheetOpen">
            <UiSheetTrigger class="sheet">
              <span :class="[isSheetOpen ? 'w-6!' : '']"></span>
              <span></span>
              <span :class="[isSheetOpen ? 'w-6!' : '']"></span>
            </UiSheetTrigger>
            <UiSheetContent side="right">
              <UiSheetHeader class="text-xl font-bold"> Pages </UiSheetHeader>

              <UiSeparator />

              <UiNavigationMenuList class="flex-col gap-4 px-10 *:w-full">
                <NavbarItems />
              </UiNavigationMenuList>

              <UiSeparator />
            </UiSheetContent>
          </UiSheet>
        </div>
      </UiNavigationMenuList>

      <div class="flex items-center gap-5">
        <div class="gap-4 *:rounded-full *:size-8 switcher flex">
          <SwitcherTheme />
        </div>
      </div>
    </UiNavigationMenu>
  </header>
</template>

<style lang="css" scoped>
@reference "@/assets/css/tailwind.css";

.sheet {
  @apply p-0 m-0 cursor-pointer flex flex-col items-center gap-1;
}
.sheet span {
  @apply block border-b w-6 rounded-sm h-1 bg-foreground transition-all duration-400;
}
.sheet span:not(:nth-of-type(2)) {
  @apply w-4;
}

.switcher {
  @apply *:cursor-pointer *:bg-accent *:flex *:justify-center *:items-center *:select-none *:hover:bg-accent/80 *:transition-all *:duration-300;
}
</style>
