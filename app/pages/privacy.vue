<script setup lang="ts">
useSeoMeta({
  title: 'Privacy Policy — EASY',
  description: 'How EASY collects, uses, and protects your information.'
})
</script>

<template>
  <UContainer class="py-16 max-w-3xl">
    <h1 class="text-3xl font-bold">Privacy Policy</h1>
    <p class="text-sm text-muted mt-2">Last updated: July 2026</p>

    <UAlert
      class="mt-6"
      color="warning"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      title="Template notice"
      description="This is a starting-point policy and not legal advice. Have counsel review it before launch."
    />

    <div class="mt-8 space-y-6 text-sm leading-relaxed">
      <section>
        <h2 class="text-lg font-semibold mb-2">What we collect</h2>
        <p class="text-muted">
          Account information you provide (name, email), the content you create on
          your boards (cards and their descriptions), and basic usage and device
          data needed to operate and secure the service.
        </p>
      </section>
      <section>
        <h2 class="text-lg font-semibold mb-2">How we use it</h2>
        <p class="text-muted">
          To provide and improve EASY, authenticate you, sync your boards, respond
          to support and sales inquiries, and keep the service secure. We do not
          sell your personal information.
        </p>
      </section>
      <section>
        <h2 class="text-lg font-semibold mb-2">Sub-processors</h2>
        <p class="text-muted">
          We rely on infrastructure providers to run EASY (hosting, database and
          authentication, transactional email, and AI features for optional card
          assistance). Card text you submit to AI card assist is processed by our
          AI provider solely to generate a suggestion and is not used to train models.
        </p>
      </section>
      <section>
        <h2 class="text-lg font-semibold mb-2">Data retention</h2>
        <p class="text-muted">
          We keep your data for as long as your account is active. You can delete
          boards, cards, or your account at any time; deletion removes the associated
          data from our systems.
        </p>
      </section>
      <section>
        <h2 class="text-lg font-semibold mb-2">Your rights</h2>
        <p class="text-muted">
          Depending on where you live, you may have rights to access, correct, export,
          or delete your personal data. Contact us to exercise them.
        </p>
      </section>
      <section>
        <h2 class="text-lg font-semibold mb-2">Contact</h2>
        <p class="text-muted">
          Questions about privacy? <ULink to="/talk" class="text-primary">Get in touch</ULink>.
        </p>
      </section>
    </div>
  </UContainer>
</template>
