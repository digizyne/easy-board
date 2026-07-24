<script setup lang="ts">
import type { Database } from '~/types/database.types'
import type { Board } from '~/types/db'

definePageMeta({ layout: 'app' })

const supabase = useSupabaseClient<Database>()
const toast = useToast()
const { currentOrgId, currentOrg, load } = useOrgs()

await load()

const { data: boards, refresh } = await useAsyncData<Board[]>(
  'boards',
  async () => {
    if (!currentOrgId.value) return []
    const { data } = await supabase
      .from('boards')
      .select('*')
      .eq('org_id', currentOrgId.value)
      .is('archived_at', null)
      .order('created_at', { ascending: true })
    return data ?? []
  },
  { watch: [currentOrgId], default: () => [] }
)

// Per-board card counts (done / total), fetched in one query.
type Counts = Record<string, { done: number, total: number }>
const { data: counts, refresh: refreshCounts } = await useAsyncData<Counts>(
  'board-counts',
  async () => {
    const ids = boards.value.map(b => b.id)
    const map: Counts = {}
    for (const id of ids) map[id] = { done: 0, total: 0 }
    if (!ids.length) return map
    const { data } = await supabase.from('cards').select('board_id, done').in('board_id', ids)
    for (const row of data ?? []) {
      const c = map[row.board_id]
      if (!c) continue
      c.total++
      if (row.done) c.done++
    }
    return map
  },
  { watch: [boards], default: () => ({}) }
)

const showCreate = ref(false)
const newName = ref('')
const creating = ref(false)

async function createBoard() {
  const nameVal = newName.value.trim()
  if (!nameVal || !currentOrgId.value) return
  creating.value = true
  const { data, error } = await supabase
    .from('boards')
    .insert({ org_id: currentOrgId.value, name: nameVal })
    .select()
    .single()
  creating.value = false

  if (error) {
    // DB trigger enforces the Free-plan board cap.
    const limitHit = error.message.toLowerCase().includes('board limit')
    toast.add({
      title: limitHit ? 'Board limit reached' : 'Could not create board',
      description: limitHit
        ? 'The Free plan includes 3 boards. Upgrade to add more.'
        : error.message,
      color: limitHit ? 'warning' : 'error',
      actions: limitHit ? [{ label: 'See plans', to: '/pricing' }] : undefined
    })
    return
  }

  showCreate.value = false
  newName.value = ''
  await refresh()
  await navigateTo(`/app/b/${data!.id}`)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Boards</h1>
        <p class="text-sm text-muted mt-1">
          {{ currentOrg?.name }} · {{ boards.length }} board{{ boards.length === 1 ? '' : 's' }}
        </p>
      </div>
      <UButton icon="i-lucide-plus" label="New board" @click="showCreate = true" />
    </div>

    <div
      v-if="boards.length"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <UCard
        v-for="board in boards"
        :key="board.id"
        class="hover:ring-primary transition cursor-pointer"
        @click="navigateTo(`/app/b/${board.id}`)"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <UIcon name="i-lucide-columns-2" class="size-5 text-primary shrink-0" />
            <span class="font-medium truncate">{{ board.name }}</span>
          </div>
          <UIcon name="i-lucide-arrow-right" class="size-4 text-muted shrink-0" />
        </div>

        <template #footer>
          <div class="flex items-center gap-3">
            <UBadge
              :label="`${counts[board.id]?.done ?? 0}/${counts[board.id]?.total ?? 0} done`"
              :color="(counts[board.id]?.total ?? 0) > 0 && counts[board.id]?.done === counts[board.id]?.total ? 'primary' : 'neutral'"
              variant="subtle"
            />
            <UProgress
              v-if="(counts[board.id]?.total ?? 0) > 0"
              :model-value="counts[board.id]!.done"
              :max="counts[board.id]!.total"
              size="sm"
              class="flex-1"
            />
          </div>
        </template>
      </UCard>
    </div>

    <div
      v-else
      class="border border-dashed border-default rounded-lg p-12 text-center"
    >
      <UIcon name="i-lucide-columns-2" class="size-8 text-muted mx-auto mb-3" />
      <p class="font-medium">No boards yet</p>
      <p class="text-sm text-muted mt-1 mb-4">Create your first board to start moving cards.</p>
      <UButton icon="i-lucide-plus" label="New board" @click="showCreate = true" />
    </div>

    <UModal v-model:open="showCreate" title="New board">
      <template #body>
        <form class="space-y-4" @submit.prevent="createBoard">
          <UFormField label="Board name" name="name">
            <UInput
              v-model="newName"
              placeholder="e.g. Q3 Product"
              autofocus
              required
              class="w-full"
            />
          </UFormField>
          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="ghost"
              @click="showCreate = false"
            />
            <UButton type="submit" label="Create board" :loading="creating" />
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>
