<script setup lang="ts">
useSeoMeta({
  title: 'The Book — EASY',
  description: 'EASY: The World Changed. Your Standup Didn’t. The case for a project management methodology built for an AI-accelerated world.'
})

const parts = [
  {
    part: 'Part One',
    title: 'The Agile Trap',
    description: 'How a genuinely useful philosophy got buried under process — and why AI has made the cost of that burial impossible to ignore.'
  },
  {
    part: 'Part Two',
    title: 'The EASY Methodology',
    description: 'The whole system: a card, two columns, and the single question that still matters — is it done? It doesn’t take long, because it isn’t complicated.'
  },
  {
    part: 'Part Three',
    title: 'EASY in the Real World',
    description: 'What it actually takes to run EASY inside an organization — the rollout, the pushback, and the culture change the simplicity demands.'
  }
]
</script>

<template>
  <div>
    <UPageHero
      title="The World Changed. Your Standup Didn’t."
      description="EASY — Enumerative Agile subSYstem. The book that makes the case for stripping project management down to the one activity that survives an AI-accelerated world."
      :links="[
        { label: 'Buy the book', to: '/talk', trailingIcon: 'i-lucide-shopping-cart', size: 'xl' },
        { label: 'Start the board free', to: '/signup', color: 'neutral', variant: 'subtle', size: 'xl' }
      ]"
    />

    <UContainer class="pb-8">
      <UCard class="max-w-3xl mx-auto">
        <p class="text-lg leading-relaxed">
          “Out of everything modern Agile asks teams to do, only one core activity
          survives scrutiny in an AI-augmented world: you need to know what work needs
          to exist, and whether it exists yet. That question is answered with a card
          and two columns. Nothing else is tracked, because nothing else needs to be.”
        </p>
        <p class="text-sm text-muted mt-4">— from the Introduction</p>
      </UCard>
    </UContainer>

    <UPageSection
      title="What&rsquo;s inside"
      description="Three parts. Part Two is short on purpose."
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UCard v-for="p in parts" :key="p.title">
          <p class="text-xs font-semibold uppercase tracking-wide text-primary">{{ p.part }}</p>
          <h3 class="text-lg font-semibold mt-1">{{ p.title }}</h3>
          <p class="text-sm text-muted mt-2">{{ p.description }}</p>
        </UCard>
      </div>
    </UPageSection>

    <UPageSection>
      <UPageCTA
        title="Read it, then run it"
        description="The book gives you the argument. The board gives you the practice. Start either one today."
        variant="subtle"
        :links="[
          { label: 'Buy the book', to: '/talk', trailingIcon: 'i-lucide-arrow-right' },
          { label: 'See pricing', to: '/pricing', color: 'neutral', variant: 'outline' }
        ]"
      />
    </UPageSection>
  </div>
</template>
