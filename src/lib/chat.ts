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
/** The bucket's file_size_limit; the upload is refused above it, so the client checks first. */
export const CHAT_IMAGE_MAX_BYTES = 65536

const CHAT_IMAGE_BUCKET = 'chat-images'

interface ChatMessageRow {
  id: string
  user_id: string
  name: string
  body: string
  image: string | null
  created_at: string
}

/** Maps a chat_messages row to a ChatMessage. */
export function rowToMessage(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    body: row.body,
    image: row.image ?? null,
    createdAt: row.created_at,
  }
}

/** Public URL of an uploaded chat image. */
export function chatImageUrl(path: string): string {
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${CHAT_IMAGE_BUCKET}/${path}`
}

/** Uploads a PNG and returns its storage path, the shape the bucket policy and post_chat_message accept. */
export async function uploadImage(png: Blob): Promise<string> {
  if (png.size > CHAT_IMAGE_MAX_BYTES)
    throw new Error('image_too_large')
  const supabase = await getSupabase()
  if (!supabase)
    throw new Error('chat is not configured')

  const path = `chat/${crypto.randomUUID()}.png`
  const { error } = await supabase.storage.from(CHAT_IMAGE_BUCKET).upload(path, png, { contentType: 'image/png' })
  if (error)
    throw new Error(error.message)
  return path
}

const ADJECTIVES = ['amber', 'brisk', 'calm', 'dusty', 'eager', 'faint', 'giddy', 'hazy', 'idle', 'jolly', 'keen', 'loud', 'mossy', 'nimble', 'odd', 'pale', 'quiet', 'rusty', 'shy', 'tidy', 'umber', 'vivid', 'warm', 'young', 'zesty', 'bold', 'cosy', 'damp', 'early', 'fuzzy', 'grand', 'humble']
const NOUNS = ['otter', 'heron', 'pebble', 'comet', 'fern', 'kettle', 'lantern', 'marble', 'newt', 'orchid', 'pigeon', 'quill', 'raven', 'saddle', 'thistle', 'urchin', 'violin', 'walnut', 'yarrow', 'zephyr', 'badger', 'cloud', 'dune', 'ember', 'goose', 'harbor', 'iris', 'jasper', 'kite', 'lemon', 'meadow', 'needle']

/** Two words picked by the user id, so a browser keeps its name without storing it. */
function autoName(userId: string): string {
  let hash = 0
  for (const char of userId)
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return `${ADJECTIVES[hash % ADJECTIVES.length]} ${NOUNS[Math.floor(hash / ADJECTIVES.length) % NOUNS.length]}`
}

/** The chosen name from localStorage, or the auto name. */
export function getChatName(): string {
  try {
    const stored = localStorage.getItem(CHAT_NAME_STORAGE_KEY)
    if (stored)
      return stored
  }
  catch {
    // Storage unavailable: fall through to the auto name.
  }
  return autoName(getUserId())
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
export async function postMessage(name: string, body: string, image?: string): Promise<ChatMessage> {
  const supabase = await getSupabase()
  if (!supabase)
    throw new Error('chat is not configured')

  const { data, error } = await supabase.rpc('post_chat_message', { name, body, image: image ?? null })
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
