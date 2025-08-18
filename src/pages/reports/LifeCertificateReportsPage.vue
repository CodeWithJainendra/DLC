<template>

  
  <div class="flex flex-col gap-4">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="verified" size="2xl" color="success" />
          <h3 class="text-2xl font-bold mt-2">{{ stats.submitted }}</h3>
          <p class="text-secondary">Submitted This Year</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="schedule" size="2xl" color="warning" />
          <h3 class="text-2xl font-bold mt-2">{{ stats.pending }}</h3>
          <p class="text-secondary">Pending Submission</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="warning" size="2xl" color="danger" />
          <h3 class="text-2xl font-bold mt-2">{{ stats.overdue }}</h3>
          <p class="text-secondary">Overdue</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="trending_up" size="2xl" color="info" />
          <h3 class="text-2xl font-bold mt-2">{{ stats.completionRate }}%</h3>
          <p class="text-secondary">Completion Rate</p>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Filters and Actions -->
    <VaCard>
      <VaCardContent class="flex flex-col sm:flex-row gap-4 items-end">
        <VaSelect
          v-model="yearFilter"
          :options="yearOptions"
          label="Year"
          class="w-32"
        />
        
        <VaSelect
          v-model="monthFilter"
          :options="monthOptions"
          label="Month"
          class="w-40"
        />
        
        <VaSelect
          v-model="statusFilter"
          :options="statusOptions"
          label="Status"
          class="w-40"
        />
        
        <VaButton @click="generateReport" preset="primary">
          Generate Report
        </VaButton>
        
        <VaButton @click="sendReminders" preset="secondary">
          Send Reminders
        </VaButton>
      </VaCardContent>
    </VaCard>

    <!-- Life Certificate Status Table -->
    <VaCard>
      <VaCardTitle>
        <h2 class="text-xl font-semibold">Life Certificate Status</h2>
      </VaCardTitle>
      <VaCardContent>
        <VaDataTable
          :items="lifeCertificates"
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
          
          <template #cell(dueDate)="{ rowData }">
            <span :class="getDueDateClass(rowData.dueDate)">
              {{ formatDate(rowData.dueDate) }}
            </span>
          </template>
          
          <template #cell(actions)="{ rowData }">
            <div class="flex gap-2">
              <VaButton
                v-if="rowData.status === 'Pending'"
                preset="plain"
                icon="send"
                @click="sendReminder(rowData)"
                aria-label="Send Reminder"
                size="small"
              />
              <VaButton
                preset="plain"
                icon="visibility"
                @click="viewDetails(rowData)"
                aria-label="View Details"
                size="small"
              />
            </div>
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
  VaIcon, VaDataTable, VaBadge 
} from 'vuestic-ui'

const yearFilter = ref(new Date().getFullYear())
const monthFilter = ref('')
const statusFilter = ref('')
const loading = ref(false)

const yearOptions = [2024, 2023, 2022]
const monthOptions = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
const statusOptions = ['Submitted', 'Pending', 'Overdue', 'Verified']

const stats = ref({
  submitted: 3256,
  pending: 1847,
  overdue: 423,
  completionRate: 78
})

const columns = [
  { key: 'pensionNumber', label: 'Pension Number' },
  { key: 'pensionerName', label: 'Pensioner Name' },
  { key: 'lastSubmission', label: 'Last Submission' },
  { key: 'dueDate', label: 'Due Date' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', width: '100px' }
]

const lifeCertificates = ref([
  {
    pensionNumber: 'PEN001234',
    pensionerName: 'राम कुमार शर्मा',
    lastSubmission: '2023-01-15',
    dueDate: '2024-01-15',
    status: 'Submitted'
  },
  {
    pensionNumber: 'PEN001235',
    pensionerName: 'सुनीता देवी',
    lastSubmission: '2022-11-20',
    dueDate: '2023-11-20',
    status: 'Overdue'
  },
  {
    pensionNumber: 'PEN001236',
    pensionerName: 'विजय सिंह',
    lastSubmission: '2023-03-10',
    dueDate: '2024-03-10',
    status: 'Pending'
  }
])

const getStatusColor = (status: string) => {
  const colors = {
    'Submitted': 'success',
    'Verified': 'info',
    'Pending': 'warning',
    'Overdue': 'danger'
  }
  return colors[status as keyof typeof colors] || 'secondary'
}

const getDueDateClass = (dueDate: string) => {
  const due = new Date(dueDate)
  const now = new Date()
  const daysDiff = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff < 0) return 'text-danger font-semibold'
  if (daysDiff < 30) return 'text-warning'
  return 'text-success'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN')
}

const generateReport = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const sendReminders = () => {
  console.log('Sending bulk reminders...')
}

const sendReminder = (certificate: any) => {
  console.log('Sending reminder to:', certificate.pensionerName)
}

const viewDetails = (certificate: any) => {
  console.log('View details for:', certificate)
}

onMounted(() => {
  generateReport()
})
</script>
