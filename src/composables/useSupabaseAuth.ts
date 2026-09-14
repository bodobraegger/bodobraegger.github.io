import type { Ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import { onMounted, onUnmounted, ref } from 'vue'
import { getSupabase } from '~/lib/supabase'

/** Sign-in state and actions shared by the admin pages. Registers its own auth-state lifecycle. */
export function useSupabaseAuth(error: Ref<string>, loading: Ref<boolean>) {
  const user = ref<User | null>(null)
  const email = ref('')
  const password = ref('')
  const showAuth = ref(false)

  async function signIn() {
    if (!email.value || !password.value)
      return

    const supabase = await getSupabase()
    if (!supabase)
      return

    loading.value = true
    error.value = ''

    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })

      if (err)
        throw err

      user.value = data.user
      showAuth.value = false
      password.value = ''
    }
    catch (e: any) {
      error.value = e.message || 'Failed to sign in'
      console.error('Sign in error:', e)
    }
    finally {
      loading.value = false
    }
  }

  async function signOut() {
    const supabase = await getSupabase()
    if (!supabase)
      return

    try {
      await supabase.auth.signOut()
      user.value = null
    }
    catch (e: any) {
      error.value = e.message || 'Failed to sign out'
      console.error('Sign out error:', e)
    }
  }

  let authSubscription: { unsubscribe: () => void } | null = null

  onMounted(async () => {
    const supabase = await getSupabase()
    if (!supabase)
      return

    const { data: { user: currentUser } } = await supabase.auth.getUser()
    user.value = currentUser

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })
    authSubscription = data.subscription
  })

  onUnmounted(() => {
    authSubscription?.unsubscribe()
  })

  return {
    user,
    email,
    password,
    showAuth,
    signIn,
    signOut,
  }
}
