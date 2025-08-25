export interface INavigationRoute {
  name: string
  displayName: string
  meta: { icon: string }
  children?: INavigationRoute[]
}

export default {
  root: {
    name: '/',
    displayName: 'navigationRoutes.home',
  },
  routes: [
    {
      name: 'dashboard',
      displayName: 'menu.dashboard',
      meta: {
        icon: 'dashboard',
      },
    },
    {
      name: 'verification-tracker',
      displayName: 'menu.verificationTracker',
      meta: {
        icon: 'track_changes',
      },
    },
    {
      name: 'offline-verifiers',
      displayName: 'menu.offlineVerifiers',
      meta: {
        icon: 'business',
      },
    },
    {
      name: 'document-verification',
      displayName: 'menu.documentVerification',
      meta: {
        icon: 'description',
      },
    },
    {
      name: 'reports',
      displayName: 'menu.reports',
      meta: {
        icon: 'assessment',
      },
      children: [
        {
          name: 'monthly-reports',
          displayName: 'menu.monthlyReports',
        },
        {
          name: 'export-data',
          displayName: 'menu.exportData',
        },
      ],
    },
    {
      name: 'bulk-operations',
      displayName: 'menu.bulkOperations',
      meta: {
        icon: 'cloud_upload',
      },
    },
  ] as INavigationRoute[],
}
