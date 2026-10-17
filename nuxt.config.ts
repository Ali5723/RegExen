import tailwindcss from "@tailwindcss/vite";
// import { provideSSRWidth } from '@vueuse/core'

export default defineNuxtConfig({
  // provideSSRWidth(1024, nuxtApp.vueApp)
  modules: ["shadcn-nuxt", "@nuxtjs/color-mode"],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },

  css: ["~/assets/css/tailwind.css"],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        "@lucide/vue",
        "@vueuse/core",
        "class-variance-authority",
        "clsx",
        "cn",
        "reka-ui",
        "tailwind-merge",
        "vue-sonner",
      ],
    },
  },

  shadcn: {
    prefix: "Ui",
    componentDir: "~/components/ui",
  },

  ssr: false,
});
