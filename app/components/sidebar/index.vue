<template>
  <UiSidebarProvider>
    <AppSidebar />
    <UiSidebarInset class="md:hidden">
      <header
        class="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur"
      >
        <UiSidebarTrigger class="-ml-1" />
        <div class="flex min-w-0 flex-1 justify-center">
          <Logo />
        </div>
        <SwitcherTheme />
      </header>
    </UiSidebarInset>
  </UiSidebarProvider>
</template>
