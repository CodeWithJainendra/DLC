<template>

  
  <div class="flex flex-col gap-4">
    <!-- Operation Types -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <VaCard class="cursor-pointer hover:shadow-lg transition-shadow" @click="selectOperation('upload')">
        <VaCardContent class="text-center">
          <VaIcon name="cloud_upload" size="3xl" color="primary" />
          <h3 class="text-lg font-semibold mt-3">Bulk Upload Pensioners</h3>
          <p class="text-secondary mt-2">Upload multiple pensioner records via Excel/CSV</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard class="cursor-pointer hover:shadow-lg transition-shadow" @click="selectOperation('verify')">
        <VaCardContent class="text-center">
          <VaIcon name="verified" size="3xl" color="success" />
          <h3 class="text-lg font-semibold mt-3">Bulk Verification</h3>
          <p class="text-secondary mt-2">Verify multiple pensioners at once</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard class="cursor-pointer hover:shadow-lg transition-shadow" @click="selectOperation('update')">
        <VaCardContent class="text-center">
          <VaIcon name="edit" size="3xl" color="info" />
          <h3 class="text-lg font-semibold mt-3">Bulk Update</h3>
          <p class="text-secondary mt-2">Update pensioner information in bulk</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard class="cursor-pointer hover:shadow-lg transition-shadow" @click="selectOperation('notify')">
        <VaCardContent class="text-center">
          <VaIcon name="send" size="3xl" color="warning" />
          <h3 class="text-lg font-semibold mt-3">Bulk Notifications</h3>
          <p class="text-secondary mt-2">Send notifications to multiple pensioners</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard class="cursor-pointer hover:shadow-lg transition-shadow" @click="selectOperation('deactivate')">
        <VaCardContent class="text-center">
          <VaIcon name="block" size="3xl" color="danger" />
          <h3 class="text-lg font-semibold mt-3">Bulk Deactivation</h3>
          <p class="text-secondary mt-2">Deactivate multiple pensioner accounts</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard class="cursor-pointer hover:shadow-lg transition-shadow" @click="selectOperation('report')">
        <VaCardContent class="text-center">
          <VaIcon name="assessment" size="3xl" color="secondary" />
          <h3 class="text-lg font-semibold mt-3">Bulk Reports</h3>
          <p class="text-secondary mt-2">Generate reports for multiple records</p>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Operation History -->
    <VaCard>
      <VaCardTitle>
        <h2 class="text-xl font-semibold">Recent Bulk Operations</h2>
      </VaCardTitle>
      <VaCardContent>
        <VaDataTable
          :items="operationHistory"
          :columns="columns"
          striped
          hoverable
        >
          <template #cell(type)="{ rowData }">
            <VaBadge
              :text="rowData.type"
              :color="getTypeColor(rowData.type)"
              outline
            />
          </template>
          
          <template #cell(status)="{ rowData }">
            <VaBadge
              :text="rowData.status"
              :color="getStatusColor(rowData.status)"
            />
          </template>
          
          <template #cell(progress)="{ rowData }">
            <div v-if="rowData.status === 'In Progress'" class="flex items-center gap-2">
              <VaProgressBar 
                :model-value="rowData.progress" 
                size="small" 
                color="primary"
              />
              <span class="text-sm">{{ rowData.progress }}%</span>
            </div>
            <span v-else>-</span>
          </template>
          
          <template #cell(actions)="{ rowData }">
            <div class="flex gap-2">
              <VaButton
                preset="plain"
                icon="visibility"
                @click="viewOperation(rowData)"
                aria-label="View Details"
                size="small"
              />
              <VaButton
                v-if="rowData.status === 'Completed' && rowData.resultFile"
                preset="plain"
                icon="download"
                @click="downloadResult(rowData)"
                aria-label="Download Result"
                size="small"
              />
              <VaButton
                v-if="rowData.status === 'In Progress'"
                preset="plain"
                icon="cancel"
                @click="cancelOperation(rowData)"
                aria-label="Cancel"
                size="small"
                color="danger"
              />
            </div>
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>
  </div>

  <!-- Operation Modal -->
  <VaModal
    v-model="showOperationModal"
    :title="getOperationTitle(selectedOperationType)"
    size="large"
    hide-default-actions
  >
    <div class="flex flex-col gap-4">
      <!-- Upload Operation -->
      <div v-if="selectedOperationType === 'upload'">
        <h4 class="font-semibold mb-3">Upload Pensioner Data</h4>
        <div class="space-y-4">
          <VaFileUpload
            v-model="uploadFiles"
            type="single"
            file-types=".xlsx,.csv"
            dropzone
          >
            Upload Excel/CSV File
          </VaFileUpload>
          
          <div class="text-sm text-secondary">
            <p>Supported formats: Excel (.xlsx), CSV (.csv)</p>
            <p>Maximum file size: 50MB</p>
            <VaButton preset="plain" @click="downloadTemplate">Download Template</VaButton>
          </div>
        </div>
      </div>
      
      <!-- Verify Operation -->
      <div v-if="selectedOperationType === 'verify'">
        <h4 class="font-semibold mb-3">Bulk Verification</h4>
        <div class="space-y-4">
          <VaSelect
            v-model="verificationCriteria"
            :options="verificationOptions"
            label="Verification Criteria"
            multiple
          />
          
          <VaTextarea
            v-model="pensionIds"
            label="Pension IDs (one per line)"
            placeholder="UP2024001234&#10;UP2024001235&#10;UP2024001236"
            rows="5"
          />
        </div>
      </div>
      
      <!-- Notification Operation -->
      <div v-if="selectedOperationType === 'notify'">
        <h4 class="font-semibold mb-3">Bulk Notifications</h4>
        <div class="space-y-4">
          <VaSelect
            v-model="notificationType"
            :options="notificationTypes"
            label="Notification Type"
          />
          
          <VaTextarea
            v-model="notificationMessage"
            label="Message"
            placeholder="Enter your notification message..."
            rows="4"
          />
          
          <VaSelect
            v-model="targetAudience"
            :options="audienceOptions"
            label="Target Audience"
          />
        </div>
      </div>
      
      <div class="flex justify-end gap-2 pt-4 border-t">
        <VaButton @click="showOperationModal = false">Cancel</VaButton>
        <VaButton @click="startOperation" preset="primary">Start Operation</VaButton>
      </div>
    </div>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  VaCard, VaCardContent, VaCardTitle, VaDataTable, VaBadge, 
  VaModal, VaButton, VaIcon, VaProgressBar, VaFileUpload, 
  VaSelect, VaTextarea 
} from 'vuestic-ui'

