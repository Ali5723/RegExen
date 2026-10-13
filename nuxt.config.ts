import tailwindcss from "@tailwindcss/vite";
// import { provideSSRWidth } from '@vueuse/core'

export default defineNuxtConfig({
  // provideSSRWidth(1024, nuxtApp.vueApp)
  modules: ["shadcn-nuxt"],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },

  css: ["~/assets/css/tailwind.css"],
  vite: {
    plugins: [tailwindcss()],
  },

  shadcn: {
    prefix: "Ui",
    componentDir: "~/components/ui",
  },

  ssr: false,
});
