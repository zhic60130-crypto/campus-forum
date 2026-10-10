import { create } from 'zustand'
import {
  seedAnnouncements,
  seedBanners,
  seedCategories,
  seedFriendLinks,
  seedReplies,
  seedReports,
  seedTags,
  seedTopics,
  seedUsers,
} from '@/mocks'
import type {
  Announcement,
  Banner,
  Category,
  Comment,
  FriendLink,
  Report,
  Tag,
  Topic,
  UserRecord,
} from '@/types'

function clone<T>(value: T): T {
  return structuredClone(value)
}

export type DbState = {
  users: UserRecord[]
  categories: Category[]
  tags: Tag[]
  topics: Topic[]
  replies: Comment[]
  banners: Banner[]
  announcements: Announcement[]
  reports: Report[]
  friendLinks: FriendLink[]
  /** userId -> topicIds */
  topicLikes: Record<string, string[]>
  topicFavorites: Record<string, string[]>
  commentLikes: Record<string, string[]>
  nextSeq: number
  reset: () => void
  allocId: (prefix: string) => string
}

const initialInteract = () => ({
  topicLikes: {
    u1: ['p2'],
    u2: ['p5', 'p7'],
  } as Record<string, string[]>,
  topicFavorites: {
    u1: ['p7'],
    u3: ['p5'],
  } as Record<string, string[]>,
  commentLikes: {
    u1: ['r7'],
  } as Record<string, string[]>,
})

function createInitial(): Omit<DbState, 'reset' | 'allocId'> {
  return {
    users: clone(seedUsers),
    categories: clone(seedCategories),
    tags: clone(seedTags),
    topics: clone(seedTopics),
    replies: clone(seedReplies),
    banners: clone(seedBanners),
    announcements: clone(seedAnnouncements),
    reports: clone(seedReports),
    friendLinks: clone(seedFriendLinks),
    ...initialInteract(),
    nextSeq: 100,
  }
}

export const useDbStore = create<DbState>((set, get) => ({
  ...createInitial(),
  reset: () => set(createInitial()),
  allocId: (prefix) => {
    const n = get().nextSeq
    set({ nextSeq: n + 1 })
    return `${prefix}${n}`
  },
}))
