<script setup lang="ts">
const user = useSupabaseUser()

const navLinks = [
  { label: 'Method', to: '/method' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Consulting', to: '/consulting' },
  { label: 'The Book', to: '/book' }
]
</script>

<template>
  <div>
    <UHeader>
      <template #left>
        <NuxtLink to="/" class="flex items-center">
          <EasyLogo class="text-xl" />
        </NuxtLink>
      </template>

      <template #right>
        <UButton
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          :label="link.label"
          variant="ghost"
          color="neutral"
          class="hidden md:inline-flex"
        />
        <UColorModeButton />
        <template v-if="user">
          <UButton to="/app" label="Open board" trailing-icon="i-lucide-arrow-right" />
        </template>
        <template v-else>
          <UButton to="/login" variant="ghost" color="neutral" label="Log in" class="hidden sm:inline-flex" />
          <UButton to="/signup" label="Start free" />
        </template>
      </template>
    </UHeader>

    <UMain>
      <slot />
    </UMain>

    <USeparator />

    <UFooter>
      <template #left>
        <div class="text-sm text-muted">
          <NuxtLink to="/" class="font-semibold text-highlighted">EASY</NuxtLink>
          <span class="mx-2">·</span>
          A card. Two columns. Nothing else.
        </div>
      </template>
      <template #right>
        <nav class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <NuxtLink to="/method" class="hover:text-default">Method</NuxtLink>
          <NuxtLink to="/pricing" class="hover:text-default">Pricing</NuxtLink>
          <NuxtLink to="/never" class="hover:text-default">Never</NuxtLink>
          <NuxtLink to="/consulting" class="hover:text-default">Consulting</NuxtLink>
          <NuxtLink to="/book" class="hover:text-default">Book</NuxtLink>
          <NuxtLink to="/talk" class="hover:text-default">Talk to us</NuxtLink>
          <NuxtLink to="/privacy" class="hover:text-default">Privacy</NuxtLink>
          <NuxtLink to="/terms" class="hover:text-default">Terms</NuxtLink>
          <NuxtLink to="/dpa" class="hover:text-default">DPA</NuxtLink>
        </nav>
      </template>
    </UFooter>
  </div>
</template>
