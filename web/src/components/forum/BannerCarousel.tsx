import { useEffect, useState } from 'react'
import { fetchBannersApi } from '@/api/banner'
import { Skeleton } from '@/components/ui/skeleton'
import type { Banner } from '@/types'

export function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    fetchBannersApi()
      .then((list) => {
        if (alive) setBanners(list)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % banners.length)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [banners.length])

  if (loading) return <Skeleton className="aspect-[10/3] w-full rounded-xl" />
  if (!banners.length) return null

  const current = banners[index] ?? banners[0]

  return (
    <div className="relative overflow-hidden rounded-xl border bg-muted">
      <img
        src={current.imageUrl}
        alt={current.title}
        className="aspect-[10/3] w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
      <div className="absolute right-0 bottom-0 left-0 p-4 text-white sm:p-6">
        <h2 className="text-lg font-semibold sm:text-xl">{current.title}</h2>
        <p className="mt-1 text-sm text-white/85">{current.subtitle}</p>
      </div>
      {banners.length > 1 ? (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              aria-label={`切换到 ${b.title}`}
              onClick={() => setIndex(i)}
              className={
                i === index
                  ? 'size-2 rounded-full bg-white'
                  : 'size-2 rounded-full bg-white/50'
              }
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
