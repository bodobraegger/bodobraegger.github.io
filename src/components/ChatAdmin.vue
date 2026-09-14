<script setup lang="ts">
import { useSupabaseAuth } from '~/composables/useSupabaseAuth'
import { getSupabase } from '~/lib/supabase'

/** A row of public.chat_messages, as the admin reads and deletes it. */
interface ChatRow {
  id: string
  user_id: string
  name: string
  body: string
  created_at: string
}

const MAX_ROWS = 200

const messages = ref<ChatRow[]>([])
const selectedIds = ref(new Set<string>())
const loading = ref(true)
const error = ref('')
const showConfirmDelete = ref(false)

const { user, email, password, showAuth, signIn, signOut } = useSupabaseAuth(error, loading)

async function loadMessages() {
  loading.value = true
  error.value = ''

  try {
    const supabase = await getSupabase()
    if (!supabase) {
      error.value = 'Supabase is not configured.'
      return
    }

    const { data, error: err } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(MAX_ROWS)

    if (err)
      throw err

    messages.value = data ?? []
  }
  catch (e: any) {
    error.value = e.message || 'Failed to load messages'
    console.error('Load error:', e)
  }
  finally {
    loading.value = false
  }
}

function toggleRow(id: string) {
  if (selectedIds.value.has(id))
    selectedIds.value.delete(id)
  else
    selectedIds.value.add(id)
}

function selectAll() {
  selectedIds.value = new Set(messages.value.map(m => m.id))
}

function clearSelection() {
  selectedIds.value.clear()
}

function requestDelete() {
  if (selectedIds.value.size === 0)
    return

  if (!user.value) {
    error.value = 'You must be authenticated to delete messages'
    showAuth.value = true
    return
  }

  showConfirmDelete.value = true
}

function cancelDelete() {
  showConfirmDelete.value = false
}

