<script setup lang="ts">
import { useSupabaseAuth } from '~/composables/useSupabaseAuth'
import { chatImageUrl } from '~/lib/chat'
import { getSupabase } from '~/lib/supabase'
import '~/styles/admin.css'

/** A row of public.chat_messages, as the admin reads and deletes it. */
interface ChatRow {
  id: string
  user_id: string
  name: string
  body: string
  image: string | null
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
              <img v-if="message.image" class="image-cell" :src="chatImageUrl(message.image)" alt="" loading="lazy">
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

<style scoped>
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

.image-cell {
  display: block;
  max-height: 80px;
  margin-top: 0.2rem;
  image-rendering: pixelated;
}

html.dark .image-cell {
  filter: invert(1);
}

.body-cell {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
