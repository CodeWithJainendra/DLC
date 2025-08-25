<template>
  <div class="flex flex-col gap-4">
    <!-- Security Overview -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="security" size="2xl" color="success" />
          <h3 class="text-2xl font-bold mt-2">Secure</h3>
          <p class="text-secondary">System Status</p>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="login" size="2xl" color="info" />
          <h3 class="text-2xl font-bold mt-2">{{ securityStats.activeLogins }}</h3>
          <p class="text-secondary">Active Logins</p>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="warning" size="2xl" color="warning" />
          <h3 class="text-2xl font-bold mt-2">{{ securityStats.failedAttempts }}</h3>
          <p class="text-secondary">Failed Attempts (24h)</p>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="update" size="2xl" color="primary" />
          <h3 class="text-2xl font-bold mt-2">{{ securityStats.lastUpdate }}</h3>
          <p class="text-secondary">Last Security Update</p>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Security Settings -->
    <VaCard>
      <VaCardTitle>
        <h2 class="text-xl font-semibold">Security Configuration</h2>
      </VaCardTitle>
      <VaCardContent>
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-semibold">Two-Factor Authentication</h4>
              <p class="text-secondary text-sm">Require 2FA for all admin users</p>
            </div>
            <VaSwitch v-model="securitySettings.twoFactorAuth" />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-semibold">Session Timeout</h4>
              <p class="text-secondary text-sm">Auto-logout after inactivity</p>
            </div>
            <VaSelect v-model="securitySettings.sessionTimeout" :options="timeoutOptions" class="w-32" />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-semibold">Password Policy</h4>
              <p class="text-secondary text-sm">Enforce strong password requirements</p>
            </div>
            <VaSwitch v-model="securitySettings.strongPasswordPolicy" />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-semibold">Login Attempt Limit</h4>
              <p class="text-secondary text-sm">Maximum failed login attempts</p>
            </div>
            <VaSelect v-model="securitySettings.maxLoginAttempts" :options="attemptOptions" class="w-24" />
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Recent Security Events -->
    <VaCard>
      <VaCardTitle>
        <h2 class="text-xl font-semibold">Recent Security Events</h2>
      </VaCardTitle>
      <VaCardContent>
        <VaDataTable :items="securityEvents" :columns="eventColumns" striped hoverable>
          <template #cell(type)="{ rowData }">
            <VaBadge :text="rowData.type" :color="getEventTypeColor(rowData.type)" />
          </template>

          <template #cell(severity)="{ rowData }">
            <VaBadge :text="rowData.severity" :color="getSeverityColor(rowData.severity)" />
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VaCard, VaCardContent, VaCardTitle, VaIcon, VaSwitch, VaSelect, VaDataTable, VaBadge } from 'vuestic-ui'

const securityStats = ref({
  activeLogins: 23,
  failedAttempts: 7,
  lastUpdate: '2 days',
})

const securitySettings = ref({
  twoFactorAuth: true,
  sessionTimeout: '30 min',
  strongPasswordPolicy: true,
  maxLoginAttempts: 3,
})

const timeoutOptions = ['15 min', '30 min', '1 hour', '2 hours', '4 hours']
const attemptOptions = [3, 5, 10]

const eventColumns = [
  { key: 'timestamp', label: 'Time' },
  { key: 'type', label: 'Event Type' },
  { key: 'user', label: 'User' },
  { key: 'ipAddress', label: 'IP Address' },
  { key: 'severity', label: 'Severity' },
  { key: 'description', label: 'Description' },
]

const securityEvents = ref([
  {
    timestamp: '2024-01-20 10:30:00',
    type: 'Login Success',
    user: 'admin@pension.gov.in',
    ipAddress: '192.168.1.100',
    severity: 'Info',
    description: 'Successful admin login',
  },
  {
    timestamp: '2024-01-20 09:45:00',
    type: 'Failed Login',
    user: 'unknown',
    ipAddress: '203.45.67.89',
    severity: 'Warning',
    description: 'Multiple failed login attempts',
  },
  {
    timestamp: '2024-01-20 08:15:00',
    type: 'Password Change',
    user: 'mediator@pension.gov.in',
    ipAddress: '192.168.1.105',
    severity: 'Info',
    description: 'User changed password',
  },
])

const getEventTypeColor = (type: string) => {
  const colors = {
    'Login Success': 'success',
    'Failed Login': 'danger',
    'Password Change': 'info',
    'Account Locked': 'warning',
  }
  return colors[type as keyof typeof colors] || 'secondary'
}

const getSeverityColor = (severity: string) => {
  const colors = {
    Info: 'info',
    Warning: 'warning',
    Critical: 'danger',
  }
  return colors[severity as keyof typeof colors] || 'secondary'
}
</script>
