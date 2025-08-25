<script setup lang="ts">
import { ref } from 'vue'

interface RecentActivity {
  id: string
  user: string
  action: string
  details: string
  time: string
  type: 'verification' | 'approval' | 'flag' | 'update' | 'system'
  icon: string
}

const recentActivities = ref<RecentActivity[]>([
  {
    id: '1',
    user: 'Rajesh Kumar',
    action: 'verified life certificate',
    details: 'for beneficiary ID: PEN-2024-001234',
    time: '5 min ago',
    type: 'verification',
    icon: 'verified_user',
  },
  {
    id: '2',
    user: 'Priya Sharma',
    action: 'approved pension disbursement',
    details: 'for 1,250 beneficiaries in Delhi region',
    time: '15 min ago',
    type: 'approval',
    icon: 'check_circle',
  },
  {
    id: '3',
    user: 'Amit Singh',
    action: 'flagged suspicious activity',
    details: 'in pension claim PEN-2024-005678',
    time: '1h ago',
    type: 'flag',
    icon: 'flag',
  },
  {
    id: '4',
    user: 'Sunita Devi',
    action: 'completed monthly verification',
    details: 'for 500 widow pension beneficiaries',
    time: '2h ago',
    type: 'verification',
    icon: 'task_alt',
  },
  {
    id: '5',
    user: 'Vikram Gupta',
    action: 'updated bank details',
    details: 'for 25 beneficiaries in Punjab region',
    time: '3h ago',
    type: 'update',
    icon: 'edit',
  },
  {
    id: '6',
    user: 'Meera Joshi',
    action: 'processed new pension applications',
    details: '45 approved, 12 rejected',
    time: '4h ago',
    type: 'approval',
    icon: 'assignment_turned_in',
  },
  {
    id: '7',
    user: 'System Alert',
    action: 'Monthly pension disbursement',
    details: 'of ₹4.9 Cr completed successfully',
    time: '1 day ago',
    type: 'system',
    icon: 'notifications',
  },
])

const getActivityColor = (type: string) => {
  switch (type) {
    case 'verification':
      return 'success'
    case 'approval':
      return 'primary'
    case 'flag':
      return 'danger'
    case 'update':
      return 'info'
    case 'system':
      return 'warning'
    default:
      return 'secondary'
  }
}
</script>

<template>
  <VaCard class="recent-activities-card">
    <VaCardContent class="p-0">
      <!-- Header Section -->
      <div class="card-header">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="header-icon">
              <VaIcon name="history" size="24px" color="white" />
            </div>
            <div>
              <h1 class="card-title">RECENT ACTIVITIES</h1>
              <p class="card-subtitle">{{ recentActivities.length }} Recent Actions</p>
            </div>
          </div>
          <VaButton preset="primary" size="small" class="view-all-btn" icon="visibility"> View Stats </VaButton>
        </div>
      </div>

      <!-- Content Section -->
      <div class="card-content">
        <div v-if="recentActivities.length > 0" class="activities-list">
          <div
            v-for="(activity, index) in recentActivities"
            :key="activity.id"
            class="activity-item"
            :class="{ 'last-item': index === recentActivities.length - 1 }"
          >
            <!-- Activity Icon -->
            <div class="activity-icon-wrapper">
              <div class="activity-icon" :style="{ backgroundColor: `var(--va-${getActivityColor(activity.type)})` }">
                <VaIcon :name="activity.icon" size="16px" color="white" />
              </div>
              <div v-if="index !== recentActivities.length - 1" class="activity-line"></div>
            </div>

            <!-- Activity Content -->
            <div class="activity-content">
              <div class="activity-text">
                <span class="user-name">{{ activity.user }}</span>
                <span class="action-text">{{ activity.action }}</span>
                <span class="details-text">{{ activity.details }}</span>
              </div>
              <div class="activity-time">
                <VaIcon name="schedule" size="12px" class="mr-1" />
                {{ activity.time }}
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <VaIcon name="inbox" size="48px" color="secondary" />
          <p>No recent activities</p>
        </div>
      </div>
    </VaCardContent>
  </VaCard>
</template>

<style scoped>
.recent-activities-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
  border: 1px solid var(--va-background-border);
}

.recent-activities-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-header {
  background: linear-gradient(135deg, var(--va-info) 0%, var(--va-info-dark) 100%);
  padding: 20px 24px;
  color: white;
}

/* Light theme header fix */
[data-theme='light'] .card-header {
  background: linear-gradient(135deg, #17a2b8 0%, #117a8b 100%) !important;
  color: white !important;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: white;
}

.card-subtitle {
  font-size: 14px;
  margin: 4px 0 0 0;
  color: rgba(255, 255, 255, 0.8);
}

.view-all-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.view-all-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: translateY(-1px);
}

/* Theme-aware button visibility fix */
.view-all-btn {
  background: var(--va-info) !important;
  border: 1px solid var(--va-info) !important;
  color: white !important;
}

.view-all-btn:hover {
  background: var(--va-info-dark) !important;
  border: 1px solid var(--va-info-dark) !important;
}

.card-content {
  padding: 24px;
}

.activities-list {
  position: relative;
}

.activity-item {
  display: flex;
  gap: 16px;
  position: relative;
  padding-bottom: 20px;
  transition: all 0.2s ease;
}

.activity-item:hover {
  transform: translateX(4px);
}

.activity-item.last-item {
  padding-bottom: 0;
}

.activity-icon-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 2;
}

.activity-line {
  width: 2px;
  height: 24px;
  background: var(--va-background-border);
  margin-top: 8px;
  position: relative;
  z-index: 1;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-text {
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 6px;
}

.user-name {
  font-weight: 700;
  color: var(--va-primary);
}

.action-text {
  color: var(--va-text-primary);
  margin-left: 4px;
}

.details-text {
  color: var(--va-text-secondary);
  margin-left: 4px;
}

.activity-time {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: var(--va-text-secondary);
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--va-text-secondary);
}

.empty-state p {
  margin: 12px 0 0 0;
  font-style: italic;
}

/* Theme-aware text visibility fixes */
.card-title {
  color: white !important;
  font-weight: 700 !important;
}

.card-subtitle {
  color: rgba(255, 255, 255, 0.95) !important;
  font-weight: 500 !important;
}

.user-name {
  color: var(--va-primary) !important;
  font-weight: 600 !important;
}

.action-text {
  color: var(--va-text-primary) !important;
  font-weight: 500 !important;
}

.details-text {
  color: var(--va-text-secondary) !important;
  font-weight: 400 !important;
}

.activity-time {
  color: var(--va-text-secondary) !important;
  font-weight: 400 !important;
}

/* Theme-aware card background */
.recent-activities-card {
  background: var(--va-background-primary) !important;
  border: 1px solid var(--va-background-border) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

/* Dark theme adjustments */
[data-theme='dark'] .recent-activities-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

[data-theme='dark'] .recent-activities-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

[data-theme='dark'] .activity-icon {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style>
