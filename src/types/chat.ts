export interface ChatMessage {
  id: string
  userId: string
  name: string
  body: string
  /** Storage path of a dithered PNG, or null for a text-only message. */
  image: string | null
  createdAt: string
}
