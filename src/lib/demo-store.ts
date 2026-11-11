import { useEffect, useState } from 'react'
import { listings as seedListings, type Listing } from '../data/listings'

const STORAGE_KEY = 'stumarket.demo.v1'
const CHANGE_EVENT = 'stumarket:demo-change'

export type DemoMessage = { id: string; text: string; mine: boolean; createdAt: string }
type DemoAccount = { email: string; name: string; salt: string; passwordHash: string }
export type DemoConversation = {
  id: string
  listingId: string
  title: string
  price: number
  sellerName: string
  updatedAt: string
  messages: DemoMessage[]
}
export type DemoStore = {
  listings: Listing[]
  favorites: string[]
  conversations: DemoConversation[]
  demoName: string
  accounts: DemoAccount[]
  currentUserEmail: string
  soldIds: string[]
  ratings: Record<string, number>
}

const emptyStore = (): DemoStore => ({ listings: [], favorites: [], conversations: [], demoName: '', accounts: [], currentUserEmail: '', soldIds: [], ratings: {} })

function readSavedStore(): DemoStore {
  if (typeof window === 'undefined') return emptyStore()
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved ? { ...emptyStore(), ...JSON.parse(saved) as Partial<DemoStore> } : emptyStore()
  } catch {
    return emptyStore()
  }
}

export function getDemoStore(): DemoStore {
  return readSavedStore()
}

function saveStore(next: DemoStore) {
  let saved = true
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    saved = false
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
  return saved
}

export function subscribeDemoStore(listener: () => void) {
  window.addEventListener(CHANGE_EVENT, listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener)
    window.removeEventListener('storage', listener)
  }
}

export function useDemoStore() {
  const [store, setStore] = useState(getDemoStore)
  useEffect(() => subscribeDemoStore(() => setStore(getDemoStore())), [])
  return store
}

export function getAllListings(userListings = readSavedStore().listings): Listing[] {
  return [...userListings, ...seedListings].map((item) => ({
    ...item,
    conditionShort: item.conditionShort,
  }))
}

export function addDemoListing(input: Omit<Listing, 'id' | 'sellerKind' | 'sellerName' | 'sellerEmail' | 'sellerEmailVerified'>) {
  const saved = readSavedStore()
  if (!saved.currentUserEmail) return null
  const id = `demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
  const item: Listing = {
    ...input,
    id,
    sellerKind: 'Sinh viên',
    sellerName: saved.demoName || 'Sinh viên',
    sellerEmail: saved.currentUserEmail,
    sellerEmailVerified: false,
  }
  return saveStore({ ...saved, listings: [item, ...saved.listings] }) ? item : null
}

export function toggleDemoFavorite(id: string) {
  const saved = readSavedStore()
  const favorites = saved.favorites.includes(id)
    ? saved.favorites.filter((favorite) => favorite !== id)
    : [...saved.favorites, id]
  return saveStore({ ...saved, favorites }) ? favorites.includes(id) : null
}

export function startDemoConversation(listing: Listing) {
  const saved = readSavedStore()
  const existing = saved.conversations.find((thread) => thread.listingId === listing.id)
  if (existing) return existing.id
  const id = `thread-${listing.id}`
  const now = new Date().toISOString()
  const conversation: DemoConversation = {
    id,
    listingId: listing.id,
    title: listing.title,
    price: listing.price,
    sellerName: listing.sellerName ?? listing.sellerKind,
    updatedAt: now,
    messages: [{ id: `${id}-hello`, text: `Chào bạn, sản phẩm “${listing.title}” còn không?`, mine: true, createdAt: now }],
  }
  return saveStore({ ...saved, conversations: [conversation, ...saved.conversations] }) ? id : null
}

export function sendDemoMessage(threadId: string, text: string) {
  const saved = readSavedStore()
  if (!saved.conversations.some((thread) => thread.id === threadId)) return false
  const now = new Date().toISOString()
  const conversations = saved.conversations.map((thread) => thread.id === threadId
    ? { ...thread, updatedAt: now, messages: [...thread.messages, { id: `${threadId}-${Date.now()}`, text, mine: true, createdAt: now }] }
    : thread)
  return saveStore({ ...saved, conversations })
}

export function replyDemoMessage(threadId: string, text: string) {
  const saved = readSavedStore()
  if (!saved.conversations.some((thread) => thread.id === threadId)) return false
  const now = new Date().toISOString()
  const conversations = saved.conversations.map((thread) => thread.id === threadId
    ? { ...thread, updatedAt: now, messages: [...thread.messages, { id: `${threadId}-reply-${Date.now()}`, text, mine: false, createdAt: now }] }
    : thread)
  return saveStore({ ...saved, conversations })
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function hashDemoPassword(password: string, salt: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: Uint8Array.from(salt.match(/.{2}/g) ?? [], (byte) => Number.parseInt(byte, 16)), iterations: 150_000, hash: 'SHA-256' }, key, 256)
  return bytesToHex(new Uint8Array(bits))
}

export async function registerDemoAccount(email: string, name: string, password: string) {
  const saved = readSavedStore()
  const normalizedEmail = email.trim().toLocaleLowerCase('en-US')
  if (saved.accounts.some((account) => account.email === normalizedEmail)) return { ok: false as const, error: 'Email này đã có tài khoản trên trình duyệt.' }
  const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)))
  const account = { email: normalizedEmail, name: name.trim(), salt, passwordHash: await hashDemoPassword(password, salt) }
  if (!saveStore({ ...saved, accounts: [...saved.accounts, account], currentUserEmail: normalizedEmail, demoName: account.name })) {
    return { ok: false as const, error: 'Không thể lưu tài khoản trên thiết bị này. Hãy kiểm tra dung lượng trình duyệt.' }
  }
  return { ok: true as const }
}

export async function loginDemoAccount(email: string, password: string) {
  const saved = readSavedStore()
  const normalizedEmail = email.trim().toLocaleLowerCase('en-US')
  const account = saved.accounts.find((candidate) => candidate.email === normalizedEmail)
  if (!account || await hashDemoPassword(password, account.salt) !== account.passwordHash) return { ok: false as const, error: 'Email hoặc mật khẩu chưa đúng trên trình duyệt này.' }
  if (!saveStore({ ...saved, currentUserEmail: account.email, demoName: account.name })) {
    return { ok: false as const, error: 'Không thể lưu phiên đăng nhập trên thiết bị này.' }
  }
  return { ok: true as const }
}

export function clearDemoAccount() {
  saveStore({ ...readSavedStore(), currentUserEmail: '', demoName: '' })
}

export function markDemoListingSold(id: string) {
  const saved = readSavedStore()
  return saveStore({ ...saved, soldIds: saved.soldIds.includes(id) ? saved.soldIds : [...saved.soldIds, id] })
}

export function rateDemoTransaction(id: string, stars: number) {
  const saved = readSavedStore()
  return saveStore({ ...saved, ratings: { ...saved.ratings, [id]: Math.max(1, Math.min(5, stars)) } })
}

export function isDemoListingSold(id: string) {
  return readSavedStore().soldIds.includes(id)
}
