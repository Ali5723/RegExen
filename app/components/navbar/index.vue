<script setup lang="ts">
import { ref, onMounted } from "vue";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";

// gsap.registerPlugin(ScrollTrigger);

const navbar = ref<HTMLElement | null>(null);

// let trigger: ScrollTrigger | undefined;

// onMounted(() => {
//   trigger = ScrollTrigger.create({
//     start: "top -10px",

//     onEnter: () => {
//       navbar.value?.classList.add("scrolled");
//     },

//     onLeaveBack: () => {
//       navbar.value?.classList.remove("scrolled");
//     },
//   });
// });

// onUnmounted(() => {
//   trigger?.kill();
// });

const theme = useCookie("theme", {
  default: () => "light",
});

onMounted(() => {
  document.documentElement.classList.toggle("dark", theme.value === "dark");
});

const isSheetOpen = ref<boolean>(false);
</script>

<template>
  <header
    class="px-6 py-4 sm:px-10 md:px-14 lg:px-18 backdrop-blur-xs bg-black/10 sticky top-0 z-10 transition-all duration-500"
    ref="navbar"
  >
    <UiNavigationMenu
      class="flex justify-around min-[500px]:justify-between max-w-full"
    >
      <h1
        class="text-2xl text-primary font-bold"
      >
        RegExen
      </h1>

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

              <div
                class="grid grid-cols-2 h-8 px-4 gap-2 switcher *:rounded-md"
              >
                <SwitcherTheme />
              </div>
            </UiSheetContent>
          </UiSheet>
        </div>
      </UiNavigationMenuList>

      <div class="flex items-center gap-5">
        <div
          class="hidden gap-4 *:rounded-full *:size-8 switcher min-[500px]:flex"
        >
          <SwitcherTheme />
        </div>
      </div>
    </UiNavigationMenu>
  </header>
</template>

<style lang="css" scoped>
@reference "@/assets/css/tailwind.css";

.scrolled {
  @apply bg-black/40!;
}

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
