// Transport for the site chat. See docs/chat.md for the contract.
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { getUserId } from './page-views'
import { getSupabase } from './supabase'
import type { ChatMessage } from '~/types/chat'

export const CHAT_NAME_STORAGE_KEY = 'chat-name'
export const CHAT_NAME_MAX_LENGTH = 24
export const CHAT_BODY_MAX_LENGTH = 500
export const CHAT_PAGE_SIZE = 50
export const CHAT_TICKER_SIZE = 20

interface ChatMessageRow {
  id: string
  user_id: string
  name: string
  body: string
  created_at: string
}

/** Maps a chat_messages row to a ChatMessage. */
export function rowToMessage(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    body: row.body,
    createdAt: row.created_at,
  }
}

/** The chosen name from localStorage, or the auto name: anon plus the last 4 characters of the user id. */
export function getChatName(): string {
  try {
    const stored = localStorage.getItem(CHAT_NAME_STORAGE_KEY)
    if (stored)
      return stored
  }
  catch {
    // Storage unavailable: fall through to the auto name.
  }
  return `anon${getUserId().slice(-4)}`
}

/** True once a name was chosen in this browser. */
export function hasChosenChatName(): boolean {
  try {
    return localStorage.getItem(CHAT_NAME_STORAGE_KEY) !== null
  }
  catch {
    return false
  }
}

/** Stores the name and renames every message of this user id through set_chat_name. */
export async function setChatName(name: string): Promise<void> {
  const trimmed = name.trim()
  try {
    localStorage.setItem(CHAT_NAME_STORAGE_KEY, trimmed)
  }
  catch {
    // Storage unavailable: the rpc call below still renames the messages.
  }

  const supabase = await getSupabase()
  if (!supabase)
    throw new Error('chat is not configured')

  const { error } = await supabase.rpc('set_chat_name', { name: trimmed })
  if (error)
    throw new Error(error.message)
}

/** Newest `limit` messages, oldest first. `before` pages backwards from a createdAt. */
export async function fetchMessages(limit: number, before?: string): Promise<ChatMessage[]> {
  const supabase = await getSupabase()
  if (!supabase)
    return []

  let query = supabase
    .from('chat_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (before)
    query = query.lt('created_at', before)

  const { data, error } = await query
  if (error || !data)
    return []

  return (data as ChatMessageRow[]).map(rowToMessage).reverse()
}

/** Sends through post_chat_message. Rejects with the database error message. */
export async function postMessage(name: string, body: string): Promise<ChatMessage> {
  const supabase = await getSupabase()
  if (!supabase)
    throw new Error('chat is not configured')

  const { data, error } = await supabase.rpc('post_chat_message', { name, body })
  if (error || !data)
    throw new Error(error?.message ?? 'chat is not configured')

  return rowToMessage(data as ChatMessageRow)
}

export interface ChatSubscription { unsubscribe: () => void }

/** Resolves to null when Supabase is not configured. */
export async function subscribeChat(handlers: {
  onInsert: (message: ChatMessage) => void
  onUpdate: (message: ChatMessage) => void
  onDelete: (id: string) => void
  onPresence: (onlineCount: number) => void
}): Promise<ChatSubscription | null> {
  const supabase = await getSupabase()
  if (!supabase)
    return null

  const channel: RealtimeChannel = supabase
    .channel('chat', { config: { presence: { key: getUserId() } } })
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'chat_messages' },
      (payload: RealtimePostgresChangesPayload<ChatMessageRow>) => {
        handlers.onInsert(rowToMessage(payload.new as ChatMessageRow))
      },
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'chat_messages' },
      (payload: RealtimePostgresChangesPayload<ChatMessageRow>) => {
        handlers.onUpdate(rowToMessage(payload.new as ChatMessageRow))
      },
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'chat_messages' },
      (payload: RealtimePostgresChangesPayload<ChatMessageRow>) => {
        handlers.onDelete((payload.old as ChatMessageRow).id)
      },
    )
    .on('presence', { event: 'sync' }, () => {
      handlers.onPresence(Object.keys(channel.presenceState()).length)
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED')
        channel.track({})
    })

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel)
    },
  }
}
