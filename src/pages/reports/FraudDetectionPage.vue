<template>

  
  <div class="flex flex-col gap-4">
    <!-- Alert Summary -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="flag" size="2xl" color="danger" />
          <h3 class="text-2xl font-bold mt-2">{{ alerts.highRisk }}</h3>
          <p class="text-secondary">High Risk Cases</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="warning" size="2xl" color="warning" />
          <h3 class="text-2xl font-bold mt-2">{{ alerts.mediumRisk }}</h3>
          <p class="text-secondary">Medium Risk Cases</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="photo" size="2xl" color="info" />
          <h3 class="text-2xl font-bold mt-2">{{ alerts.duplicatePhotos }}</h3>
          <p class="text-secondary">Duplicate Photos</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="location_on" size="2xl" color="primary" />
          <h3 class="text-2xl font-bold mt-2">{{ alerts.suspiciousLocations }}</h3>
          <p class="text-secondary">Suspicious Locations</p>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Fraud Cases -->
    <VaCard>
      <VaCardTitle>
        <h2 class="text-xl font-semibold">Flagged Cases</h2>
        <div class="flex gap-2">
          <VaSelect
            v-model="riskFilter"
            :options="riskLevels"
            placeholder="Filter by Risk Level"
            class="w-48"
            clearable
          />
          <VaSelect
            v-model="typeFilter"
            :options="fraudTypes"
            placeholder="Filter by Type"
            class="w-48"
            clearable
          />
        </div>
      </VaCardTitle>
      
      <VaCardContent>
        <VaDataTable
          :items="fraudCases"
          :columns="columns"
          :loading="loading"
          striped
          hoverable
        >
          <template #cell(riskLevel)="{ rowData }">
            <VaBadge
              :text="rowData.riskLevel"
              :color="getRiskColor(rowData.riskLevel)"
            />
          </template>
          
          <template #cell(fraudType)="{ rowData }">
            <VaBadge
              :text="rowData.fraudType"
              color="warning"
              outline
            />
          </template>
          
          <template #cell(confidence)="{ rowData }">
            <div class="flex items-center gap-2">
              <span>{{ rowData.confidence }}%</span>
              <VaProgressBar 
                :model-value="rowData.confidence" 
                size="small" 
                :color="getConfidenceColor(rowData.confidence)"
              />
            </div>
          </template>
          
          <template #cell(actions)="{ rowData }">
            <div class="flex gap-2">
              <VaButton
                preset="plain"
                icon="visibility"
                @click="viewCase(rowData)"
                aria-label="View Details"
                size="small"
              />
              <VaButton
                preset="plain"
                icon="check"
                @click="markAsResolved(rowData)"
                aria-label="Mark as Resolved"
                size="small"
                color="success"
              />
              <VaButton
                preset="plain"
                icon="report"
                @click="escalateCase(rowData)"
                aria-label="Escalate"
                size="small"
                color="danger"
              />
            </div>
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>
  </div>

  <!-- Case Details Modal -->
  <VaModal
    v-model="showDetailsModal"
    title="Fraud Case Details"
    size="large"
    hide-default-actions
  >
    <div v-if="selectedCase" class="flex flex-col gap-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="font-semibold mb-3">Case Information</h4>
          <div class="space-y-2">
            <p><strong>Pension ID:</strong> {{ selectedCase.pensionId }}</p>
            <p><strong>Pensioner:</strong> {{ selectedCase.pensionerName }}</p>
            <p><strong>Risk Level:</strong> 
              <VaBadge 
                :text="selectedCase.riskLevel" 
                :color="getRiskColor(selectedCase.riskLevel)"
              />
            </p>
            <p><strong>Fraud Type:</strong> {{ selectedCase.fraudType }}</p>
            <p><strong>Confidence:</strong> {{ selectedCase.confidence }}%</p>
          </div>
        </div>
        
        <div>
          <h4 class="font-semibold mb-3">Detection Details</h4>
          <div class="space-y-2">
            <p><strong>Detected On:</strong> {{ formatDate(selectedCase.detectedDate) }}</p>
            <p><strong>Detection Method:</strong> {{ selectedCase.detectionMethod }}</p>
            <p><strong>Status:</strong> {{ selectedCase.status }}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h4 class="font-semibold mb-3">AI Analysis</h4>
        <div class="p-4 bg-gray-50 rounded">
          <p>{{ selectedCase.aiAnalysis }}</p>
        </div>
      </div>
      
      <div class="flex justify-end gap-2 pt-4 border-t">
        <VaButton @click="showDetailsModal = false">Close</VaButton>
        <VaButton @click="escalateCase(selectedCase)" color="danger">Escalate</VaButton>
        <VaButton @click="markAsResolved(selectedCase)" preset="primary">Mark as Resolved</VaButton>
      </div>
    </div>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  VaCard, VaCardContent, VaCardTitle, VaSelect, VaDataTable, 
  VaBadge, VaModal, VaButton, VaIcon, VaProgressBar 
} from 'vuestic-ui'

