<template>
  <div>
    <UPageHero
      title="Agile, minus everything that slows you down."
      description="EASY is Agile stripped to the one thing that still matters in an AI-accelerated world: is the work done, or not? A card describes the work. Two columns — Not Done and Done. No assignees, no due dates, no story points, no standups. Just work that ships."
      :links="[{
        label: 'Start free',
        to: '/signup',
        trailingIcon: 'i-lucide-arrow-right',
        size: 'xl'
      }, {
        label: 'Read the book',
        to: '/book',
        size: 'xl',
        color: 'neutral',
        variant: 'subtle'
      }]"
    />

    <UPageSection
      title="Everything most tools track, EASY deletes."
      description="Every ceremony and field in traditional Agile was built to coordinate humans working at human speed. When AI writes the code, most of it answers questions no one needs to ask anymore."
      :features="[{
        icon: 'i-lucide-square-check-big',
        title: 'One card, one question',
        description: 'A card is a gap between what exists and what should. It is either done or it is not. That binary is the whole methodology.'
      }, {
        icon: 'i-lucide-columns-2',
        title: 'Two columns',
        description: 'Not Done and Done. No In Progress to park work in, no Blocked state to hide behind. Work moves left to right exactly once.'
      }, {
        icon: 'i-lucide-users',
        title: 'No assignees',
        description: 'Work lives in a shared pool. Anyone — or any AI — can pick up the next card. Ownership of a unit of work is no longer the point.'
      }, {
        icon: 'i-lucide-calendar-x',
        title: 'No due dates or points',
        description: 'Estimates calibrated to human effort break the moment AI enters the loop. So we do not pretend to make them.'
      }, {
        icon: 'i-lucide-bot',
        title: 'Built for AI teammates',
        description: 'Outcome-phrased cards give AI tools the goal, not the steps. The human judgment that says “this is done” is what EASY tracks.'
      }, {
        icon: 'i-lucide-eye',
        title: 'The board is the report',
        description: 'A full Done column is more honest than any burndown chart. Count the cards. Look at what they represent. That is the status update.'
      }]"
    />

    <UPageSection>
      <UPageCTA
        title="Stop managing the process. Start shipping the work."
        description="Create a board in thirty seconds. Free for small teams, forever."
        variant="subtle"
        :links="[{
          label: 'Start free',
          to: '/signup',
          trailingIcon: 'i-lucide-arrow-right'
        }, {
          label: 'See pricing',
          to: '/pricing',
          color: 'neutral',
          variant: 'outline'
        }]"
      />
    </UPageSection>
  </div>
</template>
