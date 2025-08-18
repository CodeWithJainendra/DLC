<template>
  <div class="flex flex-col gap-4">
    <!-- Real-time Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="today" size="2xl" color="primary" />
          <h3 class="text-2xl font-bold mt-2">{{ stats.todayVerifications }}</h3>
          <p class="text-secondary">Today's Verifications</p>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="computer" size="2xl" color="success" />
          <h3 class="text-2xl font-bold mt-2">{{ stats.onlineVerifications }}</h3>
          <p class="text-secondary">Online (Today)</p>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="business" size="2xl" color="info" />
          <h3 class="text-2xl font-bold mt-2">{{ stats.offlineVerifications }}</h3>
          <p class="text-secondary">Offline (Today)</p>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="schedule" size="2xl" color="warning" />
          <h3 class="text-2xl font-bold mt-2">{{ stats.pendingApprovals }}</h3>
          <p class="text-secondary">Pending Approvals</p>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="flag" size="2xl" color="danger" />
          <h3 class="text-2xl font-bold mt-2">{{ stats.rejectedToday }}</h3>
          <p class="text-secondary">Rejected Today</p>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Filters -->
    <VaCard>
      <VaCardContent class="flex flex-col sm:flex-row gap-4 items-end">
        <VaDateInput v-model="dateRange.start" label="From Date" class="w-48" />

        <VaDateInput v-model="dateRange.end" label="To Date" class="w-48" />

        <VaSelect v-model="modeFilter" :options="modeOptions" label="Verification Mode" class="w-48" clearable />

        <VaSelect v-model="statusFilter" :options="statusOptions" label="Status" class="w-48" clearable />

        <VaSelect v-model="districtFilter" :options="districtOptions" label="District" class="w-48" clearable />

        <VaButton preset="primary" @click="applyFilters"> Apply Filters </VaButton>

        <VaButton preset="secondary" @click="exportData"> Export Data </VaButton>
      </VaCardContent>
    </VaCard>

    <!-- Verification Timeline -->
    <VaCard>
      <VaCardTitle>
        <h2 class="text-xl font-semibold">Verification Timeline</h2>
        <div class="text-sm text-secondary">Real-time verification tracking | Last updated: {{ lastUpdated }}</div>
      </VaCardTitle>

      <VaCardContent>
        <VaDataTable :items="verifications" :columns="columns" :loading="loading" striped hoverable>
          <template #cell(pensionerPhoto)="{ rowData }">
            <VaAvatar :src="rowData.pensionerPhoto" size="small" />
          </template>

          <template #cell(verificationMode)="{ rowData }">
            <VaBadge :text="rowData.verificationMode" :color="getModeColor(rowData.verificationMode)" outline />
          </template>

          <template #cell(status)="{ rowData }">
            <VaBadge :text="rowData.status" :color="getStatusColor(rowData.status)" />
          </template>

          <template #cell(verificationDateTime)="{ rowData }">
            <div>
              <div class="font-medium">{{ formatDate(rowData.verificationDateTime) }}</div>
              <div class="text-xs text-secondary">{{ formatTime(rowData.verificationDateTime) }}</div>
            </div>
          </template>

          <template #cell(verifiedBy)="{ rowData }">
            <div class="flex items-center gap-2">
              <VaAvatar :src="rowData.verifierPhoto" size="small" />
              <div>
                <div class="font-medium">{{ rowData.verifiedBy }}</div>
                <div class="text-xs text-secondary">{{ rowData.verifierOrganization }}</div>
              </div>
            </div>
          </template>

          <template #cell(location)="{ rowData }">
            <div>
              <div class="font-medium">{{ rowData.location }}</div>
              <div class="text-xs text-secondary">{{ rowData.district }}</div>
            </div>
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="flex gap-2">
              <VaButton
                preset="plain"
                icon="visibility"
                aria-label="View Details"
                size="small"
                @click="viewDetails(rowData)"
              />
              <VaButton
                v-if="rowData.status === 'Pending'"
                preset="plain"
                icon="check"
                aria-label="Approve"
                size="small"
                color="success"
                @click="approveVerification(rowData)"
              />
              <VaButton
                v-if="rowData.status === 'Pending'"
                preset="plain"
                icon="close"
                aria-label="Reject"
                size="small"
                color="danger"
                @click="rejectVerification(rowData)"
              />
              <VaButton
                preset="plain"
                icon="download"
                aria-label="Download Proof"
                size="small"
                @click="downloadProof(rowData)"
              />
            </div>
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>
  </div>

  <!-- Verification Details Modal -->
  <VaModal v-model="showDetailsModal" title="Verification Details" size="large" hide-default-actions>
    <div v-if="selectedVerification" class="flex flex-col gap-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="font-semibold mb-3">Pensioner Information</h4>
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <VaAvatar :src="selectedVerification.pensionerPhoto" size="large" />
              <div>
                <p class="font-medium">{{ selectedVerification.pensionerName }}</p>
                <p class="text-sm text-secondary">{{ selectedVerification.pensionId }}</p>
              </div>
            </div>
            <p><strong>Mobile:</strong> {{ selectedVerification.mobileNumber }}</p>
            <p><strong>District:</strong> {{ selectedVerification.district }}</p>
          </div>
        </div>

        <div>
          <h4 class="font-semibold mb-3">Verification Details</h4>
          <div class="space-y-2">
            <p>
              <strong>Mode:</strong>
              <VaBadge
                :text="selectedVerification.verificationMode"
                :color="getModeColor(selectedVerification.verificationMode)"
                outline
              />
            </p>
            <p>
              <strong>Status:</strong>
              <VaBadge :text="selectedVerification.status" :color="getStatusColor(selectedVerification.status)" />
            </p>
            <p><strong>Date & Time:</strong> {{ formatDateTime(selectedVerification.verificationDateTime) }}</p>
            <p><strong>Location:</strong> {{ selectedVerification.location }}</p>
          </div>
        </div>
      </div>

      <div>
        <h4 class="font-semibold mb-3">Verifier Information</h4>
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded">
          <VaAvatar :src="selectedVerification.verifierPhoto" size="large" />
          <div>
            <p class="font-medium">{{ selectedVerification.verifiedBy }}</p>
            <p class="text-sm text-secondary">{{ selectedVerification.verifierOrganization }}</p>
            <p class="text-sm text-secondary">ID: {{ selectedVerification.verifierId }}</p>
          </div>
        </div>
      </div>

      <div v-if="selectedVerification.documents.length">
        <h4 class="font-semibold mb-3">Submitted Documents</h4>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
          <VaCard
            v-for="doc in selectedVerification.documents"
            :key="doc.id"
            class="cursor-pointer hover:shadow-md"
            @click="viewDocument(doc)"
          >
            <VaCardContent class="text-center p-3">
              <VaIcon name="description" size="large" color="primary" />
              <p class="text-sm mt-1">{{ doc.name }}</p>
            </VaCardContent>
          </VaCard>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-4 border-t">
        <VaButton @click="showDetailsModal = false">Close</VaButton>
        <VaButton
          v-if="selectedVerification.status === 'Pending'"
          color="danger"
          @click="rejectVerification(selectedVerification)"
        >
          Reject
        </VaButton>
        <VaButton
          v-if="selectedVerification.status === 'Pending'"
          preset="primary"
          @click="approveVerification(selectedVerification)"
        >
          Approve
        </VaButton>
      </div>
    </div>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  VaCard,
  VaCardContent,
  VaCardTitle,
  VaDateInput,
  VaSelect,
  VaButton,
  VaDataTable,
  VaBadge,
  VaModal,
  VaIcon,
  VaAvatar,
} from 'vuestic-ui'

