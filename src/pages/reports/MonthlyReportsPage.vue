<template>

  
  <div class="flex flex-col gap-4">
    <!-- Report Generation -->
    <VaCard>
      <VaCardContent class="flex flex-col sm:flex-row gap-4 items-end">
        <VaSelect
          v-model="selectedMonth"
          :options="monthOptions"
          label="Select Month"
          class="w-48"
        />
        
        <VaSelect
          v-model="selectedYear"
          :options="yearOptions"
          label="Select Year"
          class="w-32"
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
          Export PDF
        </VaButton>
      </VaCardContent>
    </VaCard>

    <!-- Monthly Summary -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="people" size="2xl" color="primary" />
          <h3 class="text-2xl font-bold mt-2">{{ monthlyStats.totalVerifications }}</h3>
          <p class="text-secondary">Total Verifications</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="computer" size="2xl" color="success" />
          <h3 class="text-2xl font-bold mt-2">{{ monthlyStats.onlineVerifications }}</h3>
          <p class="text-secondary">Online Verifications</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="business" size="2xl" color="info" />
          <h3 class="text-2xl font-bold mt-2">{{ monthlyStats.offlineVerifications }}</h3>
          <p class="text-secondary">Offline Verifications</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="trending_up" size="2xl" color="warning" />
          <h3 class="text-2xl font-bold mt-2">{{ monthlyStats.successRate }}%</h3>
          <p class="text-secondary">Success Rate</p>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Detailed Report -->
    <VaCard>
      <VaCardTitle>
        <h2 class="text-xl font-semibold">{{ selectedMonth }} {{ selectedYear }} - Detailed Report</h2>
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
        </VaDataTable>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  VaCard, VaCardContent, VaCardTitle, VaSelect, VaButton, 
  VaDataTable, VaBadge, VaIcon 
} from 'vuestic-ui'

const selectedMonth = ref('January')
const selectedYear = ref(2024)
const reportType = ref('All Verifications')
const loading = ref(false)

const monthOptions = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
const yearOptions = [2024, 2023, 2022]
const reportTypes = ['All Verifications', 'Life Certificates', 'Document Verifications', 'Failed Verifications']

const monthlyStats = ref({
  totalVerifications: '18,456',
  onlineVerifications: '12,567',
  offlineVerifications: '5,889',
  successRate: 94.2
})

const columns = [
  { key: 'date', label: 'Date' },
  { key: 'pensionId', label: 'Pension ID' },
  { key: 'pensionerName', label: 'Pensioner Name' },
  { key: 'verificationType', label: 'Type' },
  { key: 'mode', label: 'Mode' },
  { key: 'status', label: 'Status' },
  { key: 'verifier', label: 'Verified By' }
]

const reportData = ref([
  {
    date: '2024-01-20',
    pensionId: 'UP2024001234',
    pensionerName: 'राम कुमार शर्मा',
    verificationType: 'Life Certificate',
    mode: 'Online',
    status: 'Approved',
    verifier: 'System Auto-Verification'
  },
  {
    date: '2024-01-19',
    pensionId: 'UP2024001235',
    pensionerName: 'सुनीता देवी',
    verificationType: 'Document Verification',
    mode: 'Offline',
    status: 'Approved',
    verifier: 'अजय कुमार (SBI)'
  }
])

const getStatusColor = (status: string) => {
  const colors = {
    'Approved': 'success',
    'Pending': 'warning',
    'Rejected': 'danger'
  }
  return colors[status as keyof typeof colors] || 'secondary'
}

const generateReport = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const exportReport = () => {
  console.log('Exporting monthly report...')
}

onMounted(() => {
  generateReport()
})
</script>
