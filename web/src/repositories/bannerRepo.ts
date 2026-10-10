import { delay } from '@/lib/delay'
import { requireUser } from '@/stores/auth'
import { useDbStore } from '@/stores/db'
import type { Banner } from '@/types'

function requireAdmin() {
  const user = requireUser()
  if (user.role !== 'ADMIN') throw new Error('需要管理员权限')
  return user
}

export async function fetchBanners(): Promise<Banner[]> {
  await delay(60)
  return useDbStore
    .getState()
    .banners.filter((b) => b.enabled)
    .sort((a, b) => a.sort - b.sort)
}

export async function fetchAdminBanners(): Promise<Banner[]> {
  await delay()
  requireAdmin()
  return [...useDbStore.getState().banners].sort((a, b) => a.sort - b.sort)
}

export async function createBanner(
  input: Omit<Banner, 'id'>,
): Promise<Banner> {
  await delay()
  requireAdmin()
  const banner: Banner = { ...input, id: useDbStore.getState().allocId('b') }
  useDbStore.setState({
    banners: [...useDbStore.getState().banners, banner],
  })
  return banner
}

export async function updateBanner(
  id: string,
  input: Partial<Omit<Banner, 'id'>>,
): Promise<Banner> {
  await delay()
  requireAdmin()
  const db = useDbStore.getState()
  const existing = db.banners.find((b) => b.id === id)
  if (!existing) throw new Error('轮播不存在')
  const next = { ...existing, ...input, id }
  useDbStore.setState({
    banners: db.banners.map((b) => (b.id === id ? next : b)),
  })
  return next
}

export async function removeBanner(id: string): Promise<void> {
  await delay()
  requireAdmin()
  useDbStore.setState({
    banners: useDbStore.getState().banners.filter((b) => b.id !== id),
  })
}

export async function toggleBanner(id: string): Promise<Banner> {
  await delay()
  requireAdmin()
  const db = useDbStore.getState()
  const existing = db.banners.find((b) => b.id === id)
  if (!existing) throw new Error('轮播不存在')
  const next = { ...existing, enabled: !existing.enabled }
  useDbStore.setState({
    banners: db.banners.map((b) => (b.id === id ? next : b)),
  })
  return next
}
