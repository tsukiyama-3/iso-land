// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/eslint', '@nuxt/scripts', '@nuxt/image'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  ui: {
    colorMode: false,
  },
  runtimeConfig: {
    public: {
      google: {
        apiKey: '',
      },
      cloudinary: {
        baseUrl: 'https://res.cloudinary.com/dyoyv8djx/image/upload/v1757603203/iso.land',
      },
    },
    gemini: {
      apiKey: '',
    },
    openRouter: {
      apiKey: '',
    },
    basePrompt: '',
    kvRestApiUrl: '',
    kvRestApiToken: '',
    blobReadWriteToken: '',
  },
  compatibilityDate: '2025-07-15',
  eslint: {
    config: {
      stylistic: true,
    },
  },
  image: {
    provider: 'cloudinary',
    baseUrl: 'https://res.cloudinary.com/dyoyv8djx/image/upload/v1757603203/iso.land',
  },
})