interface FraudCase {
  id: string
  pensionId: string
  pensionerName: string
  riskLevel: 'High' | 'Medium' | 'Low'
  fraudType: string
  confidence: number
  detectedDate: string
  detectionMethod: string
  status: string
  aiAnalysis: string
}

const riskFilter = ref('')
const typeFilter = ref('')
const loading = ref(false)
const showDetailsModal = ref(false)
const selectedCase = ref<FraudCase | null>(null)

const alerts = ref({
  highRisk: '23',
  mediumRisk: '67',
  duplicatePhotos: '12',
  suspiciousLocations: '8'
})

const riskLevels = ['High', 'Medium', 'Low']
const fraudTypes = ['Duplicate Photo', 'Suspicious Location', 'Data Inconsistency', 'Multiple Claims']

const columns = [
  { key: 'pensionId', label: 'Pension ID' },
  { key: 'pensionerName', label: 'Pensioner Name' },
  { key: 'riskLevel', label: 'Risk Level' },
  { key: 'fraudType', label: 'Fraud Type' },
  { key: 'confidence', label: 'Confidence' },
  { key: 'detectedDate', label: 'Detected' },
  { key: 'actions', label: 'Actions', width: '150px' }
]

const fraudCases = ref<FraudCase[]>([
  {
    id: '1',
    pensionId: 'UP2024001234',
    pensionerName: 'राम कुमार शर्मा',
    riskLevel: 'High',
    fraudType: 'Duplicate Photo',
    confidence: 95,
    detectedDate: '2024-01-20T10:30:00Z',
    detectionMethod: 'AI Photo Matching',
    status: 'Under Investigation',
    aiAnalysis: 'The submitted photo matches with another pensioner profile (ID: UP2024005678) with 95% similarity. This indicates potential identity fraud or document reuse.'
  },
  {
    id: '2',
    pensionId: 'UP2024001235',
    pensionerName: 'सुनीता देवी',
    riskLevel: 'Medium',
    fraudType: 'Suspicious Location',
    confidence: 78,
    detectedDate: '2024-01-19T14:15:00Z',
    detectionMethod: 'Geolocation Analysis',
    status: 'Pending Review',
    aiAnalysis: 'Multiple verification attempts from different geographical locations within a short time frame. This pattern suggests potential fraudulent activity.'
  }
])

const getRiskColor = (risk: string) => {
  const colors = {
    'High': 'danger',
    'Medium': 'warning',
    'Low': 'success'
  }
  return colors[risk as keyof typeof colors] || 'secondary'
}

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 90) return 'danger'
  if (confidence >= 70) return 'warning'
  return 'success'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN')
}

const viewCase = (fraudCase: FraudCase) => {
  selectedCase.value = fraudCase
  showDetailsModal.value = true
}

const markAsResolved = (fraudCase: FraudCase) => {
  fraudCase.status = 'Resolved'
  console.log('Marked as resolved:', fraudCase.id)
  showDetailsModal.value = false
}

const escalateCase = (fraudCase: FraudCase) => {
  fraudCase.status = 'Escalated'
  console.log('Escalated case:', fraudCase.id)
  showDetailsModal.value = false
}

onMounted(() => {
  // Load initial data
})
</script>