interface Verification {
  id: string
  pensionId: string
  pensionerName: string
  pensionerPhoto: string
  mobileNumber: string
  verificationMode: 'Online' | 'Offline'
  status: 'Approved' | 'Pending' | 'Rejected'
  verificationDateTime: string
  verifiedBy: string
  verifierId: string
  verifierPhoto: string
  verifierOrganization: string
  location: string
  district: string
  documents: Array<{
    id: string
    name: string
    url: string
  }>
}

const dateRange = ref({
  start: new Date(new Date().setDate(new Date().getDate() - 7)),
  end: new Date(),
})

const modeFilter = ref('')
const statusFilter = ref('')
const districtFilter = ref('')
const loading = ref(false)
const showDetailsModal = ref(false)
const selectedVerification = ref<Verification | null>(null)

const lastUpdated = ref(new Date().toLocaleTimeString('en-IN'))

const stats = ref({
  todayVerifications: '1,247',
  onlineVerifications: '856',
  offlineVerifications: '391',
  pendingApprovals: '89',
  rejectedToday: '12',
})

const modeOptions = ['Online', 'Offline']
const statusOptions = ['Approved', 'Pending', 'Rejected']
const districtOptions = ['Meerut', 'Noida', 'Ghaziabad', 'Lucknow', 'Kanpur', 'Agra']

