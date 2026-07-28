<script setup lang="ts">
useSeoMeta({
  title: 'Terms of Service — EASY',
  description: 'The terms that govern your use of EASY.'
})
</script>

<template>
  <UContainer class="py-16 max-w-3xl">
    <h1 class="text-3xl font-bold">Terms of Service</h1>
    <p class="text-sm text-muted mt-2">Last updated: July 2026</p>

    <UAlert
      class="mt-6"
      color="warning"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      title="Template notice"
      description="This is a starting-point agreement and not legal advice. Have counsel review it before launch."
    />

    <div class="mt-8 space-y-6 text-sm leading-relaxed">
      <section>
        <h2 class="text-lg font-semibold mb-2">Using EASY</h2>
        <p class="text-muted">
          By creating an account you agree to these terms. You’re responsible for
          activity under your account and for keeping your credentials secure. Don’t
          use EASY to break the law or infringe others’ rights.
        </p>
      </section>
      <section>
        <h2 class="text-lg font-semibold mb-2">Your content</h2>
        <p class="text-muted">
          You own the content you put on your boards. You grant us the limited rights
          needed to store, process, and display it so we can provide the service.
        </p>
      </section>
      <section>
        <h2 class="text-lg font-semibold mb-2">Plans and billing</h2>
        <p class="text-muted">
          Paid plans are billed per seat on a recurring basis until cancelled. Fees
          are non-refundable except where required by law. We’ll give notice of
          material price changes.
        </p>
      </section>
      <section>
        <h2 class="text-lg font-semibold mb-2">Availability</h2>
        <p class="text-muted">
          We work to keep EASY available and reliable, but the service is provided
          “as is” without warranties. Enterprise agreements may include a specific SLA.
        </p>
      </section>
      <section>
        <h2 class="text-lg font-semibold mb-2">Termination</h2>
        <p class="text-muted">
          You can stop using EASY and delete your account at any time. We may suspend
          or terminate accounts that violate these terms.
        </p>
      </section>
      <section>
        <h2 class="text-lg font-semibold mb-2">Contact</h2>
        <p class="text-muted">
          Questions about these terms? <ULink to="/talk" class="text-primary">Reach out</ULink>.
        </p>
      </section>
    </div>
  </UContainer>
</template>
