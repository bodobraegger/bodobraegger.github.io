<script setup lang="ts">
import type { useSupabaseAuth } from '~/composables/useSupabaseAuth'
import '~/styles/admin.css'

/**
 * The frame both admin views sit in: the container, the header with its
 * sign-in state, the error line, the sign-in form and the confirm dialog. A
 * view fills the controls, the stats and the body, and keeps its own data.
 * It owns `error` and `loading`, which it writes too, and hands the bundle
 * from useSupabaseAuth straight through as `auth`.
 */
const props = defineProps<{
  /** Names the view, at the top left. */
  title: string
  /** What one row is called, for the sign-in prompt. */
  noun: string
  auth: ReturnType<typeof useSupabaseAuth>
  error: string
  loading: boolean
  /** The question to put while the confirm dialog is open, else null. */
  confirmQuestion: string | null
}>()

defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

// The bundle holds refs the view owns and means for this form to write, so it
// is unpacked once rather than reached through the prop on every line.
const { user, email, password, showAuth, signIn, signOut } = props.auth
</script>

<template>
  <div class="admin-container">
    <header class="admin-header">
      <span>{{ title }}</span>

      <div class="admin-center">
        <div class="admin-controls">
          <slot name="controls" />
        </div>
        <div v-if="$slots.stats" class="admin-stats">
          <slot name="stats" />
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

    <div v-if="showAuth && !user" class="auth-form">
      <h3>sign in to delete {{ noun }}s</h3>
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

    <div v-if="confirmQuestion" class="confirm-overlay">
      <div class="confirm-dialog">
        <h3>confirm deletion</h3>
        <p>{{ confirmQuestion }}</p>
        <div class="confirm-actions">
          <button @click="$emit('cancel')">
            cancel
          </button>
          <button class="delete-btn" @click="$emit('confirm')">
            delete
          </button>
        </div>
      </div>
    </div>

    <slot />
  </div>
</template>
