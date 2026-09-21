import type { Ref } from 'vue'
import { ref } from 'vue'

/**
 * The set of row ids an admin view has selected, with the three actions both
 * views offer. `allIds` is read when everything is selected, so the caller can
 * hand over whatever it holds at that moment.
 */
export function useSelection(allIds: () => string[]) {
  const selectedIds = ref(new Set<string>()) as Ref<Set<string>>

  function toggle(id: string) {
    if (selectedIds.value.has(id))
      selectedIds.value.delete(id)
    else
      selectedIds.value.add(id)
  }

  function selectAll() {
    selectedIds.value = new Set(allIds())
  }

  function clear() {
    selectedIds.value.clear()
  }

  return { selectedIds, toggle, selectAll, clear }
}
