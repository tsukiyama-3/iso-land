// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/eslint', '@nuxt/scripts', '@nuxt/image'],
  devtools: { enabled: true },
  app: {
    head: {
      htmlAttrs: {
        lang: 'ja',
      },
      title: 'iso.land',
      meta: [
        {
          name: 'description',
          content:
            'マップで位置を選んでプロンプトを入力するだけで、建物のアイソメトリック画像を生成できるサービスです。',
        },
        {
          property: 'og:description',
          content:
            'マップで位置を選んでプロンプトを入力するだけで、建物のアイソメトリック画像を生成できるサービスです。',
        },
        { property: 'og:title', content: 'iso.land' },
        {
          property: 'og:image',
          content: 'https://res.cloudinary.com/dyoyv8djx/image/upload/v1758043616/iso.land/og_iso-land_hegccw.png',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://isometric.land' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'iso.land' },
        {
          name: 'twitter:description',
          content:
            'マップで位置を選んでプロンプトを入力するだけで、建物のアイソメトリック画像を生成できるサービスです。',
        },
        {
          name: 'twitter:image',
          content:
            'https://res.cloudinary.com/dyoyv8djx/image/upload/v1758043616/iso.land/og_iso-land_hegccw.png',
        },
      ],
      link: [
        { rel: 'canonical', href: 'https://isometric.land' },
      ],
    },
  },
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
    generateLimit: '',
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
    provider: 'ipx',
    domains: [
      'swmfvssynamlshha.public.blob.vercel-storage.com',
      'res.cloudinary.com',
    ],
    ipx: {
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    densities: [1, 2],
    format: ['webp', 'avif', 'jpeg'],
  },
})
