import { useMemo } from 'react'
import { getAllListings, useDemoStore } from './demo-store'

export function useListings() {
  const store = useDemoStore()
  const items = useMemo(() => getAllListings(store.listings), [store.listings])
  return { items, loading: false, error: '' }
}
