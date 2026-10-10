import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronDownIcon,
  ExternalLinkIcon,
  FlameIcon,
  MegaphoneIcon,
} from 'lucide-react'
import {
  fetchAnnouncementsApi,
  fetchFriendLinksApi,
  fetchHotTopicsApi,
} from '@/api/meta'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import type { FriendLink, Topic } from '@/types'

export function RightSidebar() {
  const [announcements, setAnnouncements] = useState<string[]>([])
  const [hot, setHot] = useState<Topic[]>([])
  const [links, setLinks] = useState<FriendLink[]>([])
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    Promise.all([
      fetchAnnouncementsApi(),
      fetchHotTopicsApi(5),
      fetchFriendLinksApi(),
    ])
      .then(([a, h, l]) => {
        if (!alive) return
        setAnnouncements(a)
        setHot(h)
        setLinks(l)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const visible = expanded ? announcements : announcements.slice(0, 2)

  return (
    <aside className="flex flex-col gap-6">
      <section className="overflow-hidden rounded-xl border border-amber-500/25 bg-gradient-to-b from-amber-500/[0.12] to-transparent">
        <div className="flex items-center gap-2 border-b border-amber-500/15 px-3 py-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-amber-500/20 text-amber-700">
            <MegaphoneIcon className="size-3.5" />
          </span>
          <h2 className="min-w-0 flex-1 text-sm font-semibold tracking-tight">
            论坛公告
          </h2>
          <Badge
            variant="secondary"
            className="bg-amber-500/15 text-[10px] text-amber-900"
          >
            须知
          </Badge>
        </div>
        {loading ? (
          <div className="p-3">
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <div className="px-2 py-1.5">
            <ol className="flex flex-col">
              {visible.map((item, i) => (
                <li
                  key={item}
                  className="flex gap-2 rounded-lg px-1.5 py-1.5 text-xs leading-snug text-foreground/85"
                >
                  <span className="mt-px flex size-4 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-semibold tabular-nums text-amber-800">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">{item}</span>
                </li>
              ))}
            </ol>
            {announcements.length > 2 ? (
              <Button
                variant="ghost"
                size="xs"
                className="mb-0.5 h-6 w-full justify-center text-amber-900 hover:bg-amber-500/10 hover:text-amber-950"
                onClick={() => setExpanded((v) => !v)}
              >
                <ChevronDownIcon
                  data-icon="inline-start"
                  className={expanded ? 'rotate-180' : undefined}
                />
                {expanded ? '收起' : `展开全部（${announcements.length}）`}
              </Button>
            ) : null}
          </div>
        )}
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold">
          <FlameIcon className="size-4 text-orange-500" />
          本周热门
        </h2>
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <ol className="flex flex-col gap-2.5">
            {hot.map((post, i) => (
              <li key={post.id}>
                <Link
                  to={`/post/${post.id}`}
                  className="group flex items-start gap-1.5 text-sm leading-snug"
                >
                  <span
                    className={
                      i < 3
                        ? 'mt-px shrink-0 text-xs font-semibold tabular-nums text-orange-500'
                        : 'mt-px shrink-0 text-xs font-medium tabular-nums text-muted-foreground'
                    }
                  >
                    {i + 1}.
                  </span>
                  <span className="min-w-0 flex-1 text-muted-foreground transition-colors group-hover:text-foreground">
                    <span className="line-clamp-2">{post.title}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">友情链接</h2>
        <ul className="flex flex-col gap-1.5">
          {links.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                {link.name}
                <ExternalLinkIcon className="size-3" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}
