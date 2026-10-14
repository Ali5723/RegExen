<script setup lang="ts"></script>

<template>
  <UiNavigationMenuItem class="capitalize" v-for="page in pagesList">
    <NuxtLink :to="page.path" v-slot="isActive">
      <UiNavigationMenuLink
        :class="[
          isActive.isActive
            ? 'text-primary! underline decoration-foreground'
            : '',
          'text-base sm:text-lg lg:text-xl',
        ]"
      >
        {{ page.name }}
        <!-- {{ t(`navbar.items.${key}`) }} -->
      </UiNavigationMenuLink>
    </NuxtLink>
  </UiNavigationMenuItem>
</template>
