<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const toast = useToast()

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const checkEmail = ref(false)

async function onSubmit() {
  loading.value = true
  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: { full_name: name.value },
      emailRedirectTo: `${config.public.siteUrl}/confirm`
    }
  })
  loading.value = false
  if (error) {
    toast.add({ title: 'Could not sign up', description: error.message, color: 'error' })
    return
  }
  // If email confirmation is off, a session is returned immediately.
  if (data.session) {
    await navigateTo('/app')
  } else {
    checkEmail.value = true
  }
}
</script>

<template>
  <UCard v-if="!checkEmail">
    <template #header>
      <h1 class="text-lg font-semibold">Start free</h1>
      <p class="text-sm text-muted mt-1">A board in thirty seconds. No card required.</p>
    </template>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <UFormField label="Name" name="name">
        <UInput
          v-model="name"
          autocomplete="name"
          placeholder="Ada Lovelace"
          required
          class="w-full"
        />
      </UFormField>

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

      <UFormField label="Password" name="password" hint="At least 6 characters">
        <UInput
          v-model="password"
          type="password"
          autocomplete="new-password"
          placeholder="••••••••"
          minlength="6"
          required
          class="w-full"
        />
      </UFormField>

      <UButton type="submit" block size="lg" :loading="loading" label="Create account" />
    </form>

    <template #footer>
      <p class="text-sm text-muted">
        Already have an account?
        <ULink to="/login" class="text-primary font-medium">Log in</ULink>
      </p>
    </template>
  </UCard>

  <UCard v-else>
    <template #header>
      <h1 class="text-lg font-semibold">Check your email</h1>
    </template>
    <p class="text-sm text-muted">
      We sent a confirmation link to <span class="text-highlighted font-medium">{{ email }}</span>.
      Click it to finish setting up your account.
    </p>
  </UCard>
</template>
