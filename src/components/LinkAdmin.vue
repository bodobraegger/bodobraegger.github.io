<script setup lang="ts">
import { useSelection } from '~/composables/useSelection'
import { useSupabaseAuth } from '~/composables/useSupabaseAuth'
import { getSupabase } from '~/lib/supabase'

/** A row of public.short_links. */
interface LinkRow {
  slug: string
  target: string
  clicks: number
  created_at: string
}

const SHORT_LINK_BASE = 'https://bbo.do/l/'
const SLUG_PATTERN = '[a-zA-Z0-9\\-]{1,64}'
const UNIQUE_VIOLATION = '23505'

const links = ref<LinkRow[]>([])
const target = ref('')
const slug = ref('')
const copiedSlug = ref('')
const loading = ref(false)
const error = ref('')
const showConfirmDelete = ref(false)

const auth = useSupabaseAuth(error, loading)
const { user } = auth
const { selectedIds, toggle, clear } = useSelection(() => links.value.map(link => link.slug))

const confirmQuestion = computed(() => showConfirmDelete.value
  ? `Delete ${selectedIds.value.size} link${selectedIds.value.size === 1 ? '' : 's'}?`
  : null)

async function loadLinks() {
  const supabase = await getSupabase()
  if (!supabase) {
    error.value = 'Supabase is not configured.'
    return
  }

  loading.value = true
  const { data, error: err } = await supabase
    .from('short_links')
    .select('*')
    .order('created_at', { ascending: false })
  loading.value = false

  if (err) {
    error.value = err.message
    return
  }
  error.value = ''
  links.value = data ?? []
}

async function copyLink(linkSlug: string) {
  try {
    await navigator.clipboard.writeText(SHORT_LINK_BASE + linkSlug)
    copiedSlug.value = linkSlug
  }
  catch (e: any) {
    error.value = `Could not copy: ${e.message}`
  }
}

async function createLink() {
  const supabase = await getSupabase()
  if (!supabase)
    return

  loading.value = true
  error.value = ''
  const { data, error: err } = await supabase
    .from('short_links')
    .insert({ target: target.value, ...(slug.value && { slug: slug.value }) })
    .select()
    .single()
  loading.value = false

  if (err) {
    error.value = err.code === UNIQUE_VIOLATION ? 'This name is taken' : err.message
    return
  }
  links.value.unshift(data)
  target.value = ''
  slug.value = ''
  await copyLink(data.slug)
}

async function confirmDelete() {
  showConfirmDelete.value = false
  const supabase = await getSupabase()
  if (!supabase)
    return

  loading.value = true
  error.value = ''
  const { error: err } = await supabase
    .from('short_links')
    .delete()
    .in('slug', Array.from(selectedIds.value))
  loading.value = false

  if (err) {
    error.value = err.message
    return
  }
  links.value = links.value.filter(link => !selectedIds.value.has(link.slug))
  clear()
}

watch(() => user.value?.id, (userId) => {
  if (userId)
    loadLinks()
  else
    links.value = []
})

onMounted(() => {
  // Filled by the bookmarklet: /admin/links?url=<page>
  target.value = new URLSearchParams(location.search).get('url') ?? ''
})
</script>

<template>
  <AdminShell
    title="link admin"
    noun="link"
    :auth="auth"
    :error="error"
    :loading="loading"
    :confirm-question="confirmQuestion"
    @confirm="confirmDelete"
    @cancel="showConfirmDelete = false"
  >
    <template #controls>
      <form class="admin-controls" @submit.prevent="createLink">
        <input v-model.trim="target" type="url" placeholder="https://..." aria-label="target" pattern="[Hh][Tt][Tt][Pp][Ss]?://\S+" maxlength="2048" required>
        <input v-model.trim="slug" placeholder="name (optional)" aria-label="name" :pattern="SLUG_PATTERN" title="a-z, A-Z, 0-9 and hyphens" autocapitalize="none" autocomplete="off">
        <button type="submit" :disabled="loading || !user" :title="!user ? 'Sign in to create' : ''">
          create
        </button>
      </form>
      <button :disabled="loading || !user" @click="loadLinks">
        refresh
      </button>
      <button :disabled="selectedIds.size === 0 || !user" @click="showConfirmDelete = true">
        delete ({{ selectedIds.size }})
      </button>
    </template>

    <div class="table-viewport">
      <table>
        <thead>
          <tr>
            <th />
            <th>link</th>
            <th>target</th>
            <th>clicks</th>
            <th>created</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="link in links"
            :key="link.slug"
            :class="{ selected: selectedIds.has(link.slug) }"
            @click="toggle(link.slug)"
          >
            <td><input type="checkbox" :checked="selectedIds.has(link.slug)" @click.stop="toggle(link.slug)"></td>
            <td>
              <button :title="`Copy ${SHORT_LINK_BASE}${link.slug}`" @click.stop="copyLink(link.slug)">
                {{ copiedSlug === link.slug ? 'copied' : `l/${link.slug}` }}
              </button>
            </td>
            <td class="body-cell">
              {{ link.target }}
            </td>
            <td>{{ link.clicks }}</td>
            <td>{{ new Date(link.created_at).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="!loading && links.length === 0" class="empty-state">
        <p>{{ user ? 'no links' : 'sign in to see the links' }}</p>
      </div>
    </div>
  </AdminShell>
</template>
