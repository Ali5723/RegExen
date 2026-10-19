<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar";

const props = defineProps<SidebarProps>();
</script>

<template>
  <UiSidebar v-bind="props">
    <UiSidebarHeader class="ps-3">
      <Logo class="hidden md:block" />
      <h2 class="block md:hidden text-2xl text-primary font-bold">Pages</h2>
    </UiSidebarHeader>
    <UiSidebarContent>
      <UiSidebarGroup>
        <UiSidebarGroupContent>
          <UiSidebarMenu class="gap-2">
            <UiSidebarMenuItem
              v-for="item in pagesList"
              :key="item.name"
              class="hover:bg-transparent"
            >
              <UiSidebarMenuButton as-child>
                <NuxtLink :to="item.path" v-slot="isActive">
                  <div
                    :class="[
                      isActive.isActive
                        ? 'text-gray-700! dark:text-gray-400! underline decoration-foreground'
                        : '',
                      'text-base sm:text-lg ps-2 md:ps-4 lg:ps-6',
                    ]"
                  >
                    {{ item.name }}
                  </div>
                </NuxtLink>
              </UiSidebarMenuButton>
            </UiSidebarMenuItem>
          </UiSidebarMenu>
        </UiSidebarGroupContent>
      </UiSidebarGroup>
    </UiSidebarContent>
    <!-- <UiSidebarRail /> -->
  </UiSidebar>
</template>
