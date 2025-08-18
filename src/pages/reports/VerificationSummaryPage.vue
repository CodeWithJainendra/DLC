<template>

  
  <div class="flex flex-col gap-4">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="verified" size="2xl" color="success" />
          <h3 class="text-2xl font-bold mt-2">{{ summary.totalVerified }}</h3>
          <p class="text-secondary">Total Verified</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="schedule" size="2xl" color="warning" />
          <h3 class="text-2xl font-bold mt-2">{{ summary.pending }}</h3>
          <p class="text-secondary">Pending</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="cancel" size="2xl" color="danger" />
          <h3 class="text-2xl font-bold mt-2">{{ summary.rejected }}</h3>
          <p class="text-secondary">Rejected</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="analytics" size="2xl" color="info" />
          <h3 class="text-2xl font-bold mt-2">{{ summary.successRate }}%</h3>
          <p class="text-secondary">Success Rate</p>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Chart Placeholder -->
    <VaCard>
      <VaCardTitle>
        <h2 class="text-xl font-semibold">Verification Trends</h2>
      </VaCardTitle>
      <VaCardContent>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded">
          <p class="text-secondary">Verification trends chart will be displayed here</p>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Summary Table -->
    <VaCard>
      <VaCardTitle>
        <h2 class="text-xl font-semibold">District-wise Summary</h2>
      </VaCardTitle>
      <VaCardContent>
        <VaDataTable
          :items="districtSummary"
          :columns="columns"
          striped
          hoverable
        >
          <template #cell(successRate)="{ rowData }">
            <div class="flex items-center gap-2">
              <span>{{ rowData.successRate }}%</span>
              <VaProgressBar 
                :model-value="rowData.successRate" 
                size="small" 
                :color="getProgressColor(rowData.successRate)"
              />
            </div>
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  VaCard, VaCardContent, VaCardTitle, VaDataTable, 
  VaIcon, VaProgressBar 
} from 'vuestic-ui'

const summary = ref({
  totalVerified: '1,89,234',
  pending: '4,892',
  rejected: '2,156',
  successRate: 94.2
})

const columns = [
  { key: 'district', label: 'District' },
  { key: 'totalPensioners', label: 'Total Pensioners' },
  { key: 'verified', label: 'Verified' },
  { key: 'pending', label: 'Pending' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'successRate', label: 'Success Rate' }
]

const districtSummary = ref([
  {
    district: 'Meerut',
    totalPensioners: 25847,
    verified: 24156,
    pending: 1247,
    rejected: 444,
    successRate: 93.5
  },
  {
    district: 'Noida',
    totalPensioners: 18456,
    verified: 17892,
    pending: 456,
    rejected: 108,
    successRate: 97.0
  },
  {
    district: 'Lucknow',
    totalPensioners: 34567,
    verified: 32456,
    pending: 1567,
    rejected: 544,
    successRate: 93.9
  }
])

const getProgressColor = (rate: number) => {
  if (rate >= 95) return 'success'
  if (rate >= 90) return 'warning'
  return 'danger'
}
</script>