interface BulkOperation {
  id: string
  type: string
  description: string
  status: 'In Progress' | 'Completed' | 'Failed' | 'Cancelled'
  progress: number
  totalRecords: number
  processedRecords: number
  successCount: number
  errorCount: number
  startedDate: string
  completedDate?: string
  resultFile?: string
}

const showOperationModal = ref(false)
const selectedOperationType = ref('')
const uploadFiles = ref<File[]>([])
const verificationCriteria = ref([])
const pensionIds = ref('')
const notificationType = ref('')
const notificationMessage = ref('')
const targetAudience = ref('')

const verificationOptions = ['Life Certificate', 'Document Verification', 'Biometric Verification']
const notificationTypes = ['SMS', 'Email', 'Push Notification']
const audienceOptions = ['All Pensioners', 'Pending Verification', 'Specific District', 'Custom List']

const columns = [
  { key: 'type', label: 'Operation Type' },
  { key: 'description', label: 'Description' },
  { key: 'status', label: 'Status' },
  { key: 'progress', label: 'Progress' },
  { key: 'totalRecords', label: 'Total Records' },
  { key: 'successCount', label: 'Success' },
  { key: 'errorCount', label: 'Errors' },
  { key: 'startedDate', label: 'Started' },
  { key: 'actions', label: 'Actions', width: '150px' }
]

