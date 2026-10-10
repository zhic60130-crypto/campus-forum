import http from '@/lib/http'
import type { Banner } from '@/types'

export function fetchBannersApi(): Promise<Banner[]> {
  return http.get('/banners')
}

export function fetchAdminBannersApi(): Promise<Banner[]> {
  return http.get('/admin/banners')
}

export function createBannerApi(
  input: Omit<Banner, 'id'>,
): Promise<Banner> {
  return http.post('/admin/banners', input)
}

export function updateBannerApi(
  id: string,
  input: Partial<Omit<Banner, 'id'>>,
): Promise<Banner> {
  return http.put(`/admin/banners/${id}`, input)
}

export function removeBannerApi(id: string): Promise<void> {
  return http.delete(`/admin/banners/${id}`)
}

export function toggleBannerApi(id: string): Promise<Banner> {
  return http.post(`/admin/banners/${id}/toggle`)
}
