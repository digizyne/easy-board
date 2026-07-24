<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { currentOrg, load, reset } = useOrgs()

await load()

const planLabel = computed(() => {
  const p = currentOrg.value?.plan ?? 'free'
  return p.charAt(0).toUpperCase() + p.slice(1)
})

async function logout() {
  await supabase.auth.signOut()
  reset()
  await navigateTo('/login')
}

const userMenu = computed(() => [
  [{ label: user.value?.email ?? '', type: 'label' as const }],
  [
    { label: 'Account', icon: 'i-lucide-user', to: '/app/settings/account' },
    { label: 'Billing', icon: 'i-lucide-credit-card', to: '/app/settings/billing' }
  ],
  [{ label: 'Log out', icon: 'i-lucide-log-out', onSelect: logout }]
])
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="border-b border-default h-16 flex items-center gap-4 px-4 shrink-0">
      <NuxtLink to="/app" class="flex items-center">
        <EasyLogo class="text-lg" />
      </NuxtLink>

      <UBadge
        v-if="currentOrg"
        :label="`${currentOrg.name} · ${planLabel}`"
        color="neutral"
        variant="subtle"
      />

      <div class="flex-1" />

      <UColorModeButton />

      <UDropdownMenu :items="userMenu">
        <UButton
          icon="i-lucide-user"
          color="neutral"
          variant="ghost"
          :aria-label="user?.email ?? 'Account'"
        />
      </UDropdownMenu>
    </header>

    <main class="flex-1">
      <UContainer class="py-8">
        <slot />
      </UContainer>
    </main>
  </div>
</template>
