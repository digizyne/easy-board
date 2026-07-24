<script setup lang="ts">
const user = useSupabaseUser()
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
        <UButton to="/pricing" variant="ghost" color="neutral" label="Pricing" class="hidden sm:inline-flex" />
        <UButton to="/book" variant="ghost" color="neutral" label="The Book" class="hidden sm:inline-flex" />
        <UColorModeButton />
        <template v-if="user">
          <UButton to="/app" label="Open board" trailing-icon="i-lucide-arrow-right" />
        </template>
        <template v-else>
          <UButton to="/login" variant="ghost" color="neutral" label="Log in" />
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
        <p class="text-sm text-muted">
          EASY — Enumerative Agile subSYstem
        </p>
      </template>
      <template #right>
        <p class="text-sm text-muted">
          A card. Two columns. Nothing else.
        </p>
      </template>
    </UFooter>
  </div>
</template>
