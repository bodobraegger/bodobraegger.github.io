/**
 * Whether the browser has the WebCrypto API. The answer is read after mount,
 * so the server renders the supported state and hydration matches.
 */
export function useWebCrypto() {
  const isSupported = ref(true)
  onMounted(() => isSupported.value = Boolean(globalThis.crypto?.subtle))
  return isSupported
}
