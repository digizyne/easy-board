<script setup lang="ts">
useSeoMeta({
  title: 'Talk to us — EASY',
  description: 'Planning an EASY rollout, buying the book for your team, or exploring Enterprise? Tell us about your team and we’ll be in touch.'
})

const toast = useToast()
const form = reactive({ name: '', email: '', company: '', teamSize: '', message: '' })
const teamSizes = ['Just me', '2–10', '11–50', '51–200', '200+']
const submitting = ref(false)
const sent = ref(false)

async function onSubmit() {
  if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
    toast.add({ title: 'Please fill in your name, email, and a message.', color: 'warning' })
    return
  }
  submitting.value = true
  try {
    await $fetch('/api/lead', { method: 'POST', body: { ...form } })
    sent.value = true
  } catch (e) {
    const err = e as { statusMessage?: string }
    toast.add({ title: 'Could not send', description: err.statusMessage ?? 'Please try again.', color: 'error' })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <UPageHero
      title="Talk to us"
      description="Rolling out EASY across teams, equipping people with the book, or sizing up Enterprise? Tell us what you’re working on."
    />

    <UContainer class="pb-16">
      <UCard class="max-w-xl mx-auto">
        <div v-if="sent" class="text-center py-8">
          <UIcon name="i-lucide-circle-check-big" class="size-10 text-primary mx-auto mb-3" />
          <h2 class="text-lg font-semibold">Thanks — we’ve got it.</h2>
          <p class="text-sm text-muted mt-1">
            We’ll be in touch at <span class="text-highlighted">{{ form.email }}</span> shortly.
          </p>
          <UButton to="/" label="Back to home" color="neutral" variant="ghost" class="mt-4" />
        </div>

        <form v-else class="space-y-4" @submit.prevent="onSubmit">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Name" name="name" required>
              <UInput v-model="form.name" placeholder="Ada Lovelace" class="w-full" />
            </UFormField>
            <UFormField label="Work email" name="email" required>
              <UInput v-model="form.email" type="email" placeholder="you@company.com" class="w-full" />
            </UFormField>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Company" name="company">
              <UInput v-model="form.company" placeholder="Acme Inc." class="w-full" />
            </UFormField>
            <UFormField label="Team size" name="teamSize">
              <USelect v-model="form.teamSize" :items="teamSizes" placeholder="Select…" class="w-full" />
            </UFormField>
          </div>

          <UFormField label="How can we help?" name="message" required>
            <UTextarea
              v-model="form.message"
              :rows="4"
              autoresize
              placeholder="We run 4 product teams on Jira and want to pilot EASY next quarter…"
              class="w-full"
            />
          </UFormField>

          <UButton type="submit" label="Send" size="lg" block :loading="submitting" />
          <p class="text-xs text-muted text-center">
            We’ll only use this to reply about EASY. See our
            <ULink to="/privacy" class="text-primary">privacy policy</ULink>.
          </p>
        </form>
      </UCard>
    </UContainer>
  </div>
</template>
