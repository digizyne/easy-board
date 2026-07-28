<script setup lang="ts">
useSeoMeta({
  title: 'Consulting — EASY',
  description: 'The board is simple. Changing how an organization works is not. EASY consulting delivers guided rollouts, coaching, and certification.'
})

const services = [
  {
    icon: 'i-lucide-rocket',
    title: 'Guided rollout',
    description: 'We embed with your teams to switch a real project to EASY — not a pilot in a corner. Boards set up, ceremonies retired, first cards shipped, in weeks not quarters.'
  },
  {
    icon: 'i-lucide-users',
    title: 'Dedicated coach',
    description: 'A certified EASY practitioner works with your leads through the hard part: the cultural change. Trust as infrastructure, Done defined honestly, no backsliding into velocity theater.'
  },
  {
    icon: 'i-lucide-graduation-cap',
    title: 'Training & certification',
    description: 'Workshops for engineers, managers, and executives — plus “EASY Certified” credentials for the people who’ll carry it after we leave.'
  },
  {
    icon: 'i-lucide-shield-check',
    title: 'Leadership alignment',
    description: 'The objections come from the top as often as the bottom. We help you make the case to leadership and answer the “but how will we know it’s working?” question.'
  }
]

const steps = [
  { n: '01', title: 'Assess', description: 'We look at how your teams actually work today — the ceremonies, the metrics, the overhead — and where EASY will bite first.' },
  { n: '02', title: 'Roll out', description: 'One team, one real project. Boards live, ceremonies cut, the Done column filling up. Momentum you can point at.' },
  { n: '03', title: 'Scale & certify', description: 'Expand across teams, certify your internal champions, and hand the keys back. We’re done when you don’t need us.' }
]
</script>

<template>
  <div>
    <UPageHero
      title="The board is easy. The change is the work."
      description="Adopting EASY is a thirty-second signup and a genuine shift in how your organization thinks about progress. We help with the second part."
      :links="[
        { label: 'Talk to us', to: '/talk', trailingIcon: 'i-lucide-arrow-right', size: 'xl' },
        { label: 'See pricing', to: '/pricing', color: 'neutral', variant: 'subtle', size: 'xl' }
      ]"
    />

    <UPageSection
      title="How we help"
      description="Software adoption is the easy part. We’re here for everything around it."
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UCard v-for="s in services" :key="s.title">
          <div class="flex items-start gap-3">
            <div class="rounded-lg bg-primary/10 p-2 shrink-0">
              <UIcon :name="s.icon" class="size-5 text-primary" />
            </div>
            <div>
              <h3 class="font-semibold">{{ s.title }}</h3>
              <p class="text-sm text-muted mt-1">{{ s.description }}</p>
            </div>
          </div>
        </UCard>
      </div>
    </UPageSection>

    <UPageSection
      title="How an engagement works"
      description="Weeks, not quarters. We measure success by how quickly you stop needing us."
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UCard v-for="step in steps" :key="step.n">
          <p class="text-3xl font-bold text-primary/30">{{ step.n }}</p>
          <h3 class="font-semibold mt-2">{{ step.title }}</h3>
          <p class="text-sm text-muted mt-1">{{ step.description }}</p>
        </UCard>
      </div>
    </UPageSection>

    <UPageSection>
      <UPageCTA
        title="Ship faster, with fewer meetings"
        description="Tell us about your teams and we’ll show you what an EASY rollout looks like for you."
        :links="[
          { label: 'Talk to us', to: '/talk', trailingIcon: 'i-lucide-arrow-right' }
        ]"
      />
    </UPageSection>
  </div>
</template>
