// Hand-written Supabase schema types for the DOMO backend.
// Use with: createClient<Database>(url, anonKey)
// (or regenerate with: supabase gen types typescript --linked > src/lib/database.types.ts)

export type CoupleStatus = 'connected' | 'disconnected'
export type CoupleTone = 'bright' | 'calm' | 'minimal'
export type ChoreOwnerType = 'personal' | 'together'
export type NotificationType =
  | 'checkin'
  | 'reaction'
  | 'cheer'
  | 'streak'
  | 'badge'
  | 'coupleGoal'
  | 'reminder'
  | 'system'
  | 'chore'
  | 'comment'
  | 'complete'
  | 'letter'

type WithDefaults<T, Defaulted extends keyof T> = Omit<T, Defaulted> & Partial<Pick<T, Defaulted>>

export interface ProfileRow {
  id: string
  nickname: string
  color_tag: string
  avatar_url: string | null
  interests: string[]
  created_at: string
}
export interface CoupleRow {
  id: string
  name: string
  tagline: string
  tone: CoupleTone
  start_date: string | null
  connected_at: string
  status: CoupleStatus
  disconnected_at: string | null
  created_by: string | null
  created_at: string
}
export interface CoupleMemberRow {
  couple_id: string
  user_id: string
  joined_at: string
}
export interface CoupleInviteRow {
  id: string
  code: string
  couple_id: string
  inviter_id: string
  status: string
  accepted_by: string | null
  created_at: string
  expires_at: string | null
}
export interface ChoreCategoryRow {
  id: string
  couple_id: string
  label: string
  created_at: string
}
export interface ChoreRow {
  id: string
  couple_id: string
  owner_type: ChoreOwnerType
  owner_user_id: string | null
  title: string
  description: string | null
  category: string
  chore_date: string
  completed: boolean
  completed_at: string | null
  completed_by: string | null
  created_by: string
  created_at: string
  updated_at: string
}
export interface ChoreReactionRow {
  id: string
  chore_id: string
  user_id: string
  emoji: string
  created_at: string
}
export interface ChoreCommentRow {
  id: string
  chore_id: string
  user_id: string
  content: string
  created_at: string
}
export interface HouseMessageRow {
  id: string
  couple_id: string
  user_id: string
  content: string
  created_at: string
}
export interface LetterRow {
  id: string
  couple_id: string
  user_id: string
  image_path: string
  read: boolean
  created_at: string
}
export interface NotificationRow {
  id: string
  couple_id: string | null
  user_id: string
  type: NotificationType
  title: string
  body: string
  ref_id: string | null
  read: boolean
  created_at: string
}
export interface AccessLogRow {
  id: string
  couple_id: string | null
  actor_user_id: string | null
  action: string
  target_type: string
  target_id: string | null
  created_at: string
}

interface Table<R, I = R, U = Partial<I>> {
  Row: R
  Insert: I
  Update: U
}

export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow, WithDefaults<ProfileRow, 'nickname' | 'color_tag' | 'avatar_url' | 'interests' | 'created_at'>>
      couples: Table<CoupleRow, WithDefaults<CoupleRow, 'id' | 'name' | 'tagline' | 'tone' | 'start_date' | 'connected_at' | 'status' | 'disconnected_at' | 'created_at'>>
      couple_members: Table<CoupleMemberRow, WithDefaults<CoupleMemberRow, 'joined_at'>>
      couple_invites: Table<CoupleInviteRow, WithDefaults<CoupleInviteRow, 'id' | 'status' | 'accepted_by' | 'created_at' | 'expires_at'>>
      chore_categories: Table<ChoreCategoryRow, WithDefaults<ChoreCategoryRow, 'id' | 'created_at'>>
      chores: Table<ChoreRow, WithDefaults<ChoreRow, 'id' | 'owner_user_id' | 'description' | 'category' | 'completed' | 'completed_at' | 'completed_by' | 'created_at' | 'updated_at'>>
      chore_reactions: Table<ChoreReactionRow, WithDefaults<ChoreReactionRow, 'id' | 'created_at'>>
      chore_comments: Table<ChoreCommentRow, WithDefaults<ChoreCommentRow, 'id' | 'created_at'>>
      house_messages: Table<HouseMessageRow, WithDefaults<HouseMessageRow, 'id' | 'created_at'>>
      letters: Table<LetterRow, WithDefaults<LetterRow, 'id' | 'read' | 'created_at'>>
      notifications: Table<NotificationRow, WithDefaults<NotificationRow, 'id' | 'couple_id' | 'ref_id' | 'read' | 'created_at'>>
      access_log: Table<AccessLogRow, WithDefaults<AccessLogRow, 'id' | 'couple_id' | 'actor_user_id' | 'target_id' | 'created_at'>>
    }
    Functions: {
      create_couple: { Args: { p_name?: string; p_tagline?: string }; Returns: string }
      generate_invite: { Args: { p_couple_id: string }; Returns: string }
      accept_invite: { Args: { p_code: string }; Returns: string }
      disconnect_couple: { Args: { p_couple_id: string }; Returns: void }
    }
    Enums: {
      couple_status: CoupleStatus
      couple_tone: CoupleTone
      chore_owner_type: ChoreOwnerType
      notification_type: NotificationType
    }
  }
}
