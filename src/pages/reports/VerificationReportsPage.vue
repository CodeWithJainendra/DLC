<template>

  
  <div class="flex flex-col gap-4">
    <!-- Filters -->
    <VaCard>
      <VaCardContent class="flex flex-col sm:flex-row gap-4 items-end">
        <VaDateInput
          v-model="dateRange.start"
          label="From Date"
          class="w-48"
        />
        
        <VaDateInput
          v-model="dateRange.end"
          label="To Date"
          class="w-48"
        />
        
        <VaSelect
          v-model="reportType"
          :options="reportTypes"
          label="Report Type"
          class="w-48"
        />
        
        <VaButton @click="generateReport" preset="primary">
          Generate Report
        </VaButton>
        
        <VaButton @click="exportReport" preset="secondary">
          Export CSV
        </VaButton>
      </VaCardContent>
    </VaCard>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="verified" size="2xl" color="success" />
          <h3 class="text-2xl font-bold mt-2">{{ summary.completed }}</h3>
          <p class="text-secondary">Completed Verifications</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="pending" size="2xl" color="warning" />
          <h3 class="text-2xl font-bold mt-2">{{ summary.pending }}</h3>
          <p class="text-secondary">Pending Verifications</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="cancel" size="2xl" color="danger" />
          <h3 class="text-2xl font-bold mt-2">{{ summary.rejected }}</h3>
          <p class="text-secondary">Rejected Verifications</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="schedule" size="2xl" color="info" />
          <h3 class="text-2xl font-bold mt-2">{{ summary.avgTime }}h</h3>
          <p class="text-secondary">Avg Processing Time</p>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Chart -->
    <VaCard>
      <VaCardTitle>
        <h2 class="text-xl font-semibold">Verification Trends</h2>
      </VaCardTitle>
      <VaCardContent>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded">
          <p class="text-secondary">Chart will be displayed here</p>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Detailed Report Table -->
    <VaCard>
      <VaCardTitle>
        <h2 class="text-xl font-semibold">Detailed Report</h2>
      </VaCardTitle>
      <VaCardContent>
        <VaDataTable
          :items="reportData"
          :columns="columns"
          :loading="loading"
          striped
          hoverable
        >
          <template #cell(status)="{ rowData }">
            <VaBadge
              :text="rowData.status"
              :color="getStatusColor(rowData.status)"
            />
          </template>
          
          <template #cell(processingTime)="{ rowData }">
            <span>{{ rowData.processingTime }}h</span>
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  VaCard, VaCardContent, VaCardTitle, VaDateInput, VaSelect, 
  VaButton, VaIcon, VaDataTable, VaBadge 
} from 'vuestic-ui'

const dateRange = ref({
  start: new Date(new Date().setDate(new Date().getDate() - 30)),
  end: new Date()
})

const reportType = ref('All')
const loading = ref(false)

const reportTypes = ['All', 'Life Certificate', 'Address Verification', 'Bank Details', 'Disability Certificate']

const summary = ref({
  completed: 1256,
  pending: 347,
  rejected: 89,
  avgTime: 4.2
})

const columns = [
  { key: 'date', label: 'Date' },
  { key: 'pensionNumber', label: 'Pension Number' },
  { key: 'pensionerName', label: 'Pensioner Name' },
  { key: 'verificationType', label: 'Type' },
  { key: 'mediator', label: 'Mediator' },
  { key: 'status', label: 'Status' },
  { key: 'processingTime', label: 'Processing Time' }
]

const reportData = ref([
  {
    date: '2024-01-20',
    pensionNumber: 'PEN001234',
    pensionerName: 'राम कुमार शर्मा',
    verificationType: 'Life Certificate',
    mediator: 'अजय कुमार',
    status: 'Completed',
    processingTime: 3.5
  },
  {
    date: '2024-01-19',
    pensionNumber: 'PEN001235',
    pensionerName: 'सुनीता देवी',
    verificationType: 'Address Verification',
    mediator: 'प्रिया शर्मा',
    status: 'Pending',
    processingTime: 0
  }
])

const getStatusColor = (status: string) => {
  const colors = {
    'Completed': 'success',
    'Pending': 'warning',
    'Rejected': 'danger'
  }
  return colors[status as keyof typeof colors] || 'secondary'
}

const generateReport = () => {
  loading.value = true
  // Simulate API call
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const exportReport = () => {
  // Export functionality
  console.log('Exporting report...')
}

onMounted(() => {
  generateReport()
})
</script>
