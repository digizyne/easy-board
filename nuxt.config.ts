// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/supabase'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  // Marketing pages are public + prerendered for SEO; the app is client-rendered.
  routeRules: {
    '/': { prerender: true }
  },

  // Auth: only /app/** requires a session. Everything else (marketing, book,
  // pricing, legal) stays public so it can be indexed.
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      include: ['/app(/*)?'],
      exclude: []
    }
  },

  // Server-only secrets live here; only `public` is exposed to the client.
  runtimeConfig: {
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    anthropicApiKey: '',
    resendApiKey: '',
    public: {
      siteUrl: 'http://localhost:3000',
      stripePublishableKey: ''
    }
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
