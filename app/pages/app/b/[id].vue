<script setup lang="ts">
import type { RealtimeChannel } from '@supabase/supabase-js'
import draggable from 'vuedraggable'
import type { Database } from '~/types/database.types'
import type { Board, Card } from '~/types/db'

definePageMeta({ layout: 'app' })

const route = useRoute()
const supabase = useSupabaseClient<Database>()
const toast = useToast()
const boardId = route.params.id as string

// --- Board ---
const { data: board } = await useAsyncData<Board | null>(
  `board-${boardId}`,
  async () => {
    const { data } = await supabase.from('boards').select('*').eq('id', boardId).single()
    return data
  }
)
if (!board.value) {
  throw createError({ statusCode: 404, statusMessage: 'Board not found', fatal: true })
}

// --- Cards (source of truth) ---
const { data: cards } = await useAsyncData<Card[]>(
  `cards-${boardId}`,
  async () => {
    const { data } = await supabase
      .from('cards')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true })
    return data ?? []
  },
  { default: () => [] }
)

// --- Column lists that vuedraggable mutates ---
const notDoneList = ref<Card[]>([])
const doneList = ref<Card[]>([])
const isDragging = ref(false)

function rebuildLists() {
  notDoneList.value = cards.value.filter(c => !c.done).sort((a, b) => a.position - b.position)
  doneList.value = cards.value.filter(c => c.done).sort((a, b) => a.position - b.position)
}
rebuildLists()

// Keep the lists in sync with the source, except while a drag is in flight
// (vuedraggable owns the arrays during the drag).
watch(cards, () => {
  if (!isDragging.value) rebuildLists()
})

// Reassign the source array on every change so the ref reliably re-renders.
function upsertLocal(row: Card) {
  const i = cards.value.findIndex(c => c.id === row.id)
  if (i >= 0) {
    const copy = [...cards.value]
    copy[i] = row
    cards.value = copy
  } else {
    cards.value = [...cards.value, row]
  }
}
function removeLocal(id: string) {
  cards.value = cards.value.filter(c => c.id !== id)
}

