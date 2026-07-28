export interface CardAssistResult {
  outcome: string
  tooBig: boolean
  reason: string
  split: string[]
}

// Calls the server-side Claude route to rewrite a card as an outcome and
// suggest a split if it's too big for one session.
export function useCardAssist() {
  const toast = useToast()
  const loading = ref(false)

  async function assist(description: string): Promise<CardAssistResult | null> {
    const desc = description.trim()
    if (!desc) return null
    loading.value = true
    try {
      return await $fetch<CardAssistResult>('/api/ai/card-assist', {
        method: 'POST',
        body: { description: desc }
      })
    } catch (e) {
      const err = e as { statusCode?: number, statusMessage?: string }
      toast.add({
        title: err.statusCode === 429 ? 'Daily AI limit reached' : 'AI assist unavailable',
        description: err.statusMessage ?? 'Please try again.',
        color: err.statusCode === 429 ? 'warning' : 'error'
      })
      return null
    } finally {
      loading.value = false
    }
  }

  return { assist, loading }
}
