import type { Banner } from '@/types'

export const seedBanners: Banner[] = [
  {
    id: 'b1',
    title: '欢迎来到 Forum',
    subtitle: '分享想法，结识同好',
    imageUrl: 'https://picsum.photos/id/1015/1200/360',
    link: '',
    enabled: true,
    sort: 1,
  },
  {
    id: 'b2',
    title: '本周话题征集',
    subtitle: '写下你最近在聊的事',
    imageUrl: 'https://picsum.photos/id/1036/1200/360',
    link: '',
    enabled: true,
    sort: 2,
  },
  {
    id: 'b3',
    title: '发帖小贴士',
    subtitle: '标题清晰、分类准确，更容易被看见',
    imageUrl: 'https://picsum.photos/id/1043/1200/360',
    link: '',
    enabled: true,
    sort: 3,
  },
]
