<template>
  <div class="flex flex-col gap-4">
    <!-- Quick Actions -->
    <VaCard>
      <VaCardContent class="flex flex-col sm:flex-row gap-4 items-end">
        <VaButton preset="primary" @click="sendBulkReminder"> Send Life Certificate Reminders </VaButton>

        <VaButton preset="secondary" @click="sendSystemAlert"> Send System Alert </VaButton>

        <VaButton preset="plain" @click="markAllRead"> Mark All as Read </VaButton>
      </VaCardContent>
    </VaCard>

    <!-- Notifications List -->
    <VaCard>
      <VaCardTitle>
        <h2 class="text-xl font-semibold">Recent Notifications</h2>
      </VaCardTitle>
      <VaCardContent>
        <div class="space-y-3">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="flex items-start gap-3 p-4 border rounded hover:bg-gray-50"
            :class="{ 'bg-blue-50': !notification.read }"
          >
            <VaIcon :name="notification.icon" :color="notification.color" size="large" />
            <div class="flex-1">
              <div class="font-semibold">{{ notification.title }}</div>
              <div class="text-secondary mt-1">{{ notification.message }}</div>
              <div class="text-xs text-secondary mt-2">{{ notification.timestamp }}</div>
            </div>
            <VaBadge v-if="!notification.read" text="New" color="primary" />
          </div>
        </div>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VaCard, VaCardContent, VaCardTitle, VaButton, VaIcon, VaBadge } from 'vuestic-ui'

const notifications = ref([
  {
    id: 1,
    title: 'Life Certificate Reminder Sent',
    message: 'Bulk reminders sent to 1,247 pensioners for life certificate submission',
    timestamp: '2 hours ago',
    icon: 'send',
    color: 'success',
    read: false,
  },
  {
    id: 2,
    title: 'New Mediator Registration',
    message: 'सुमित्रा देवी has registered as a new mediator in Kanpur region',
    timestamp: '4 hours ago',
    icon: 'person_add',
    color: 'info',
    read: false,
  },
  {
    id: 3,
    title: 'System Maintenance Completed',
    message: 'Scheduled system maintenance completed successfully. All services are now operational.',
    timestamp: '6 hours ago',
    icon: 'build',
    color: 'warning',
    read: true,
  },
])

const sendBulkReminder = () => {
  console.log('Sending bulk life certificate reminders...')
}

const sendSystemAlert = () => {
  console.log('Sending system alert...')
}

const markAllRead = () => {
  notifications.value.forEach((n) => (n.read = true))
}
</script>