async function confirmDelete() {
  showConfirmDelete.value = false

  const ids = Array.from(selectedIds.value)
  if (ids.length === 0)
    return

  const supabase = await getSupabase()
  if (!supabase)
    return

  loading.value = true
  error.value = ''

  const { error: err } = await supabase
    .from('chat_messages')
    .delete()
    .in('id', ids)

  if (err) {
    error.value = err.message
    console.error('Delete error:', err)
  }
  else {
    const deletedIds = new Set(ids)
    messages.value = messages.value.filter(m => !deletedIds.has(m.id))
    selectedIds.value.clear()
  }

  loading.value = false
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
    return

  if (e.key === 'Escape') {
    if (showConfirmDelete.value)
      cancelDelete()
    else
      clearSelection()
    return
  }

  const modifier = e.ctrlKey || e.metaKey
  const key = e.key.toLowerCase()

  if (modifier && key === 'a') {
    e.preventDefault()
    selectAll()
  }
  else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.value.size > 0) {
    e.preventDefault()
    requestDelete()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  loadMessages()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="admin-container">
    <header class="admin-header">
      <span>chat admin</span>

      <div class="admin-center">
        <div class="admin-controls">
          <button :disabled="loading" @click="loadMessages">
            refresh
          </button>
          <button :disabled="messages.length === 0" @click="selectAll">
            all
          </button>
          <button :disabled="selectedIds.size === 0" @click="clearSelection">
            none
          </button>
          <button
            :disabled="selectedIds.size === 0 || !user"
            :title="!user ? 'Sign in to delete' : ''"
            @click="requestDelete"
          >
            delete ({{ selectedIds.size }})
          </button>
        </div>
        <div class="admin-stats">
          <span>{{ messages.length }} messages · {{ selectedIds.size }} selected</span>
        </div>
      </div>

      <div class="auth-status">
        <span v-if="user">{{ user.email }}</span>
        <button v-if="user" @click="signOut">
          sign out
        </button>
        <button v-else @click="showAuth = !showAuth">
          {{ showAuth ? 'hide login' : 'sign in' }}
        </button>
      </div>
    </header>

    <p v-if="error" class="error-message">
      {{ error }}
    </p>

    <!-- Auth Form -->
    <div v-if="showAuth && !user" class="auth-form">
      <h3>sign in to delete messages</h3>
      <form @submit.prevent="signIn">
        <input
          v-model="email"
          type="email"
          placeholder="email"
          required
          autocomplete="email"
        >
        <input
          v-model="password"
          type="password"
          placeholder="password"
          required
          autocomplete="current-password"
        >
        <button type="submit" :disabled="loading">
          {{ loading ? 'signing in...' : 'sign in' }}
        </button>
      </form>
    </div>

    <!-- Confirm Delete Dialog -->
    <div v-if="showConfirmDelete" class="confirm-overlay">
      <div class="confirm-dialog">
        <h3>confirm deletion</h3>
        <p>Delete {{ selectedIds.size }} message{{ selectedIds.size === 1 ? '' : 's' }}?</p>
        <div class="confirm-actions">
          <button @click="cancelDelete">
            cancel
          </button>
          <button class="delete-btn" @click="confirmDelete">
            delete
          </button>
        </div>
      </div>
    </div>

    <div class="table-viewport">
      <table>
        <thead>
          <tr>
            <th />
            <th>time</th>
            <th>name</th>
            <th>user id</th>
            <th>body</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="message in messages"
            :key="message.id"
            :class="{ selected: selectedIds.has(message.id) }"
            @click="toggleRow(message.id)"
          >
            <td><input type="checkbox" :checked="selectedIds.has(message.id)" @click.stop="toggleRow(message.id)"></td>
            <td>{{ new Date(message.created_at).toLocaleString() }}</td>
            <td>{{ message.name }}</td>
            <td :title="message.user_id">
              {{ message.user_id.slice(-8) }}
            </td>
            <td class="body-cell">
              {{ message.body }}
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!loading && messages.length === 0" class="empty-state">
        <p>no messages</p>
      </div>

      <div v-if="loading && messages.length === 0" class="loading-state">
        <p>loading messages...</p>
      </div>
    </div>
  </div>
</template>

<style>
/* Hide the page footer and page scrollbar behind the fullscreen admin view */
main > div:last-child {
  display: none;
}

html:has(.admin-container) {
  overflow: hidden;
  scrollbar-gutter: unset;
}
</style>

<style scoped>
.admin-container {
  position: fixed;
  inset: 0;
  z-index: 39;
  /* clear the site header and footer chrome */
  padding: 3.5rem 0;
  display: flex;
  flex-direction: column;
  font-family: var(--fonts-mono);
}

header {
  border-bottom: 1px dashed var(--fg-deep);
  padding: 1rem 1.75rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1.2rem;
}

.admin-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.admin-controls {
  display: flex;
  gap: 1.2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.admin-stats {
  display: flex;
  gap: 1.5rem;
  font-size: 0.75rem;
  opacity: 0.6;
}

.auth-status {
  display: flex;
  gap: 0.8rem;
  justify-self: end;
}

/* Reuse site button styles */
button {
  background: var(--c-bg);
  color: var(--fg);
  border: 1px dashed var(--fg-deep);
  padding: 0 4px;
  opacity: 0.7;
}

button:hover:not(:disabled) {
  opacity: 1;
}

button:disabled {
  opacity: 0.35;
}

.error-message {
  color: #f44;
  margin: 0;
  padding: 0.5rem 1.75rem;
}

.auth-form,
.confirm-dialog {
  background: var(--c-bg);
  border: 1px dashed var(--fg-deep);
  padding: 1rem;
  min-width: 300px;
}

.auth-form {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

.auth-form form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: grid;
  place-items: center;
}

.confirm-actions {
  display: flex;
  gap: 1rem;
  justify-content: end;
}

.delete-btn {
  color: #f44;
  border-color: #f44;
}

.table-viewport {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0 1.75rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

thead th {
  position: sticky;
  top: 0;
  background: var(--c-bg);
  text-align: left;
  padding: 0.5rem;
  border-bottom: 1px dashed var(--fg-deep);
}

tbody td {
  padding: 0.4rem 0.5rem;
  border-bottom: 1px dashed var(--c-border);
  vertical-align: top;
}

tbody tr {
  cursor: pointer;
}

tbody tr:hover {
  background: var(--c-border);
}

tbody tr.selected {
  background: var(--fg-deep);
  color: var(--c-bg);
}

.body-cell {
  white-space: pre-wrap;
  word-break: break-word;
}

.empty-state,
.loading-state {
  display: grid;
  place-items: center;
  height: 100%;
  opacity: 0.6;
}
</style>
