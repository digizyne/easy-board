import type { Database } from '~/types/database.types'
import type { Organization } from '~/types/db'

// Shared org state. Personal org sorts first and is the default "current" org.
// Reloads when the logged-in user changes so state never leaks across accounts.
export function useOrgs() {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const orgs = useState<Organization[]>('orgs', () => [])
  const currentOrgId = useState<string | null>('currentOrgId', () => null)
  const loadedFor = useState<string | null>('orgsLoadedFor', () => null)

  async function load(force = false) {
    const uid = user.value?.id ?? null
    if (!force && loadedFor.value === uid && orgs.value.length) return

    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('personal', { ascending: false })
      .order('created_at', { ascending: true })

    if (!error) {
      orgs.value = data ?? []
      loadedFor.value = uid
      // Reset the current org if the cached id isn't among this user's orgs.
      if (!orgs.value.some(o => o.id === currentOrgId.value)) {
        currentOrgId.value = orgs.value[0]?.id ?? null
      }
    }
  }

  function reset() {
    orgs.value = []
    currentOrgId.value = null
    loadedFor.value = null
  }

  const currentOrg = computed(
    () => orgs.value.find(o => o.id === currentOrgId.value) ?? null
  )

  return { orgs, currentOrgId, currentOrg, load, reset }
}
