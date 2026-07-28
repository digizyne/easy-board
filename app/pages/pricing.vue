<script setup lang="ts">
useSeoMeta({
  title: 'Pricing — EASY',
  description: 'Simple, per-seat pricing. Free for small teams forever. We charge for scale and support — never for complexity.'
})

const plans = [
  {
    name: 'Solo',
    price: '$0',
    period: 'forever',
    tagline: 'For individuals and small teams getting started.',
    cta: { label: 'Start free', to: '/signup', variant: 'subtle' as const },
    features: [
      'Up to 3 collaborators',
      '3 boards',
      'Unlimited cards',
      'Real-time sync',
      '90-day Done archive',
      'AI card assist (limited)'
    ]
  },
  {
    name: 'Team',
    price: '$8',
    period: 'per user / mo',
    tagline: 'For product teams shipping every day.',
    highlight: true,
    cta: { label: 'Start free', to: '/signup', variant: 'solid' as const },
    features: [
      'Unlimited collaborators',
      'Unlimited boards',
      'Unlimited Done archive',
      'AI card assist (full)',
      'GitHub / CI auto-move to Done',
      'Slack, export & API'
    ]
  },
  {
    name: 'Business',
    price: '$18',
    period: 'per user / mo',
    tagline: 'For multi-team orgs that need control.',
    cta: { label: 'Start free', to: '/signup', variant: 'subtle' as const },
    features: [
      'Everything in Team',
      'Portfolio view (org-wide Done)',
      'SSO / SAML & SCIM',
      'Admin roles & audit log',
      '“EASY Certified” badge',
      'Priority support'
    ]
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'talk to us',
    tagline: 'A guided rollout, not just software.',
    cta: { label: 'Talk to us', to: '/talk', variant: 'subtle' as const },
    features: [
      'Everything in Business',
      'Guided EASY rollout + dedicated coach',
      'Team training & certification',
      'On-prem / VPC option',
      'DPA & custom SLA',
      'Custom / enterprise SSO'
    ]
  }
]
</script>

<template>
  <div>
    <UPageHero
      title="Pricing that gets out of your way"
      description="Per-seat and predictable. Free for small teams, forever. We charge for scale, security, and support — never for complexity."
    />

    <UContainer class="pb-16">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <UCard
          v-for="plan in plans"
          :key="plan.name"
          :class="plan.highlight ? 'ring-2 ring-primary' : ''"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">{{ plan.name }}</h3>
            <UBadge v-if="plan.highlight" label="Popular" color="primary" variant="subtle" />
          </div>
          <div class="mt-3 flex items-baseline gap-1">
            <span class="text-3xl font-bold">{{ plan.price }}</span>
            <span class="text-sm text-muted">{{ plan.period }}</span>
          </div>
          <p class="text-sm text-muted mt-2 min-h-10">{{ plan.tagline }}</p>

          <UButton
            :label="plan.cta.label"
            :to="plan.cta.to"
            :variant="plan.cta.variant"
            :color="plan.highlight ? 'primary' : 'neutral'"
            block
            class="mt-4"
          />

          <USeparator class="my-4" />

          <ul class="space-y-2">
            <li
              v-for="f in plan.features"
              :key="f"
              class="flex items-start gap-2 text-sm"
            >
              <UIcon name="i-lucide-check" class="size-4 text-primary shrink-0 mt-0.5" />
              <span>{{ f }}</span>
            </li>
          </ul>
        </UCard>
      </div>

      <div class="mt-10 text-center">
        <p class="text-muted">
          Every plan keeps the promise: no assignees, no due dates, no story points — ever.
        </p>
        <UButton
          to="/never"
          label="See what we'll never build"
          trailing-icon="i-lucide-arrow-right"
          color="neutral"
          variant="link"
        />
      </div>
    </UContainer>

    <UPageSection>
      <UPageCTA
        title="Shipping software for a bigger org?"
        description="The board is free. The transformation is where we earn our keep — guided rollout, coaching, and certification."
        variant="subtle"
        :links="[
          { label: 'Talk to us', to: '/talk', trailingIcon: 'i-lucide-arrow-right' },
          { label: 'See consulting', to: '/consulting', color: 'neutral', variant: 'outline' }
        ]"
      />
    </UPageSection>
  </div>
</template>
