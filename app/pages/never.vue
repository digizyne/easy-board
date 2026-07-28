<script setup lang="ts">
useSeoMeta({
  title: 'Features We’ll Never Build — EASY',
  description: 'Most tools measure their worth by what they add. EASY measures it by what it refuses to. Here is our anti-roadmap.'
})

const nevers = [
  {
    icon: 'i-lucide-user-x',
    title: 'Assignees',
    why: 'Work lives in a shared pool. The moment a card has an owner, it has a queue, a bottleneck, and someone to blame. Anyone — or any AI — pulls the next card.'
  },
  {
    icon: 'i-lucide-calendar-x',
    title: 'Due dates',
    why: 'A date turns an estimate into a promise and pressures teams to cut quality to hit it. If something is time-sensitive, that’s a conversation, not a field.'
  },
  {
    icon: 'i-lucide-hash',
    title: 'Story points & estimates',
    why: 'Points measure human effort. When AI does a variable share of the work, that number is fiction. We won’t help you generate a more confident guess.'
  },
  {
    icon: 'i-lucide-columns-3',
    title: 'Custom columns & statuses',
    why: 'A card is Not Done or Done. Every column in between is a place for work to sit and look like progress. We will not sell you an escape valve.'
  },
  {
    icon: 'i-lucide-flag',
    title: 'A “Blocked” state',
    why: 'Blocking is a communication problem, not a board state. The fix is to talk to whoever can unblock it — not to give the stall a nice label.'
  },
  {
    icon: 'i-lucide-gauge',
    title: 'Velocity charts & burndowns',
    why: 'Dashboards that turn the measure into the target. The board is the report: count the Done cards, look at what they represent, talk to the team.'
  },
  {
    icon: 'i-lucide-trophy',
    title: 'Points, streaks & leaderboards',
    why: 'Finishing a card should feel good — and then be gone. A score you can protect is a score you’ll game, by chopping work into trivial cards.'
  }
]
</script>

<template>
  <div>
    <UPageHero
      title="Features we&rsquo;ll never build"
      description="Most tools advertise what they add. EASY is defined by what it refuses to. This is our anti-roadmap — and it&rsquo;s a promise, at every price tier."
    />

    <UContainer class="pb-16">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UCard v-for="n in nevers" :key="n.title">
          <div class="flex items-start gap-3">
            <div class="rounded-lg bg-elevated p-2 shrink-0">
              <UIcon :name="n.icon" class="size-5 text-muted" />
            </div>
            <div>
              <h3 class="font-semibold flex items-center gap-2">
                {{ n.title }}
                <UBadge label="Never" color="neutral" variant="subtle" size="sm" />
              </h3>
              <p class="text-sm text-muted mt-1">{{ n.why }}</p>
            </div>
          </div>
        </UCard>
      </div>

      <p class="text-center text-muted mt-10 max-w-2xl mx-auto">
        Subtraction is the product. If a feature would make it easier to look busy
        instead of ship, it will never ship here.
      </p>
    </UContainer>

    <UPageSection>
      <UPageCTA
        title="A board that does less, on purpose"
        description="Create one in thirty seconds and feel the difference."
        variant="subtle"
        :links="[
          { label: 'Start free', to: '/signup', trailingIcon: 'i-lucide-arrow-right' },
          { label: 'Read the book', to: '/book', color: 'neutral', variant: 'outline' }
        ]"
      />
    </UPageSection>
  </div>
</template>
