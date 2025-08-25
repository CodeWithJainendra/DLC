<template>
  <div class="flex flex-col gap-4">
    <!-- Key Metrics -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="people" size="2xl" color="primary" />
          <h3 class="text-2xl font-bold mt-2">{{ metrics.totalPensioners }}</h3>
          <p class="text-secondary">Total Pensioners</p>
          <div class="text-xs text-success mt-1">+2.5% from last month</div>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="verified" size="2xl" color="success" />
          <h3 class="text-2xl font-bold mt-2">{{ metrics.verificationRate }}%</h3>
          <p class="text-secondary">Verification Rate</p>
          <div class="text-xs text-success mt-1">+5.2% from last month</div>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="schedule" size="2xl" color="info" />
          <h3 class="text-2xl font-bold mt-2">{{ metrics.avgProcessingTime }}h</h3>
          <p class="text-secondary">Avg Processing Time</p>
          <div class="text-xs text-danger mt-1">+0.3h from last month</div>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="support_agent" size="2xl" color="warning" />
          <h3 class="text-2xl font-bold mt-2">{{ metrics.mediatorEfficiency }}%</h3>
          <p class="text-secondary">Mediator Efficiency</p>
          <div class="text-xs text-success mt-1">+1.8% from last month</div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <VaCard>
        <VaCardTitle>
          <h2 class="text-xl font-semibold">Monthly Verification Trends</h2>
        </VaCardTitle>
        <VaCardContent>
          <div class="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p class="text-secondary">Line Chart - Monthly Verification Trends</p>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardTitle>
          <h2 class="text-xl font-semibold">Verification Types Distribution</h2>
        </VaCardTitle>
        <VaCardContent>
          <div class="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p class="text-secondary">Pie Chart - Verification Types</p>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Performance Metrics -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <VaCard>
        <VaCardTitle>
          <h2 class="text-xl font-semibold">Top Performing Mediators</h2>
        </VaCardTitle>
        <VaCardContent>
          <div class="space-y-3">
            <div
              v-for="mediator in topMediators"
              :key="mediator.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded"
            >
              <div class="flex items-center gap-3">
                <VaAvatar :src="mediator.avatar" size="small" />
                <div>
                  <div class="font-semibold">{{ mediator.name }}</div>
                  <div class="text-xs text-secondary">{{ mediator.location }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-semibold text-success">{{ mediator.completedVerifications }}</div>
                <div class="text-xs text-secondary">Completed</div>
              </div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardTitle>
          <h2 class="text-xl font-semibold">Regional Performance</h2>
        </VaCardTitle>
        <VaCardContent>
          <div class="space-y-3">
            <div
              v-for="region in regionalData"
              :key="region.name"
              class="flex items-center justify-between p-3 bg-gray-50 rounded"
            >
              <div>
                <div class="font-semibold">{{ region.name }}</div>
                <div class="text-xs text-secondary">{{ region.mediators }} mediators</div>
              </div>
              <div class="text-right">
                <div class="font-semibold">{{ region.verificationRate }}%</div>
                <div class="text-xs text-secondary">Success Rate</div>
              </div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Recent Activity -->
    <VaCard>
      <VaCardTitle>
        <h2 class="text-xl font-semibold">Recent System Activity</h2>
      </VaCardTitle>
      <VaCardContent>
        <div class="space-y-3">
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="flex items-center gap-3 p-3 border-l-4 border-primary bg-gray-50"
          >
            <VaIcon :name="activity.icon" :color="activity.color" />
            <div class="flex-1">
              <div>{{ activity.description }}</div>
              <div class="text-xs text-secondary">{{ activity.timestamp }}</div>
            </div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { VaCard, VaCardContent, VaCardTitle, VaIcon, VaAvatar } from 'vuestic-ui'

const metrics = ref({
  totalPensioners: 45248,
  verificationRate: 87.3,
  avgProcessingTime: 4.2,
  mediatorEfficiency: 92.1,
})

const topMediators = ref([
  {
    id: 'M001',
    name: 'अजय कुमार',
    location: 'Meerut',
    completedVerifications: 234,
    avatar: '/api/placeholder/32/32',
  },
  {
    id: 'M002',
    name: 'प्रिया शर्मा',
    location: 'Noida',
    completedVerifications: 198,
    avatar: '/api/placeholder/32/32',
  },
  {
    id: 'M003',
    name: 'राजेश गुप्ता',
    location: 'Ghaziabad',
    completedVerifications: 176,
    avatar: '/api/placeholder/32/32',
  },
])

const regionalData = ref([
  {
    name: 'Meerut',
    mediators: 25,
    verificationRate: 89.2,
  },
  {
    name: 'Noida',
    mediators: 18,
    verificationRate: 91.5,
  },
  {
    name: 'Ghaziabad',
    mediators: 22,
    verificationRate: 85.7,
  },
  {
    name: 'Lucknow',
    mediators: 31,
    verificationRate: 88.3,
  },
])

const recentActivity = ref([
  {
    id: 1,
    description: 'New mediator registered: सुमित्रा देवी (Kanpur)',
    timestamp: '2 hours ago',
    icon: 'person_add',
    color: 'success',
  },
  {
    id: 2,
    description: 'Bulk verification completed for 156 pensioners',
    timestamp: '4 hours ago',
    icon: 'verified',
    color: 'info',
  },
  {
    id: 3,
    description: 'System maintenance completed successfully',
    timestamp: '6 hours ago',
    icon: 'build',
    color: 'warning',
  },
  {
    id: 4,
    description: 'Monthly report generated and sent to administrators',
    timestamp: '1 day ago',
    icon: 'assessment',
    color: 'primary',
  },
])

onMounted(() => {
  // Load analytics data
})
</script>
