import type { UserRecord } from '@/types'

export const seedUsers: UserRecord[] = [
  {
    id: 'u1',
    username: 'admin',
    email: 'admin@demo.local',
    avatar: '',
    bio: '论坛管理员',
    role: 'ADMIN',
    password: 'password123',
  },
  {
    id: 'u2',
    username: 'pixel',
    email: 'pixel@demo.local',
    avatar: '',
    bio: '喜欢摄影与夜跑',
    role: 'USER',
    password: 'password123',
  },
  {
    id: 'u3',
    username: 'nova',
    email: 'nova@demo.local',
    avatar: '',
    bio: '资源整理狂魔',
    role: 'USER',
    password: 'password123',
  },
]
