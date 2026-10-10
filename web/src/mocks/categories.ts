import type { Category } from '@/types'

export const seedCategories: Category[] = [
  {
    id: 'daily',
    label: '日常闲聊',
    color: '#409EFF',
    icon: 'MessageCircle',
    desc: '生活琐事与轻松话题',
    sort: 1,
  },
  {
    id: 'friend',
    label: '真诚交友',
    color: '#9B6DFF',
    icon: 'Users',
    desc: '找搭子、扩人脉',
    sort: 2,
  },
  {
    id: 'feedback',
    label: '问题反馈',
    color: '#F56C6C',
    icon: 'AlertTriangle',
    desc: '吐槽与改进建议',
    sort: 3,
  },
  {
    id: 'hobby',
    label: '兴趣爱好',
    color: '#67C23A',
    icon: 'Sparkles',
    desc: '兴趣圈层与作品分享',
    sort: 4,
  },
  {
    id: 'resource',
    label: '资源互助',
    color: '#E6A23C',
    icon: 'FolderOpen',
    desc: '资料、工具与互助求援',
    sort: 5,
  },
]
