import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import AuthLayout from '../layouts/AuthLayout.vue'
import AppLayout from '../layouts/AppLayout.vue'

import RouteViewComponent from '../layouts/RouterBypass.vue'
import { requireAuth, requireGuest } from '../services/auth'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: { name: 'login' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'login' },
  },
  {
    name: 'admin',
    path: '/admin',
    component: AppLayout,
    beforeEnter: requireAuth,
    redirect: { name: 'dashboard' },
    children: [
      {
        name: 'dashboard',
        path: 'dashboard',
        component: () => import('../pages/admin/dashboard/Dashboard.vue'),
      },
      {
        name: 'verification-tracker',
        path: 'verification-tracker',
        component: () => import('../pages/verification-tracker/VerificationTrackerPage.vue'),
      },
      {
        name: 'offline-verifiers',
        path: 'offline-verifiers',
        component: () => import('../pages/offline-verifiers/OfflineVerifiersPage.vue'),
      },
      {
        name: 'document-verification',
        path: 'document-verification',
        component: () => import('../pages/document-verification/DocumentVerificationPage.vue'),
      },
      {
        name: 'reports',
        path: '/reports',
        component: RouteViewComponent,
        children: [
          {
            name: 'monthly-reports',
            path: 'monthly-reports',
            component: () => import('../pages/reports/MonthlyReportsPage.vue'),
          },
          {
            name: 'verification-summary',
            path: 'verification-summary',
            component: () => import('../pages/reports/VerificationSummaryPage.vue'),
          },
          {
            name: 'fraud-detection',
            path: 'fraud-detection',
            component: () => import('../pages/reports/FraudDetectionPage.vue'),
          },
          {
            name: 'export-data',
            path: 'export-data',
            component: () => import('../pages/reports/ExportDataPage.vue'),
          },
        ],
      },
      {
        name: 'bulk-operations',
        path: 'bulk-operations',
        component: () => import('../pages/bulk-operations/BulkOperationsPage.vue'),
      },
      {
        name: 'user-management',
        path: 'user-management',
        component: () => import('../pages/user-management/UserManagementPage.vue'),
      },
      {
        name: 'notifications',
        path: 'notifications',
        component: () => import('../pages/notifications/NotificationsPage.vue'),
      },
      {
        name: 'settings',
        path: 'settings',
        component: () => import('../pages/settings/Settings.vue'),
      },
    ],
  },
  {
    path: '/auth',
    component: AuthLayout,
    beforeEnter: requireGuest,
    children: [
      {
        name: 'login',
        path: 'login',
        component: () => import('../pages/auth/Login.vue'),
      },
      {
        name: 'signup',
        path: 'signup',
        component: () => import('../pages/auth/Signup.vue'),
      },
      {
        name: 'recover-password',
        path: 'recover-password',
        component: () => import('../pages/auth/RecoverPassword.vue'),
      },
      {
        name: 'recover-password-email',
        path: 'recover-password-email',
        component: () => import('../pages/auth/CheckTheEmail.vue'),
      },
      {
        path: '',
        redirect: { name: 'login' },
      },
    ],
  },
  {
    name: '404',
    path: '/404',
    component: () => import('../pages/404.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    // For some reason using documentation example doesn't scroll on page navigation.
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else {
      window.scrollTo(0, 0)
    }
  },
  routes,
})

export default router
