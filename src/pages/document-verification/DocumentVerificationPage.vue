<template>

  
  <div class="flex flex-col gap-4">
    <!-- Quick Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="description" size="2xl" color="primary" />
          <h3 class="text-2xl font-bold mt-2">{{ stats.totalDocuments }}</h3>
          <p class="text-secondary">Total Documents</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="pending" size="2xl" color="warning" />
          <h3 class="text-2xl font-bold mt-2">{{ stats.pendingReview }}</h3>
          <p class="text-secondary">Pending Review</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="verified" size="2xl" color="success" />
          <h3 class="text-2xl font-bold mt-2">{{ stats.verified }}</h3>
          <p class="text-secondary">Verified</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="flag" size="2xl" color="danger" />
          <h3 class="text-2xl font-bold mt-2">{{ stats.flagged }}</h3>
          <p class="text-secondary">Flagged</p>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Document Queue -->
    <VaCard>
      <VaCardTitle>
        <h2 class="text-xl font-semibold">Document Verification Queue</h2>
        <div class="flex gap-2">
          <VaSelect
            v-model="statusFilter"
            :options="statusOptions"
            placeholder="Filter by Status"
            class="w-40"
            clearable
          />
          <VaSelect
            v-model="typeFilter"
            :options="documentTypes"
            placeholder="Filter by Type"
            class="w-48"
            clearable
          />
        </div>
      </VaCardTitle>
      
      <VaCardContent>
        <VaDataTable
          :items="documents"
          :columns="columns"
          :loading="loading"
          striped
          hoverable
        >
          <template #cell(thumbnail)="{ rowData }">
            <img 
              :src="rowData.thumbnail" 
              alt="Document thumbnail"
              class="w-12 h-12 object-cover rounded cursor-pointer"
              @click="viewDocument(rowData)"
            />
          </template>
          
          <template #cell(type)="{ rowData }">
            <VaBadge
              :text="rowData.type"
              color="info"
              outline
            />
          </template>
          
          <template #cell(status)="{ rowData }">
            <VaBadge
              :text="rowData.status"
              :color="getStatusColor(rowData.status)"
            />
          </template>
          
          <template #cell(uploadedDate)="{ rowData }">
            <div>
              <div>{{ formatDate(rowData.uploadedDate) }}</div>
              <div class="text-xs text-secondary">
                {{ getTimeAgo(rowData.uploadedDate) }}
              </div>
            </div>
          </template>
          
          <template #cell(actions)="{ rowData }">
            <div class="flex gap-2">
              <VaButton
                preset="plain"
                icon="visibility"
                @click="viewDocument(rowData)"
                aria-label="View Document"
                size="small"
              />
              <VaButton
                v-if="rowData.status === 'Pending'"
                preset="plain"
                icon="check"
                @click="approveDocument(rowData)"
                aria-label="Approve"
                size="small"
                color="success"
              />
              <VaButton
                v-if="rowData.status === 'Pending'"
                preset="plain"
                icon="close"
                @click="rejectDocument(rowData)"
                aria-label="Reject"
                size="small"
                color="danger"
              />
              <VaButton
                preset="plain"
                icon="download"
                @click="downloadDocument(rowData)"
                aria-label="Download"
                size="small"
              />
            </div>
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>
  </div>

  <!-- Document Viewer Modal -->
  <VaModal
    v-model="showViewerModal"
    title="Document Viewer"
    size="large"
    hide-default-actions
  >
    <div v-if="selectedDocument" class="flex flex-col gap-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="font-semibold mb-3">Document Information</h4>
          <div class="space-y-2">
            <p><strong>Type:</strong> {{ selectedDocument.type }}</p>
            <p><strong>Pensioner:</strong> {{ selectedDocument.pensionerName }}</p>
            <p><strong>Pension ID:</strong> {{ selectedDocument.pensionId }}</p>
            <p><strong>Uploaded:</strong> {{ formatDate(selectedDocument.uploadedDate) }}</p>
            <p><strong>File Size:</strong> {{ selectedDocument.fileSize }}</p>
          </div>
        </div>
        
        <div>
          <h4 class="font-semibold mb-3">Verification Status</h4>
          <div class="space-y-2">
            <p><strong>Status:</strong> 
              <VaBadge 
                :text="selectedDocument.status" 
                :color="getStatusColor(selectedDocument.status)"
              />
            </p>
            <p v-if="selectedDocument.verifiedBy"><strong>Verified By:</strong> {{ selectedDocument.verifiedBy }}</p>
            <p v-if="selectedDocument.verificationDate"><strong>Verification Date:</strong> {{ formatDate(selectedDocument.verificationDate) }}</p>
            <p v-if="selectedDocument.remarks"><strong>Remarks:</strong> {{ selectedDocument.remarks }}</p>
          </div>
        </div>
      </div>
      
      <!-- Document Preview -->
      <div>
        <h4 class="font-semibold mb-3">Document Preview</h4>
        <div class="border rounded p-4 bg-gray-50 text-center">
          <img 
            :src="selectedDocument.fullImage" 
            alt="Document preview"
            class="max-w-full max-h-96 mx-auto rounded shadow"
          />
        </div>
      </div>
      
      <!-- OCR Results (if available) -->
      <div v-if="selectedDocument.ocrText">
        <h4 class="font-semibold mb-3">OCR Extracted Text</h4>
        <div class="border rounded p-4 bg-gray-50">
          <pre class="whitespace-pre-wrap text-sm">{{ selectedDocument.ocrText }}</pre>
        </div>
      </div>
      
      <!-- Verification Actions -->
      <div v-if="selectedDocument.status === 'Pending'" class="border-t pt-4">
        <h4 class="font-semibold mb-3">Verification Actions</h4>
        <VaTextarea
          v-model="verificationRemarks"
          label="Verification Remarks"
          placeholder="Add remarks about the document verification..."
          rows="3"
        />
        <div class="flex justify-end gap-2 mt-4">
          <VaButton @click="showViewerModal = false">Close</VaButton>
          <VaButton 
            @click="rejectDocument(selectedDocument)"
            color="danger"
          >
            Reject Document
          </VaButton>
          <VaButton 
            @click="approveDocument(selectedDocument)"
            preset="primary"
          >
            Approve Document
          </VaButton>
        </div>
      </div>
      
      <div v-else class="flex justify-end gap-2 pt-4 border-t">
        <VaButton @click="showViewerModal = false">Close</VaButton>
        <VaButton @click="downloadDocument(selectedDocument)" preset="secondary">Download</VaButton>
      </div>
    </div>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  VaCard, VaCardContent, VaCardTitle, VaSelect, VaDataTable, 
  VaBadge, VaModal, VaButton, VaTextarea, VaIcon 
} from 'vuestic-ui'

