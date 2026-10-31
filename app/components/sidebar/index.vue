<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar";

const props = defineProps<SidebarProps>();

const route = useRoute();

const isActive = (path: string) => {
  if (path === "/") return route.path === "/";

  return route.path === path || route.path.startsWith(`${path}/`);
};

const { toggleTheme } = useTheme();
</script>

<template>
  <UiSidebar v-bind="props" collapsible="offcanvas">
    <!-- Header -->
    <UiSidebarHeader class="shrink-0 border-b border-sidebar-border px-4 py-4">
      <NuxtLink
        to="/"
        aria-label="RegExen home"
        class="flex min-h-10 items-center"
      >
        <Logo class="w-full max-w-36" aria-hidden="true" />
      </NuxtLink>
    </UiSidebarHeader>

    <!-- Navigation -->
    <UiSidebarContent class="min-h-0 overflow-hidden p-0">
      <UiScrollArea class="min-h-0 h-full w-full">
        <nav aria-label="Main navigation">
          <div class="flex flex-col gap-1 px-2 py-3">
            <UiSidebarGroup
              v-for="group in navigationList"
              :key="group.id"
              class="py-2"
              :aria-label="group.label"
            >
              <UiSidebarGroupLabel
                class="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50"
              >
                {{ group.label }}
              </UiSidebarGroupLabel>

              <UiSidebarGroupContent>
                <UiSidebarMenu class="gap-1">
                  <UiSidebarMenuItem
                    v-for="item in group.items"
                    :key="item.path"
                  >
                    <UiSidebarMenuButton
                      as-child
                      :is-active="isActive(item.path)"
                      :tooltip="item.name"
                      class="h-10 rounded-lg px-3 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary data-[active=true]:font-semibold"
                    >
                      <NuxtLink
                        :to="item.path"
                        class="flex items-center gap-3"
                        :aria-current="isActive(item.path) ? 'page' : undefined"
                      >
                        <component
                          :is="item.icon"
                          class="size-4 shrink-0"
                          aria-hidden="true"
                          focusable="false"
                        />

                        <span class="truncate">
                          {{ item.name }}
                        </span>
                      </NuxtLink>
                    </UiSidebarMenuButton>
                  </UiSidebarMenuItem>
                </UiSidebarMenu>
              </UiSidebarGroupContent>
            </UiSidebarGroup>
          </div>
        </nav>
      </UiScrollArea>
    </UiSidebarContent>

    <!-- Footer -->
    <UiSidebarFooter
      class="shrink-0 border-t border-sidebar-border p-3 cursor-pointer"
      role="button"
      tabindex="0"
      aria-label="Toggle color theme"
      @click="toggleTheme"
      @keydown.enter.prevent="toggleTheme"
      @keydown.space.prevent="toggleTheme"
    >
      <div
        class="flex items-center justify-between gap-3 rounded-lg bg-sidebar-accent/50 px-3 py-2"
      >
        <span class="text-xs font-medium text-sidebar-foreground">
          Appearance
        </span>

        <SwitcherTheme />
      </div>
    </UiSidebarFooter>
  </UiSidebar>
</template>
