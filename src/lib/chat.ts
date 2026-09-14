// Transport for the site chat. See docs/chat.md for the contract.
import type { ChatMessage } from '~/types/chat'

export const CHAT_NAME_STORAGE_KEY = 'chat-name'
export const CHAT_NAME_MAX_LENGTH = 24
export const CHAT_BODY_MAX_LENGTH = 500
export const CHAT_PAGE_SIZE = 50
export const CHAT_TICKER_SIZE = 20

/** The chosen name from localStorage, or the auto name: anon plus the last 4 characters of the user id. */
export function getChatName(): string {
  throw new Error('not implemented')
}

/** True once a name was chosen in this browser. */
export function hasChosenChatName(): boolean {
  throw new Error('not implemented')
}

/** Stores the name and renames every message of this user id through set_chat_name. */
export function setChatName(_name: string): Promise<void> {
  throw new Error('not implemented')
}

/** Newest `limit` messages, oldest first. `before` pages backwards from a createdAt. */
export function fetchMessages(_limit: number, _before?: string): Promise<ChatMessage[]> {
  throw new Error('not implemented')
}

/** Sends through post_chat_message. Rejects with the database error message. */
export function postMessage(_name: string, _body: string): Promise<ChatMessage> {
  throw new Error('not implemented')
}

export interface ChatSubscription { unsubscribe: () => void }

/** Resolves to null when Supabase is not configured. */
export function subscribeChat(_handlers: {
  onInsert: (message: ChatMessage) => void
  onUpdate: (message: ChatMessage) => void
  onDelete: (id: string) => void
  onPresence: (onlineCount: number) => void
}): Promise<ChatSubscription | null> {
  throw new Error('not implemented')
}
