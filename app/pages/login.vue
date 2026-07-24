<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const supabase = useSupabaseClient()
const toast = useToast()

const email = ref('')
const password = ref('')
const loading = ref(false)

async function onSubmit() {
  loading.value = true
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })
  loading.value = false
  if (error) {
    toast.add({ title: 'Could not log in', description: error.message, color: 'error' })
    return
  }
  await navigateTo('/app')
}
</script>

<template>
  <UCard>
    <template #header>
      <h1 class="text-lg font-semibold">Log in</h1>
      <p class="text-sm text-muted mt-1">Welcome back.</p>
    </template>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <UFormField label="Email" name="email">
        <UInput
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="you@company.com"
          required
          class="w-full"
        />
      </UFormField>

      <UFormField label="Password" name="password">
        <UInput
          v-model="password"
          type="password"
          autocomplete="current-password"
          placeholder="••••••••"
          required
          class="w-full"
        />
      </UFormField>

      <div class="flex justify-end">
        <ULink to="/forgot" class="text-sm text-muted">Forgot password?</ULink>
      </div>

      <UButton type="submit" block size="lg" :loading="loading" label="Log in" />
    </form>

    <template #footer>
      <p class="text-sm text-muted">
        New to EASY?
        <ULink to="/signup" class="text-primary font-medium">Create an account</ULink>
      </p>
    </template>
  </UCard>
</template>
