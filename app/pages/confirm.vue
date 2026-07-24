<script setup lang="ts">
definePageMeta({ layout: 'auth' })

// The Supabase module exchanges the auth code from the URL automatically.
// Once a session exists, send the user into the app.
const user = useSupabaseUser()
const failed = ref(false)

watch(user, (u) => {
  if (u) navigateTo('/app')
}, { immediate: true })

onMounted(() => {
  // Fallback: if no session materializes shortly, the link was bad/expired.
  setTimeout(() => {
    if (!user.value) failed.value = true
  }, 5000)
})
</script>

<template>
  <UCard>
    <template v-if="!failed">
      <div class="flex items-center gap-3 py-2">
        <UIcon name="i-lucide-loader-circle" class="animate-spin size-5 text-primary" />
        <p class="text-sm text-muted">Confirming your account…</p>
      </div>
    </template>
    <template v-else>
      <h1 class="text-lg font-semibold mb-1">Link expired</h1>
      <p class="text-sm text-muted mb-4">
        That confirmation link didn’t work. Try logging in, or request a new link.
      </p>
      <UButton to="/login" label="Go to login" />
    </template>
  </UCard>
</template>
