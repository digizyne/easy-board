// Convenience aliases over the generated Supabase types.
// Import these in app code instead of reaching into Database[...] by hand.
import type { Database } from './database.types'

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type Insert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type Update<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Profile = Tables<'profiles'>
export type Organization = Tables<'organizations'>
export type OrganizationMember = Tables<'organization_members'>
export type Board = Tables<'boards'>
export type Card = Tables<'cards'>
export type Invitation = Tables<'invitations'>

export type PlanTier = Database['public']['Enums']['plan_tier']
export type MemberRole = Database['public']['Enums']['member_role']
