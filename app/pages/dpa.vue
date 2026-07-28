<script setup lang="ts">
useSeoMeta({
  title: 'Data Processing Addendum — EASY',
  description: 'The Data Processing Addendum (DPA) governing EASY’s processing of personal data on behalf of business customers.'
})
</script>

<template>
  <UContainer class="py-16 max-w-3xl">
    <h1 class="text-3xl font-bold">Data Processing Addendum</h1>
    <p class="text-sm text-muted mt-2">Last updated: July 2026</p>

    <UAlert
      class="mt-6"
      color="warning"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      title="Template notice"
      description="This DPA is a starting point for Business and Enterprise agreements and is not legal advice. Have counsel adapt it to your obligations (GDPR, CCPA, etc.)."
    />

    <div class="mt-8 space-y-6 text-sm leading-relaxed">
      <section>
        <h2 class="text-lg font-semibold mb-2">Roles</h2>
        <p class="text-muted">
          For personal data contained in customer content, the customer is the
          controller and EASY is the processor, acting only on the customer’s
          documented instructions.
        </p>
      </section>
      <section>
        <h2 class="text-lg font-semibold mb-2">Scope of processing</h2>
        <p class="text-muted">
          We process customer personal data only to provide the service — storing
          and syncing boards and cards, authenticating users, and delivering
          optional features the customer enables.
        </p>
      </section>
      <section>
        <h2 class="text-lg font-semibold mb-2">Sub-processors</h2>
        <p class="text-muted">
          We engage vetted sub-processors for hosting, database and authentication,
          transactional email, and optional AI card assistance. A current list is
          available on request, and we’ll give notice of changes.
        </p>
      </section>
      <section>
        <h2 class="text-lg font-semibold mb-2">Security</h2>
        <p class="text-muted">
          We maintain appropriate technical and organizational measures — including
          encryption in transit, access controls, and row-level data isolation
          between organizations — to protect personal data.
        </p>
      </section>
      <section>
        <h2 class="text-lg font-semibold mb-2">International transfers</h2>
        <p class="text-muted">
          Where personal data is transferred across borders, we rely on appropriate
          safeguards such as Standard Contractual Clauses.
        </p>
      </section>
      <section>
        <h2 class="text-lg font-semibold mb-2">Assistance & deletion</h2>
        <p class="text-muted">
          We assist with data-subject requests and, on termination, delete or return
          customer personal data in accordance with the agreement.
        </p>
      </section>
      <section>
        <h2 class="text-lg font-semibold mb-2">Request a signed DPA</h2>
        <p class="text-muted">
          Need a countersigned DPA for procurement? <ULink to="/talk" class="text-primary">Contact us</ULink>.
        </p>
      </section>
    </div>
  </UContainer>
</template>