const operationHistory = ref<BulkOperation[]>([
  {
    id: '1',
    type: 'Upload',
    description: 'Bulk upload of 5,000 pensioner records',
    status: 'Completed',
    progress: 100,
    totalRecords: 5000,
    processedRecords: 5000,
    successCount: 4856,
    errorCount: 144,
    startedDate: '2024-01-20T10:30:00Z',
    completedDate: '2024-01-20T11:15:00Z',
    resultFile: '/results/upload_20240120.xlsx'
  },
  {
    id: '2',
    type: 'Verification',
    description: 'Bulk verification of pending cases',
    status: 'In Progress',
    progress: 67,
    totalRecords: 2500,
    processedRecords: 1675,
    successCount: 1589,
    errorCount: 86,
    startedDate: '2024-01-20T14:00:00Z'
  }
])

const getTypeColor = (type: string) => {
  const colors = {
    'Upload': 'primary',
    'Verification': 'success',
    'Update': 'info',
    'Notification': 'warning',
    'Deactivation': 'danger',
    'Report': 'secondary'
  }
  return colors[type as keyof typeof colors] || 'secondary'
}

const getStatusColor = (status: string) => {
  const colors = {
    'In Progress': 'info',
    'Completed': 'success',
    'Failed': 'danger',
    'Cancelled': 'warning'
  }
  return colors[status as keyof typeof colors] || 'secondary'
}

const getOperationTitle = (type: string) => {
  const titles = {
    'upload': 'Bulk Upload Pensioners',
    'verify': 'Bulk Verification',
    'update': 'Bulk Update',
    'notify': 'Bulk Notifications',
    'deactivate': 'Bulk Deactivation',
    'report': 'Bulk Reports'
  }
  return titles[type as keyof typeof titles] || 'Bulk Operation'
}

const selectOperation = (type: string) => {
  selectedOperationType.value = type
  showOperationModal.value = true
}

const startOperation = () => {
  const newOperation: BulkOperation = {
    id: Date.now().toString(),
    type: selectedOperationType.value.charAt(0).toUpperCase() + selectedOperationType.value.slice(1),
    description: `Bulk ${selectedOperationType.value} operation`,
    status: 'In Progress',
    progress: 0,
    totalRecords: Math.floor(Math.random() * 5000) + 1000,
    processedRecords: 0,
    successCount: 0,
    errorCount: 0,
    startedDate: new Date().toISOString()
  }
  
  operationHistory.value.unshift(newOperation)
  showOperationModal.value = false
  
  // Simulate progress
  const progressInterval = setInterval(() => {
    newOperation.progress += Math.floor(Math.random() * 10) + 5
    newOperation.processedRecords = Math.floor((newOperation.progress / 100) * newOperation.totalRecords)
    newOperation.successCount = Math.floor(newOperation.processedRecords * 0.95)
    newOperation.errorCount = newOperation.processedRecords - newOperation.successCount
    
    if (newOperation.progress >= 100) {
      newOperation.progress = 100
      newOperation.processedRecords = newOperation.totalRecords
      newOperation.status = 'Completed'
      newOperation.completedDate = new Date().toISOString()
      newOperation.resultFile = `/results/${selectedOperationType.value}_${newOperation.id}.xlsx`
      clearInterval(progressInterval)
    }
  }, 1500)
}

const viewOperation = (operation: BulkOperation) => {
  console.log('View operation details:', operation)
}

const downloadResult = (operation: BulkOperation) => {
  console.log('Download result file:', operation.resultFile)
}

const cancelOperation = (operation: BulkOperation) => {
  operation.status = 'Cancelled'
  console.log('Cancelled operation:', operation.id)
}

const downloadTemplate = () => {
  console.log('Download template file')
}

onMounted(() => {
  // Load operation history
})
</script>