interface Document {
  id: string
  pensionId: string
  pensionerName: string
  type: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Flagged'
  uploadedDate: string
  fileSize: string
  thumbnail: string
  fullImage: string
  ocrText?: string
  verifiedBy?: string
  verificationDate?: string
  remarks?: string
}

const statusFilter = ref('')
const typeFilter = ref('')
const loading = ref(false)
const showViewerModal = ref(false)
const selectedDocument = ref<Document | null>(null)
const verificationRemarks = ref('')

const stats = ref({
  totalDocuments: '5,247',
  pendingReview: '892',
  verified: '4,156',
  flagged: '199'
})

const statusOptions = ['Pending', 'Approved', 'Rejected', 'Flagged']
const documentTypes = ['Life Certificate', 'Aadhaar Card', 'Bank Passbook', 'Photo ID', 'Address Proof']

const columns = [
  { key: 'thumbnail', label: 'Preview', width: '80px' },
  { key: 'pensionId', label: 'Pension ID' },
  { key: 'pensionerName', label: 'Pensioner Name' },
  { key: 'type', label: 'Document Type' },
  { key: 'status', label: 'Status' },
  { key: 'uploadedDate', label: 'Uploaded' },
  { key: 'fileSize', label: 'Size' },
  { key: 'actions', label: 'Actions', width: '150px' }
]

const documents = ref<Document[]>([
  {
    id: '1',
    pensionId: 'UP2024001234',
    pensionerName: 'राम कुमार शर्मा',
    type: 'Life Certificate',
    status: 'Pending',
    uploadedDate: '2024-01-20T10:30:00Z',
    fileSize: '2.4 MB',
    thumbnail: '/api/placeholder/60/60',
    fullImage: '/api/placeholder/400/600',
    ocrText: 'LIFE CERTIFICATE\n\nThis is to certify that Shri Ram Kumar Sharma...',
  },
  {
    id: '2',
    pensionId: 'UP2024001235',
    pensionerName: 'सुनीता देवी',
    type: 'Aadhaar Card',
    status: 'Approved',
    uploadedDate: '2024-01-19T14:15:00Z',
    fileSize: '1.8 MB',
    thumbnail: '/api/placeholder/60/60',
    fullImage: '/api/placeholder/400/600',
    verifiedBy: 'Admin User',
    verificationDate: '2024-01-20T09:00:00Z',
    remarks: 'Document verified successfully'
  }
])

const getStatusColor = (status: string) => {
  const colors = {
    'Pending': 'warning',
    'Approved': 'success',
    'Rejected': 'danger',
    'Flagged': 'danger'
  }
  return colors[status as keyof typeof colors] || 'secondary'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN')
}

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}d ago`
}

const viewDocument = (document: Document) => {
  selectedDocument.value = document
  verificationRemarks.value = document.remarks || ''
  showViewerModal.value = true
}

const approveDocument = (document: Document) => {
  document.status = 'Approved'
  document.verifiedBy = 'Current Admin'
  document.verificationDate = new Date().toISOString()
  document.remarks = verificationRemarks.value
  console.log('Approved document:', document.id)
  showViewerModal.value = false
}

const rejectDocument = (document: Document) => {
  document.status = 'Rejected'
  document.verifiedBy = 'Current Admin'
  document.verificationDate = new Date().toISOString()
  document.remarks = verificationRemarks.value
  console.log('Rejected document:', document.id)
  showViewerModal.value = false
}

const downloadDocument = (document: Document) => {
  console.log('Downloading document:', document.id)
}

onMounted(() => {
  // Load initial data
})
</script>
