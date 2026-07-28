<script setup lang="ts">
import type { RealtimeChannel } from '@supabase/supabase-js'
import draggable from 'vuedraggable'
import type { Database } from '~/types/database.types'
import type { Board, Card } from '~/types/db'
import type { CardAssistResult } from '~/composables/useCardAssist'

definePageMeta({ layout: 'app' })

const route = useRoute()
const supabase = useSupabaseClient<Database>()
const toast = useToast()
const { completionBurst, allClearBurst } = useCelebrate()
const boardId = route.params.id as string

// --- Board (lazy: don't block navigation; show a skeleton instead) ---
const { data: board, status: boardStatus } = useLazyAsyncData<Board | null>(
  `board-${boardId}`,
  async () => {
    const { data } = await supabase.from('boards').select('*').eq('id', boardId).single()
    return data
  }
)

// --- Cards (lazy) ---
const { data: cards, status: cardsStatus } = useLazyAsyncData<Card[]>(
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

const loading = computed(() => boardStatus.value !== 'success' || cardsStatus.value !== 'success')
const notFound = computed(() => boardStatus.value === 'success' && !board.value)

// --- Column lists that vuedraggable mutates ---
const notDoneList = ref<Card[]>([])
const doneList = ref<Card[]>([])
const isDragging = ref(false)

function rebuildLists() {
  notDoneList.value = cards.value.filter(c => !c.done).sort((a, b) => a.position - b.position)
  doneList.value = cards.value.filter(c => c.done).sort((a, b) => a.position - b.position)
}
rebuildLists()

// Keep the lists in sync with the source, except while a drag is in flight.
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

// --- Card mutations ---
const newDesc = ref('')
const adding = ref(false)

function endPosition(isDone: boolean) {
  const list = cards.value.filter(c => c.done === isDone)
  return list.length ? Math.max(...list.map(c => c.position)) + 1 : 0
}

async function addCard(descArg?: string) {
  const fromInput = descArg === undefined
  const desc = (descArg ?? newDesc.value).trim()
  if (!desc) return
  if (fromInput) adding.value = true
  const { data, error } = await supabase
    .from('cards')
    .insert({ board_id: boardId, description: desc, position: endPosition(false) })
    .select()
    .single()
  if (fromInput) adding.value = false
  if (error) {
    toast.add({ title: 'Could not add card', description: error.message, color: 'error' })
    return
  }
  if (fromInput) newDesc.value = ''
  if (data) upsertLocal(data)
}

// --- AI card assist ---
const { assist, loading: aiLoading } = useCardAssist()
const aiResult = ref<CardAssistResult | null>(null)

async function runAssist() {
  aiResult.value = null
  const result = await assist(newDesc.value)
  if (result) aiResult.value = result
}
function useOutcome() {
  if (aiResult.value) newDesc.value = aiResult.value.outcome
  aiResult.value = null
}
async function addSplitCard(desc: string) {
  await addCard(desc)
  if (aiResult.value) {
    aiResult.value.split = aiResult.value.split.filter(s => s !== desc)
    if (!aiResult.value.split.length) aiResult.value = null
  }
}
async function addAllSplit() {
  if (!aiResult.value) return
  for (const s of aiResult.value.split) await addCard(s)
  newDesc.value = ''
  aiResult.value = null
}

async function moveCard(card: Card, isDone: boolean, position: number) {
  const becameDone = isDone && !card.done
  upsertLocal({ ...card, done: isDone, position }) // optimistic
  if (becameDone) {
    // Defer so vuedraggable finishes its DOM moves before we toggle the
    // card-pop class (otherwise Vue patches a node SortableJS is still moving).
    const id = card.id
    setTimeout(() => celebrateCompletion(id), 0)
  }
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
    upsertLocal(data)
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

// --- Celebration (ephemeral positive reinforcement) ---
const lastPointer = ref({ x: 0.5, y: 0.5 }) // normalized screen coords
function onPointerUp(e: PointerEvent) {
  if (e.clientX || e.clientY) {
    lastPointer.value = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
  }
}

const justCompletedId = ref<string | null>(null)
const showAllClear = ref(false)
const affirmation = ref<{ text: string, left: number, top: number, key: number } | null>(null)
let affirmKey = 0
const AFFIRMATIONS = ['Shipped.', 'Done.', 'Nice.', 'Clean.', 'Gone.', 'Complete.', 'Finished.', '✅', '🎉', '💯', '👏', '👍', '✨', '🏁', '🚀']

function celebrateCompletion(cardId: string) {
  // Card "pop" on the newly-completed card.
  justCompletedId.value = cardId
  setTimeout(() => {
    if (justCompletedId.value === cardId) justCompletedId.value = null
  }, 650)

  const { x, y } = lastPointer.value
  const remaining = cards.value.filter(c => !c.done).length

  // Everything's done → the bigger, on-brand milestone.
  if (remaining === 0) {
    allClearBurst()
    showAllClear.value = true
    setTimeout(() => (showAllClear.value = false), 2200)
    return
  }

  completionBurst(x, y)

  // Variable reward: an affirmation only some of the time.
  if (import.meta.client && Math.random() < 0.45) {
    affirmKey += 1
    const myKey = affirmKey
    affirmation.value = {
      text: AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]!,
      left: x * window.innerWidth,
      top: y * window.innerHeight,
      key: myKey
    }
    setTimeout(() => {
      if (affirmation.value?.key === myKey) affirmation.value = null
    }, 1100)
  }
}

// --- Drag handling ---
function onChange(evt: any, targetDone: boolean) {
  const info = evt.added ?? evt.moved
  if (!info) return
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

// --- Edit card ---
const editing = ref<Card | null>(null)
const editText = ref('')
const { assist: assistEdit, loading: editAiLoading } = useCardAssist()
const editAiResult = ref<CardAssistResult | null>(null)

function openEdit(card: Card) {
  editing.value = card
  editText.value = card.description
  editAiResult.value = null
}
function closeEdit() {
  editing.value = null
  editAiResult.value = null
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
  closeEdit()
}

async function runEditAssist() {
  editAiResult.value = null
  const result = await assistEdit(editText.value)
  if (result) editAiResult.value = result
}
function useEditOutcome() {
  if (editAiResult.value) editText.value = editAiResult.value.outcome
  editAiResult.value = null
}
async function addEditSplitCard(desc: string) {
  await addCard(desc)
  if (editAiResult.value) {
    editAiResult.value.split = editAiResult.value.split.filter(s => s !== desc)
  }
}

const cardActions = (card: Card, canEdit: boolean) => [[
  ...(canEdit ? [{ label: 'Edit', icon: 'i-lucide-pencil', onSelect: () => openEdit(card) }] : []),
  { label: 'Delete', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => removeCard(card) }
]]

// --- Board rename / delete ---
const boardActions = [[
  { label: 'Rename', icon: 'i-lucide-pencil', onSelect: () => openRename() },
  { label: 'Delete board', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => (showDelete.value = true) }
]]

const showRename = ref(false)
const renameText = ref('')
const renaming = ref(false)

function openRename() {
  renameText.value = board.value?.name ?? ''
  showRename.value = true
}
async function saveRename() {
  const name = renameText.value.trim()
  if (!name || !board.value) return
  renaming.value = true
  const { error } = await supabase.from('boards').update({ name }).eq('id', boardId)
  renaming.value = false
  if (error) {
    toast.add({ title: 'Could not rename board', description: error.message, color: 'error' })
    return
  }
  board.value = { ...board.value, name }
  showRename.value = false
  refreshNuxtData('boards') // keep the dashboard list in sync
}

const showDelete = ref(false)
const deleting = ref(false)

async function deleteBoard() {
  deleting.value = true
  const { error } = await supabase.from('boards').delete().eq('id', boardId)
  if (error) {
    deleting.value = false
    toast.add({ title: 'Could not delete board', description: error.message, color: 'error' })
    return
  }
  toast.add({ title: 'Board deleted', color: 'success' })
  await refreshNuxtData(['boards', 'board-counts']) // drop the deleted board from the dashboard
  await navigateTo('/app')
}
</script>

<template>
  <div @pointerup="onPointerUp">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <UButton
        to="/app"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        aria-label="Back to boards"
      />
      <USkeleton v-if="boardStatus !== 'success'" class="h-8 w-56" />
      <template v-else-if="board">
        <h1 class="text-2xl font-bold flex-1 truncate">{{ board.name }}</h1>
        <UDropdownMenu :items="boardActions">
          <UButton
            icon="i-lucide-ellipsis"
            color="neutral"
            variant="ghost"
            aria-label="Board actions"
          />
        </UDropdownMenu>
      </template>
      <h1 v-else class="text-2xl font-bold text-muted">Board not found</h1>
    </div>

    <!-- Not found -->
    <div
      v-if="notFound"
      class="border border-dashed border-default rounded-lg p-12 text-center"
    >
      <UIcon name="i-lucide-search-x" class="size-8 text-muted mx-auto mb-3" />
      <p class="font-medium">This board doesn’t exist</p>
      <p class="text-sm text-muted mt-1 mb-4">It may have been deleted, or you don’t have access.</p>
      <UButton to="/app" label="Back to boards" icon="i-lucide-arrow-left" />
    </div>

    <!-- Loading skeleton -->
    <div v-else-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <section v-for="col in 2" :key="col">
        <div class="flex items-center justify-between mb-3">
          <USkeleton class="h-4 w-24" />
          <USkeleton class="h-5 w-6 rounded-full" />
        </div>
        <div class="space-y-3">
          <div
            v-for="n in (col === 1 ? 4 : 2)"
            :key="n"
            class="rounded-lg border border-default p-3"
          >
            <div class="flex items-start gap-3">
              <USkeleton class="size-4 rounded shrink-0 mt-0.5" />
              <div class="flex-1 space-y-2">
                <USkeleton class="h-3.5 w-full" />
                <USkeleton class="h-3.5 w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Board -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Not Done -->
      <section>
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-muted">Not Done</h2>
          <UBadge :label="String(notDoneList.length)" color="neutral" variant="subtle" />
        </div>

        <form class="mb-4 space-y-2" @submit.prevent="addCard()">
          <UTextarea
            v-model="newDesc"
            :rows="2"
            autoresize
            placeholder="Describe the outcome — what should exist when this is done?"
            class="w-full"
            @keydown.meta.enter="addCard()"
            @keydown.ctrl.enter="addCard()"
          />
          <div class="flex justify-between gap-2">
            <UButton
              icon="i-lucide-sparkles"
              label="AI assist"
              size="sm"
              color="neutral"
              variant="ghost"
              :loading="aiLoading"
              :disabled="!newDesc.trim()"
              @click="runAssist"
            />
            <UButton
              type="submit"
              icon="i-lucide-plus"
              label="Add card"
              size="sm"
              :loading="adding"
              :disabled="!newDesc.trim()"
            />
          </div>

          <!-- AI suggestion panel -->
          <UCard
            v-if="aiResult"
            :ui="{ body: 'p-3 sm:p-3' }"
            class="bg-primary/5 ring-primary/30"
          >
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="flex items-center gap-1.5 text-primary text-xs font-semibold uppercase tracking-wide">
                <UIcon name="i-lucide-sparkles" class="size-3.5" />
                Suggestion
              </div>
              <UButton
                icon="i-lucide-x"
                size="xs"
                color="neutral"
                variant="ghost"
                aria-label="Dismiss"
                @click="aiResult = null"
              />
            </div>

            <p class="text-xs text-muted mb-1">Outcome</p>
            <p class="text-sm mb-2 whitespace-pre-wrap">{{ aiResult.outcome }}</p>
            <div class="flex justify-end mb-2">
              <UButton label="Use this" size="xs" icon="i-lucide-check" @click="useOutcome" />
            </div>

            <template v-if="aiResult.tooBig && aiResult.split.length">
              <USeparator class="my-2" />
              <p class="text-xs text-muted mb-2">
                {{ aiResult.reason || 'This looks like more than one session of work.' }}
                Split into:
              </p>
              <ul class="space-y-2">
                <li
                  v-for="(s, i) in aiResult.split"
                  :key="i"
                  class="flex items-start gap-2"
                >
                  <p class="flex-1 text-sm whitespace-pre-wrap">{{ s }}</p>
                  <UButton
                    icon="i-lucide-plus"
                    size="xs"
                    color="neutral"
                    variant="soft"
                    aria-label="Add this card"
                    @click="addSplitCard(s)"
                  />
                </li>
              </ul>
              <div class="flex justify-end mt-2">
                <UButton
                  :label="`Add all ${aiResult.split.length} cards`"
                  size="xs"
                  icon="i-lucide-list-plus"
                  @click="addAllSplit"
                />
              </div>
            </template>
          </UCard>
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
              <div
                class="cursor-grab active:cursor-grabbing"
                :class="justCompletedId === card.id ? 'card-pop' : ''"
              >
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

    <!-- Rename modal -->
    <UModal v-model:open="showRename" title="Rename board">
      <template #body>
        <form class="space-y-4" @submit.prevent="saveRename">
          <UFormField label="Board name" name="name">
            <UInput v-model="renameText" autofocus required class="w-full" />
          </UFormField>
          <div class="flex justify-end gap-2">
            <UButton label="Cancel" color="neutral" variant="ghost" @click="showRename = false" />
            <UButton type="submit" label="Save" :loading="renaming" :disabled="!renameText.trim()" />
          </div>
        </form>
      </template>
    </UModal>

    <!-- Delete confirm modal -->
    <UModal v-model:open="showDelete" title="Delete board?">
      <template #body>
        <p class="text-sm text-muted">
          This permanently deletes <span class="text-highlighted font-medium">{{ board?.name }}</span>
          and all of its cards. This can’t be undone.
        </p>
        <div class="flex justify-end gap-2 mt-4">
          <UButton label="Cancel" color="neutral" variant="ghost" @click="showDelete = false" />
          <UButton
            label="Delete board"
            color="error"
            icon="i-lucide-trash-2"
            :loading="deleting"
            @click="deleteBoard"
          />
        </div>
      </template>
    </UModal>

    <!-- Edit card modal -->
    <UModal
      :open="!!editing"
      title="Edit card"
      @update:open="(v: boolean) => { if (!v) closeEdit() }"
    >
      <template #body>
        <form class="space-y-4" @submit.prevent="saveEdit">
          <UTextarea v-model="editText" :rows="3" autoresize class="w-full" />

          <!-- AI suggestion panel -->
          <UCard
            v-if="editAiResult"
            :ui="{ body: 'p-3 sm:p-3' }"
            class="bg-primary/5 ring-primary/30"
          >
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="flex items-center gap-1.5 text-primary text-xs font-semibold uppercase tracking-wide">
                <UIcon name="i-lucide-sparkles" class="size-3.5" />
                Suggestion
              </div>
              <UButton
                icon="i-lucide-x"
                size="xs"
                color="neutral"
                variant="ghost"
                aria-label="Dismiss"
                @click="editAiResult = null"
              />
            </div>

            <p class="text-xs text-muted mb-1">Outcome</p>
            <p class="text-sm mb-2 whitespace-pre-wrap">{{ editAiResult.outcome }}</p>
            <div class="flex justify-end mb-2">
              <UButton label="Use this" size="xs" icon="i-lucide-check" @click="useEditOutcome" />
            </div>

            <template v-if="editAiResult.tooBig && editAiResult.split.length">
              <USeparator class="my-2" />
              <p class="text-xs text-muted mb-2">
                {{ editAiResult.reason || 'This looks like more than one session of work.' }}
                Add as separate cards:
              </p>
              <ul class="space-y-2">
                <li
                  v-for="(s, i) in editAiResult.split"
                  :key="i"
                  class="flex items-start gap-2"
                >
                  <p class="flex-1 text-sm whitespace-pre-wrap">{{ s }}</p>
                  <UButton
                    icon="i-lucide-plus"
                    size="xs"
                    color="neutral"
                    variant="soft"
                    aria-label="Add this card"
                    @click="addEditSplitCard(s)"
                  />
                </li>
              </ul>
            </template>
          </UCard>

          <div class="flex justify-between gap-2">
            <UButton
              icon="i-lucide-sparkles"
              label="AI assist"
              color="neutral"
              variant="ghost"
              :loading="editAiLoading"
              :disabled="!editText.trim()"
              @click="runEditAssist"
            />
            <div class="flex gap-2">
              <UButton label="Cancel" color="neutral" variant="ghost" @click="closeEdit" />
              <UButton type="submit" label="Save" :disabled="!editText.trim()" />
            </div>
          </div>
        </form>
      </template>
    </UModal>

    <!-- Celebration overlays -->
    <span
      v-if="affirmation"
      :key="affirmation.key"
      class="affirm text-primary"
      :style="{ left: `${affirmation.left}px`, top: `${affirmation.top}px` }"
    >
      {{ affirmation.text }}
    </span>

    <div v-if="showAllClear" class="allclear-wrap">
      <div class="allclear-pill">
        <UIcon name="i-lucide-party-popper" class="size-5" />
        <span>Nothing left. Ship it.</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-pop {
  animation: cardPop 600ms ease;
  border-radius: 0.5rem;
}
@keyframes cardPop {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
  30% { transform: scale(1.035); box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.45); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.affirm {
  position: fixed;
  z-index: 50;
  pointer-events: none;
  font-weight: 700;
  font-size: 1.125rem;
  animation: affirmFloat 1100ms ease forwards;
}
@keyframes affirmFloat {
  0% { opacity: 0; transform: translate(-50%, -40%) scale(0.9); }
  20% { opacity: 1; transform: translate(-50%, -70%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -160%) scale(1); }
}

.allclear-wrap {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 18vh;
  pointer-events: none;
}
.allclear-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 9999px;
  font-weight: 600;
  color: var(--ui-bg, #fff);
  background: var(--ui-primary, #10b981);
  box-shadow: 0 10px 30px -8px rgba(16, 185, 129, 0.55);
  animation: allClear 2200ms ease forwards;
}
@keyframes allClear {
  0% { opacity: 0; transform: translateY(10px) scale(0.96); }
  10% { opacity: 1; transform: translateY(0) scale(1); }
  80% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-6px) scale(1); }
}

/* Respect reduced-motion: keep the feedback, drop the movement. */
@media (prefers-reduced-motion: reduce) {
  .card-pop { animation: none; }
  .affirm { animation: affirmFade 1100ms ease forwards; transform: translate(-50%, -50%); }
  @keyframes affirmFade { 0% { opacity: 0; } 20% { opacity: 1; } 100% { opacity: 0; } }
  .allclear-pill { animation: affirmFade 2200ms ease forwards; }
}
</style>
