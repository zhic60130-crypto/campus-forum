import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AdminShell } from '@/layouts/AdminShell'
import { AppShell } from '@/layouts/AppShell'
import { AuthShell } from '@/layouts/AuthShell'
import { AdminAnnouncementsPage } from '@/pages/admin/AdminAnnouncementsPage'
import { AdminBannersPage } from '@/pages/admin/AdminBannersPage'
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage'
import { AdminTagsPage } from '@/pages/admin/AdminTagsPage'
import { AdminTopicsPage } from '@/pages/admin/AdminTopicsPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { BookmarksPage } from '@/pages/BookmarksPage'
import { LoginPage } from '@/pages/LoginPage'
import { MyPostsPage } from '@/pages/MyPostsPage'
import { PlazaPage } from '@/pages/PlazaPage'
import { PostDetailPage } from '@/pages/PostDetailPage'
import { ProfileSettingsPage } from '@/pages/ProfileSettingsPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { SecuritySettingsPage } from '@/pages/SecuritySettingsPage'
import { GuestOnly } from '@/routes/GuestOnly'
import { RequireAuth } from '@/routes/RequireAuth'

export const router = createBrowserRouter([
  {
    element: <AuthShell />,
    children: [
      {
        path: '/login',
        element: (
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        ),
      },
      {
        path: '/register',
        element: (
          <GuestOnly>
            <RegisterPage />
          </GuestOnly>
        ),
      },
    ],
  },
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <PlazaPage /> },
      { path: '/post/:id', element: <PostDetailPage /> },
      {
        path: '/bookmarks',
        element: (
          <RequireAuth>
            <BookmarksPage />
          </RequireAuth>
        ),
      },
      {
        path: '/my-posts',
        element: (
          <RequireAuth>
            <MyPostsPage />
          </RequireAuth>
        ),
      },
      {
        path: '/settings',
        element: <Navigate to="/settings/profile" replace />,
      },
      {
        path: '/settings/profile',
        element: (
          <RequireAuth>
            <ProfileSettingsPage />
          </RequireAuth>
        ),
      },
      {
        path: '/settings/security',
        element: (
          <RequireAuth>
            <SecuritySettingsPage />
          </RequireAuth>
        ),
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <RequireAuth admin>
        <AdminShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/topics" replace /> },
      { path: 'topics', element: <AdminTopicsPage /> },
      { path: 'reports', element: <AdminReportsPage /> },
      { path: 'tags', element: <AdminTagsPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'banners', element: <AdminBannersPage /> },
      { path: 'announcements', element: <AdminAnnouncementsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