// --- Realtime: reconcile changes from any client (including this one) ---
let channel: RealtimeChannel | undefined
onMounted(() => {
  channel = supabase
    .channel(`cards-${boardId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'cards', filter: `board_id=eq.${boardId}` },
      (payload) => {
        if (payload.eventType === 'DELETE') {
          removeLocal((payload.old as { id?: string }).id as string)
        } else {
          upsertLocal(payload.new as Card)
        }
      }
    )
    .subscribe()
})
onUnmounted(() => {
  if (channel) supabase.removeChannel(channel)
})

// --- Mutations ---
const newDesc = ref('')
const adding = ref(false)

function endPosition(isDone: boolean) {
  const list = cards.value.filter(c => c.done === isDone)
  return list.length ? Math.max(...list.map(c => c.position)) + 1 : 0
}

async function addCard() {
  const desc = newDesc.value.trim()
  if (!desc) return
  adding.value = true
  const { data, error } = await supabase
    .from('cards')
    .insert({ board_id: boardId, description: desc, position: endPosition(false) })
    .select()
    .single()
  adding.value = false
  if (error) {
    toast.add({ title: 'Could not add card', description: error.message, color: 'error' })
    return
  }
  newDesc.value = ''
  if (data) upsertLocal(data)
}

// Single persist path for column/position changes.
async function moveCard(card: Card, isDone: boolean, position: number) {
  upsertLocal({ ...card, done: isDone, position }) // optimistic
  const { data, error } = await supabase
    .from('cards')
    .update({ done: isDone, position })
    .eq('id', card.id)
    .select()
    .single()
  if (error) {
    upsertLocal(card) // revert
    rebuildLists()
    toast.add({ title: 'Could not move card', description: error.message, color: 'error' })
  } else if (data) {
    upsertLocal(data) // pick up done_at/done_by
  }
}

function setDone(card: Card, value: boolean) {
  if (card.done === value) return
  moveCard(card, value, endPosition(value))
}

async function removeCard(card: Card) {
  const snapshot = cards.value
  removeLocal(card.id)
  rebuildLists()
  const { error } = await supabase.from('cards').delete().eq('id', card.id)
  if (error) {
    cards.value = snapshot
    rebuildLists()
    toast.add({ title: 'Could not delete card', description: error.message, color: 'error' })
  }
}

// --- Drag handling ---
// vuedraggable has already reordered the target list when @change fires.
// We compute the dropped card's new position from its neighbors and persist.
function onChange(evt: any, targetDone: boolean) {
  const info = evt.added ?? evt.moved
  if (!info) return // 'removed' is handled by the destination list's 'added'
  const list = targetDone ? doneList.value : notDoneList.value
  const idx = info.newIndex as number
  const card = info.element as Card
  const prev = list[idx - 1]
  const next = list[idx + 1]
  let pos: number
  if (prev && next) pos = (prev.position + next.position) / 2
  else if (prev) pos = prev.position + 1
  else if (next) pos = next.position - 1
  else pos = 0
  moveCard(card, targetDone, pos)
}

function onEnd() {
  isDragging.value = false
  rebuildLists()
}

// --- Edit ---
const editing = ref<Card | null>(null)
const editText = ref('')

function openEdit(card: Card) {
  editing.value = card
  editText.value = card.description
}
async function saveEdit() {
  if (!editing.value) return
  const desc = editText.value.trim()
  if (!desc) return
  const target = editing.value
  const { error } = await supabase.from('cards').update({ description: desc }).eq('id', target.id)
  if (error) {
    toast.add({ title: 'Could not save', description: error.message, color: 'error' })
    return
  }
  upsertLocal({ ...target, description: desc })
  editing.value = null
}

const cardActions = (card: Card, canEdit: boolean) => [[
  ...(canEdit ? [{ label: 'Edit', icon: 'i-lucide-pencil', onSelect: () => openEdit(card) }] : []),
  { label: 'Delete', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => removeCard(card) }
]]
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <UButton
        to="/app"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        aria-label="Back to boards"
      />
      <h1 class="text-2xl font-bold">{{ board?.name }}</h1>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Not Done -->
      <section>
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-muted">Not Done</h2>
          <UBadge :label="String(notDoneList.length)" color="neutral" variant="subtle" />
        </div>

        <form class="mb-4 space-y-2" @submit.prevent="addCard">
          <UTextarea
            v-model="newDesc"
            :rows="2"
            autoresize
            placeholder="Describe the outcome — what should exist when this is done?"
            class="w-full"
            @keydown.meta.enter="addCard"
            @keydown.ctrl.enter="addCard"
          />
          <div class="flex justify-end">
            <UButton
              type="submit"
              icon="i-lucide-plus"
              label="Add card"
              size="sm"
              :loading="adding"
              :disabled="!newDesc.trim()"
            />
          </div>
        </form>

        <ClientOnly>
          <draggable
            v-model="notDoneList"
            :group="{ name: 'cards' }"
            item-key="id"
            class="space-y-3 min-h-24 rounded-lg"
            :animation="150"
            ghost-class="opacity-40"
            filter="input,button,[role=menu]"
            :prevent-on-filter="false"
            @start="isDragging = true"
            @end="onEnd"
            @change="(e: any) => onChange(e, false)"
          >
            <template #item="{ element: card }">
              <div class="cursor-grab active:cursor-grabbing">
                <UCard :ui="{ body: 'p-3 sm:p-3' }">
                  <div class="flex items-start gap-3">
                    <UCheckbox
                      :model-value="card.done"
                      class="mt-0.5 shrink-0"
                      aria-label="Mark done"
                      @update:model-value="(v: boolean | 'indeterminate') => setDone(card, v === true)"
                    />
                    <p class="flex-1 text-sm whitespace-pre-wrap break-words">{{ card.description }}</p>
                    <UDropdownMenu :items="cardActions(card, true)">
                      <UButton
                        icon="i-lucide-ellipsis"
                        color="neutral"
                        variant="ghost"
                        size="sm"
                        aria-label="Card actions"
                        class="shrink-0"
                        @pointerdown.stop
                      />
                    </UDropdownMenu>
                  </div>
                </UCard>
              </div>
            </template>
          </draggable>
        </ClientOnly>

        <p v-if="!notDoneList.length" class="text-sm text-muted py-6 text-center">
          Nothing to do. Add a card above.
        </p>
      </section>

      <!-- Done -->
      <section>
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-primary">Done</h2>
          <UBadge :label="String(doneList.length)" color="primary" variant="subtle" />
        </div>

        <ClientOnly>
          <draggable
            v-model="doneList"
            :group="{ name: 'cards' }"
            item-key="id"
            class="space-y-3 min-h-24 rounded-lg"
            :animation="150"
            ghost-class="opacity-40"
            filter="input,button,[role=menu]"
            :prevent-on-filter="false"
            @start="isDragging = true"
            @end="onEnd"
            @change="(e: any) => onChange(e, true)"
          >
            <template #item="{ element: card }">
              <div class="cursor-grab active:cursor-grabbing">
                <UCard :ui="{ body: 'p-3 sm:p-3' }" class="bg-elevated/50">
                  <div class="flex items-start gap-3">
                    <UCheckbox
                      :model-value="card.done"
                      color="primary"
                      class="mt-0.5 shrink-0"
                      aria-label="Move back to Not Done"
                      @update:model-value="(v: boolean | 'indeterminate') => setDone(card, v === true)"
                    />
                    <p class="flex-1 text-sm whitespace-pre-wrap break-words text-muted line-through decoration-1">
                      {{ card.description }}
                    </p>
                    <UDropdownMenu :items="cardActions(card, false)">
                      <UButton
                        icon="i-lucide-ellipsis"
                        color="neutral"
                        variant="ghost"
                        size="sm"
                        aria-label="Card actions"
                        class="shrink-0"
                        @pointerdown.stop
                      />
                    </UDropdownMenu>
                  </div>
                </UCard>
              </div>
            </template>
          </draggable>
        </ClientOnly>

        <p v-if="!doneList.length" class="text-sm text-muted py-6 text-center">
          Nothing done yet. Finish a card to move it here.
        </p>
      </section>
    </div>

    <!-- Edit modal -->
    <UModal
      :open="!!editing"
      title="Edit card"
      @update:open="(v: boolean) => { if (!v) editing = null }"
    >
      <template #body>
        <form class="space-y-4" @submit.prevent="saveEdit">
          <UTextarea v-model="editText" :rows="3" autoresize class="w-full" />
          <div class="flex justify-end gap-2">
            <UButton label="Cancel" color="neutral" variant="ghost" @click="editing = null" />
            <UButton type="submit" label="Save" :disabled="!editText.trim()" />
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>
