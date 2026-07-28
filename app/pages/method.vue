<script setup lang="ts">
useSeoMeta({
  title: 'What is EASY? — The methodology',
  description: 'EASY (Enumerative Agile subSYstem) strips project management to one question: is the work done, or not? A card describes the work. Two columns hold it.'
})
</script>

<template>
  <div>
    <UPageHero
      title="What is EASY?"
      description="EASY stands for Enumerative Agile subSYstem. It keeps the one part of Agile that still makes sense in an AI-accelerated world and discards the rest."
    />

    <UPageSection
      title="The whole methodology"
      description="You can learn it in a minute, because there isn’t much to learn."
      :features="[
        {
          icon: 'i-lucide-square-pen',
          title: 'The card',
          description: 'One card describes one unit of work — as an outcome, not a task. It is a gap between what exists and what should. It carries a description and nothing else.'
        },
        {
          icon: 'i-lucide-columns-2',
          title: 'The two columns',
          description: 'Not Done and Done. A card moves left to right exactly once. There is no In Progress to park work in and no Blocked state to hide behind.'
        },
        {
          icon: 'i-lucide-circle-check-big',
          title: 'The one question',
          description: 'Is it done? Not “does it compile” — done, as in the thing the card described now exists in the world. A human makes that call. That judgment is what EASY tracks.'
        }
      ]"
    />

    <UPageSection
      title="Why now"
      description="AI changed the economics of software work, and most project tools haven’t noticed."
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UCard>
          <h3 class="font-semibold">Effort came unbolted from time</h3>
          <p class="text-sm text-muted mt-2">
            When AI writes a variable share of the code, story points and velocity
            measure something that no longer exists. EASY doesn’t estimate — it
            counts what’s done.
          </p>
        </UCard>
        <UCard>
          <h3 class="font-semibold">The “In Progress” state got stale in hours</h3>
          <p class="text-sm text-muted mt-2">
            Work that used to take days now finishes in an afternoon. A column for
            “currently working on it” is out of date before anyone reads it.
          </p>
        </UCard>
        <UCard>
          <h3 class="font-semibold">Judgment became the scarce resource</h3>
          <p class="text-sm text-muted mt-2">
            AI can produce output fast. It can’t decide whether the output is good
            enough for real users. That human decision is the thing worth tracking.
          </p>
        </UCard>
        <UCard>
          <h3 class="font-semibold">The board is the report</h3>
          <p class="text-sm text-muted mt-2">
            A full Done column is more honest than any burndown chart. Count the
            cards, look at what they represent, talk to the team. No dashboard required.
          </p>
        </UCard>
      </div>
    </UPageSection>

    <UPageSection>
      <UPageCTA
        title="Try it in thirty seconds"
        description="The fastest way to understand EASY is to move a card to Done."
        variant="subtle"
        :links="[
          { label: 'Start free', to: '/signup', trailingIcon: 'i-lucide-arrow-right' },
          { label: 'Read the book', to: '/book', color: 'neutral', variant: 'outline' }
        ]"
      />
    </UPageSection>
  </div>
</template>