const columns = [
  { key: 'pensionerPhoto', label: 'Photo', width: '60px' },
  { key: 'pensionId', label: 'Pension ID' },
  { key: 'pensionerName', label: 'Pensioner Name' },
  { key: 'verificationMode', label: 'Mode' },
  { key: 'status', label: 'Status' },
  { key: 'verificationDateTime', label: 'Date & Time' },
  { key: 'verifiedBy', label: 'Verified By' },
  { key: 'location', label: 'Location' },
  { key: 'actions', label: 'Actions', width: '150px' },
]

const verifications = ref<Verification[]>([
  {
    id: '1',
    pensionId: 'UP2024001234',
    pensionerName: 'राम कुमार शर्मा',
    pensionerPhoto: '/api/placeholder/40/40',
    mobileNumber: '9876543210',
    verificationMode: 'Online',
    status: 'Approved',
    verificationDateTime: '2024-01-20T10:30:00Z',
    verifiedBy: 'System Auto-Verification',
    verifierId: 'SYS001',
    verifierPhoto: '/api/placeholder/32/32',
    verifierOrganization: 'Online Portal',
    location: 'Meerut',
    district: 'Meerut',
    documents: [
      { id: '1', name: 'Life Certificate.pdf', url: '#' },
      { id: '2', name: 'Aadhaar Copy.pdf', url: '#' },
    ],
  },
  {
    id: '2',
    pensionId: 'UP2024001235',
    pensionerName: 'सुनीता देवी',
    pensionerPhoto: '/api/placeholder/40/40',
    mobileNumber: '9876543211',
    verificationMode: 'Offline',
    status: 'Pending',
    verificationDateTime: '2024-01-20T14:15:00Z',
    verifiedBy: 'अजय कुमार',
    verifierId: 'SBI001',
    verifierPhoto: '/api/placeholder/32/32',
    verifierOrganization: 'State Bank of India',
    location: 'Noida Branch',
    district: 'Gautam Buddha Nagar',
    documents: [
      { id: '3', name: 'Life Certificate.jpg', url: '#' },
      { id: '4', name: 'Photo Verification.jpg', url: '#' },
    ],
  },
])

const getModeColor = (mode: string) => {
  return mode === 'Online' ? 'success' : 'info'
}

const getStatusColor = (status: string) => {
  const colors = {
    Approved: 'success',
    Pending: 'warning',
    Rejected: 'danger',
  }
  return colors[status as keyof typeof colors] || 'secondary'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN')
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-IN')
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-IN')
}

const applyFilters = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const exportData = () => {
  console.log('Exporting verification data...')
}

const viewDetails = (verification: Verification) => {
  selectedVerification.value = verification
  showDetailsModal.value = true
}

const approveVerification = (verification: Verification) => {
  verification.status = 'Approved'
  console.log('Approved verification:', verification.id)
  showDetailsModal.value = false
}

const rejectVerification = (verification: Verification) => {
  verification.status = 'Rejected'
  console.log('Rejected verification:', verification.id)
  showDetailsModal.value = false
}

const downloadProof = (verification: Verification) => {
  console.log('Downloading proof for:', verification.id)
}

const viewDocument = (document: any) => {
  console.log('View document:', document)
}

onMounted(() => {
  // Update timestamp every minute
  setInterval(() => {
    lastUpdated.value = new Date().toLocaleTimeString('en-IN')
  }, 60000)
})
</script>
