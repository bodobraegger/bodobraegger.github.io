<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  CHAT_BODY_MAX_LENGTH,
  CHAT_NAME_MAX_LENGTH,
  CHAT_PAGE_SIZE,
  CHAT_TICKER_SIZE,
  fetchMessages,
  getChatName,
  hasChosenChatName,
  postMessage,
  setChatName,
  subscribeChat,
} from '../lib/chat'
import { getUserId } from '../lib/page-views'
import type { ChatMessage } from '../types/chat'

const TICKER_MESSAGE_COUNT = 10
/** How fast the ticker line passes, in characters per second. */
const TICKER_SPEED = 6
const SEND_ERROR_DISPLAY_MS = 3000
const SCROLL_BOTTOM_SLACK = 4

const userId = getUserId()

const configured = ref(false)
const open = ref(false)
const messages = ref<ChatMessage[]>([])
const onlineCount = ref(0)
const canLoadEarlier = ref(false)

const draftBody = ref('')
const sending = ref(false)
const sendError = ref<string | null>(null)

const showNameOffer = ref(false)
const nameDraft = ref('')

const listEl = ref<HTMLElement>()
const inputEl = ref<HTMLInputElement>()
let stickToBottom = true
let unsubscribe: (() => void) | null = null

// The newest messages as one line that scrolls through the bar. The line is
// laid out twice, so the loop rejoins itself without a gap.
const tickerLine = computed(() => messages.value
  .slice(-TICKER_MESSAGE_COUNT)
  .map(message => `${message.name}: ${message.body}`)
  .join(' · '))
const tickerDuration = computed(() => `${Math.max(tickerLine.value.length / TICKER_SPEED, 4)}s`)

function scrollListToBottom() {
  const el = listEl.value
  if (el)
    el.scrollTop = el.scrollHeight
}

function onListScroll() {
  const el = listEl.value
  if (!el)
    return
  stickToBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_BOTTOM_SLACK
}

function onInsert(message: ChatMessage) {
  messages.value.push(message)
  if (stickToBottom)
    nextTick(scrollListToBottom)
}

function onUpdate(message: ChatMessage) {
  const index = messages.value.findIndex(existing => existing.id === message.id)
  if (index !== -1)
    messages.value[index] = message
}

function onDelete(id: string) {
  const index = messages.value.findIndex(existing => existing.id === id)
  if (index !== -1)
    messages.value.splice(index, 1)
}

function onPresence(count: number) {
  onlineCount.value = count
}

async function openBox() {
  open.value = true
  if (messages.value.length < CHAT_PAGE_SIZE) {
    try {
      const fetched = await fetchMessages(CHAT_PAGE_SIZE)
      messages.value = fetched
      canLoadEarlier.value = fetched.length >= CHAT_PAGE_SIZE
    }
    catch {
      // Keep whatever the ticker already loaded.
    }
  }
  stickToBottom = true
  await nextTick()
  scrollListToBottom()
  inputEl.value?.focus()
}

function closeBox() {
  open.value = false
}

/** A click on the box that hits nothing else lands in the input. */
function focusInput(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('button, input, .chat-widget-name'))
    inputEl.value?.focus()
}

// The pen toolbar takes the same corner, so it steps aside while the chat is
// open, as the chat does while the pens are out (see pens-open in main.css).
watch(open, isOpen => document.documentElement.classList.toggle('chat-open', isOpen))

async function loadEarlier() {
  const oldest = messages.value[0]
  if (!oldest)
    return
  const el = listEl.value
  const previousScrollHeight = el?.scrollHeight ?? 0
  try {
    const fetched = await fetchMessages(CHAT_PAGE_SIZE, oldest.createdAt)
    messages.value = [...fetched, ...messages.value]
    canLoadEarlier.value = fetched.length >= CHAT_PAGE_SIZE
    await nextTick()
    if (el)
      el.scrollTop += el.scrollHeight - previousScrollHeight
  }
  catch {
    // Leave the list as it was; the link stays for another try.
  }
}

function offerName(prefill: string) {
  nameDraft.value = prefill
  showNameOffer.value = true
}

function showSendError(error: unknown) {
  sendError.value = error instanceof Error ? error.message : String(error)
  setTimeout(() => (sendError.value = null), SEND_ERROR_DISPLAY_MS)
}

async function confirmName() {
  const name = nameDraft.value.trim()
  if (!name) {
    showNameOffer.value = false
    return
  }
  try {
    await setChatName(name)
  }
  catch (error) {
    showSendError(error)
    return
  }
  for (const message of messages.value) {
    if (message.userId === userId)
      message.name = name
  }
  showNameOffer.value = false
}

function dismissNameOffer() {
  showNameOffer.value = false
}

async function send() {
  const body = draftBody.value.trim()
  if (!body || sending.value)
    return
  sending.value = true
  try {
    await postMessage(getChatName(), body)
    draftBody.value = ''
    if (!hasChosenChatName())
      offerName('')
  }
  catch (error) {
    showSendError(error)
  }
  finally {
    sending.value = false
  }
}

onMounted(async () => {
  let initial: ChatMessage[] = []
  try {
    initial = await fetchMessages(CHAT_TICKER_SIZE)
  }
  catch {
    // Subscribing below decides whether the widget shows at all.
  }
  const subscription = await subscribeChat({ onDelete, onInsert, onPresence, onUpdate })
  if (!subscription)
    return
  unsubscribe = subscription.unsubscribe
  messages.value = initial
  canLoadEarlier.value = initial.length >= CHAT_TICKER_SIZE
  configured.value = true
})

onUnmounted(() => {
  unsubscribe?.()
  document.documentElement.classList.remove('chat-open')
})
</script>

<template>
  <div v-if="configured" class="chat-widget font-mono" :class="{ open }">
    <div class="chat-widget-panel" @click="open && focusInput($event)">
      <div v-if="open" class="chat-widget-box">
        <button v-if="canLoadEarlier" class="chat-widget-earlier" @click="loadEarlier">
          earlier
        </button>
        <div ref="listEl" class="chat-widget-list" role="log" aria-live="polite" @scroll="onListScroll">
          <p v-for="message in messages" :key="message.id" class="chat-widget-message" :class="{ mine: message.userId === userId }">
            <span
              class="chat-widget-name"
              :title="new Date(message.createdAt).toLocaleString()"
              @click="message.userId === userId && offerName(message.name)"
            >{{ message.name }}</span>: <span class="chat-widget-body">{{ message.body }}</span>
          </p>
        </div>
        <div v-if="showNameOffer" class="chat-widget-name-offer">
          <span>sent as {{ getChatName() }} ·</span>
          <input
            v-model="nameDraft"
            placeholder="set a name"
            :maxlength="CHAT_NAME_MAX_LENGTH"
            @keydown.enter="confirmName"
            @keydown.esc="dismissNameOffer"
          >
        </div>
      </div>

      <button v-if="!open" class="chat-widget-bar" aria-expanded="false" aria-label="Open chat" @click="openBox">
        <span class="chat-widget-arrow" aria-hidden="true">▲</span>
        <span v-if="sendError" class="chat-widget-ticker chat-widget-error">{{ sendError }}</span>
        <span v-else class="chat-widget-ticker">
          <span v-if="tickerLine" class="chat-widget-ticker-track" :style="{ animationDuration: tickerDuration }">{{ tickerLine }} · {{ tickerLine }} · </span>
        </span>
        <span class="chat-widget-count">{{ onlineCount }}</span>
      </button>
      <div v-else class="chat-widget-bar">
        <button class="chat-widget-arrow" aria-expanded="true" aria-label="Close chat" @click="closeBox">
          ▼
        </button>
        <span v-if="sendError" class="chat-widget-ticker chat-widget-error">{{ sendError }}</span>
        <input
          v-else
          ref="inputEl"
          v-model="draftBody"
          class="chat-widget-input"
          :maxlength="CHAT_BODY_MAX_LENGTH"
          :disabled="sending"
          placeholder="say something"
          @keydown.enter="send"
        >
        <span class="chat-widget-count">{{ onlineCount }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-widget {
  position: fixed;
  right: 1.75rem;
  bottom: calc(1.75rem - 2px);
  z-index: 1000;
  width: 280px;
  font-size: 0.85rem;
}

/* The closed bar keeps its width on a phone, so the pen button at the left
   keeps its place. Only the open box takes the whole width. */
@media (max-width: 640px) {
  .chat-widget.open {
    left: 1.75rem;
    width: auto;
  }
}

.chat-widget-panel {
  display: flex;
  flex-direction: column;
  border: 1px dashed var(--fg);
  backdrop-filter: blur(2px);
}

.chat-widget-panel:hover {
  border-style: solid;
}

.chat-widget-box {
  display: flex;
  flex-direction: column;
  max-height: 50vh;
  min-height: 200px;
}

.chat-widget-earlier {
  flex: none;
  padding: 0.2rem 0;
  border: 0;
  border-bottom: 1px dashed var(--fg);
  background: transparent;
  color: var(--fg-muted);
  font: inherit;
  cursor: pointer;
}

.chat-widget-list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 0.3rem 0.5rem;
}

.chat-widget-message {
  margin: 0 0 0.3rem;
  color: var(--fg);
  overflow-wrap: break-word;
}

.chat-widget-name {
  color: var(--fg-deep);
  font-weight: 700;
}

.chat-widget-message.mine .chat-widget-name {
  cursor: pointer;
}

/* The bottom row is the bar itself: box and bar share one border, so this
   line is the only thing marking where the box ends. */
.chat-widget-box + .chat-widget-bar {
  border-top: 1px dashed var(--fg);
}

.chat-widget-name-offer {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex: none;
  height: 21px;
  padding: 0 0.4rem;
  border-top: 1px dashed var(--fg);
  color: var(--fg-muted);
  white-space: nowrap;
}

.chat-widget-name-offer input {
  flex: 1 1 auto;
  min-width: 0;
  background: transparent;
  border: 0;
  color: var(--fg);
  font: inherit;
}

.chat-widget-bar {
  display: flex;
  align-items: stretch;
  height: 21px;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--fg);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.chat-widget-arrow {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 21px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--fg);
  font-size: 0.7rem;
  cursor: pointer;
}

/* Flex blockifies these regardless of their own display, which is what lets
   text-overflow clip them; a display: flex here would defeat it. */
.chat-widget-ticker,
.chat-widget-input {
  flex: 1 1 auto;
  min-width: 0;
  line-height: 21px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.chat-widget-input {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--fg);
  font: inherit;
}

.chat-widget-ticker-track {
  display: inline-block;
  animation: chat-ticker linear infinite;
}

/* The track holds the line twice; moving it by half its width brings the
   second copy exactly where the first began. */
@keyframes chat-ticker {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .chat-widget-ticker-track {
    animation: none;
  }
}

.chat-widget-error {
  color: var(--fg-deep);
}

.chat-widget-count {
  flex: none;
  display: flex;
  align-items: center;
  padding: 0 0.4rem;
  color: var(--fg-muted);
}

@media print {
  .chat-widget {
    display: none;
  }
}
</style>
