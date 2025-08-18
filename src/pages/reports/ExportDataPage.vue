<template>
  <div class="flex flex-col gap-4">
    <!-- Export Options -->
    <VaCard>
      <VaCardTitle>
        <h2 class="text-xl font-semibold">Export Configuration</h2>
      </VaCardTitle>
      <VaCardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-semibold mb-3">Data Selection</h4>
            <div class="space-y-3">
              <VaSelect v-model="exportConfig.dataType" :options="dataTypes" label="Data Type" />

              <VaDateInput v-model="exportConfig.dateRange.start" label="From Date" />

              <VaDateInput v-model="exportConfig.dateRange.end" label="To Date" />

              <VaSelect v-model="exportConfig.district" :options="districtOptions" label="District Filter" clearable />
            </div>
          </div>

          <div>
            <h4 class="font-semibold mb-3">Export Format</h4>
            <div class="space-y-3">
              <VaSelect v-model="exportConfig.format" :options="formatOptions" label="File Format" />

              <VaCheckbox v-model="exportConfig.includePhotos" label="Include Photos" />

              <VaCheckbox v-model="exportConfig.includeDocuments" label="Include Documents" />

              <VaCheckbox v-model="exportConfig.compressFiles" label="Compress Files (ZIP)" />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <VaButton preset="secondary" @click="showPreviewModal = true"> Preview Data </VaButton>
          <VaButton preset="primary" @click="startExport"> Start Export </VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Export History -->
    <VaCard>
      <VaCardTitle>
        <h2 class="text-xl font-semibold">Export History</h2>
      </VaCardTitle>
      <VaCardContent>
        <VaDataTable :items="exportHistory" :columns="historyColumns" striped hoverable>
          <template #cell(status)="{ rowData }">
            <VaBadge :text="rowData.status" :color="getStatusColor(rowData.status)" />
          </template>

          <template #cell(progress)="{ rowData }">
            <div v-if="rowData.status === 'In Progress'" class="flex items-center gap-2">
              <VaProgressBar :model-value="rowData.progress" size="small" color="primary" />
              <span class="text-sm">{{ rowData.progress }}%</span>
            </div>
            <span v-else>-</span>
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="flex gap-2">
              <VaButton
                v-if="rowData.status === 'Completed'"
                preset="plain"
                icon="download"
                aria-label="Download"
                size="small"
                @click="downloadExport(rowData)"
              />
              <VaButton
                v-if="rowData.status === 'In Progress'"
                preset="plain"
                icon="cancel"
                aria-label="Cancel"
                size="small"
                color="danger"
                @click="cancelExport(rowData)"
              />
              <VaButton
                preset="plain"
                icon="delete"
                aria-label="Delete"
                size="small"
                color="danger"
                @click="deleteExport(rowData)"
              />
            </div>
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>
  </div>

  <!-- Preview Modal -->
  <VaModal v-model="showPreviewModal" title="Data Preview" size="large" hide-default-actions>
    <div class="flex flex-col gap-4">
      <div class="text-sm text-secondary">Preview of {{ previewData.length }} records (showing first 10)</div>

      <VaDataTable :items="previewData.slice(0, 10)" :columns="previewColumns" striped />

      <div class="flex justify-end gap-2 pt-4 border-t">
        <VaButton @click="showPreviewModal = false">Close</VaButton>
        <VaButton preset="primary" @click="confirmExport">Proceed with Export</VaButton>
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
  VaSelect,
  VaDateInput,
  VaCheckbox,
  VaButton,
  VaDataTable,
  VaBadge,
  VaModal,
  VaProgressBar,
} from 'vuestic-ui'

interface ExportConfig {
  dataType: string
  dateRange: {
    start: Date
    end: Date
  }
  district: string
  format: string
  includePhotos: boolean
  includeDocuments: boolean
  compressFiles: boolean
}

interface ExportRecord {
  id: string
  dataType: string
  format: string
  recordCount: number
  fileSize: string
  status: 'In Progress' | 'Completed' | 'Failed' | 'Cancelled'
  progress: number
  createdDate: string
  completedDate?: string
  downloadUrl?: string
}

const showPreviewModal = ref(false)

const exportConfig = ref<ExportConfig>({
  dataType: 'All Pensioners',
  dateRange: {
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date(),
  },
  district: '',
  format: 'Excel (.xlsx)',
  includePhotos: false,
  includeDocuments: false,
  compressFiles: true,
})

const dataTypes = [
  'All Pensioners',
  'Verified Pensioners',
  'Pending Verifications',
  'Verification History',
  'Offline Verifiers',
  'Document Records',
]

const districtOptions = ['Meerut', 'Noida', 'Ghaziabad', 'Lucknow', 'Kanpur', 'Agra']

const formatOptions = ['Excel (.xlsx)', 'CSV (.csv)', 'PDF Report', 'JSON (.json)']

const historyColumns = [
  { key: 'dataType', label: 'Data Type' },
  { key: 'format', label: 'Format' },
  { key: 'recordCount', label: 'Records' },
  { key: 'fileSize', label: 'File Size' },
  { key: 'status', label: 'Status' },
  { key: 'progress', label: 'Progress' },
  { key: 'createdDate', label: 'Created' },
  { key: 'actions', label: 'Actions', width: '120px' },
]

const previewColumns = [
  { key: 'pensionId', label: 'Pension ID' },
  { key: 'name', label: 'Name' },
  { key: 'district', label: 'District' },
  { key: 'status', label: 'Status' },
  { key: 'lastVerification', label: 'Last Verification' },
]

const exportHistory = ref<ExportRecord[]>([
  {
    id: '1',
    dataType: 'All Pensioners',
    format: 'Excel (.xlsx)',
    recordCount: 25847,
    fileSize: '45.2 MB',
    status: 'Completed',
    progress: 100,
    createdDate: '2024-01-20T10:30:00Z',
    completedDate: '2024-01-20T10:45:00Z',
    downloadUrl: '/exports/pensioners_20240120.xlsx',
  },
  {
    id: '2',
    dataType: 'Verification History',
    format: 'CSV (.csv)',
    recordCount: 156789,
    fileSize: '89.7 MB',
    status: 'In Progress',
    progress: 67,
    createdDate: '2024-01-20T11:00:00Z',
  },
])

const previewData = ref([
  {
    pensionId: 'UP2024001234',
    name: 'राम कुमार शर्मा',
    district: 'Meerut',
    status: 'Verified',
    lastVerification: '2024-01-15',
  },
  {
    pensionId: 'UP2024001235',
    name: 'सुनीता देवी',
    district: 'Noida',
    status: 'Pending',
    lastVerification: '2023-11-20',
  },
])

const getStatusColor = (status: string) => {
  const colors = {
    'In Progress': 'info',
    Completed: 'success',
    Failed: 'danger',
    Cancelled: 'warning',
  }
  return colors[status as keyof typeof colors] || 'secondary'
}

// const previewData_func = () => {
//   showPreviewModal.value = true
// }

const startExport = () => {
  const newExport: ExportRecord = {
    id: Date.now().toString(),
    dataType: exportConfig.value.dataType,
    format: exportConfig.value.format,
    recordCount: Math.floor(Math.random() * 50000) + 10000,
    fileSize: '0 MB',
    status: 'In Progress',
    progress: 0,
    createdDate: new Date().toISOString(),
  }

  exportHistory.value.unshift(newExport)

  // Simulate progress
  const progressInterval = setInterval(() => {
    newExport.progress += Math.floor(Math.random() * 15) + 5
    if (newExport.progress >= 100) {
      newExport.progress = 100
      newExport.status = 'Completed'
      newExport.completedDate = new Date().toISOString()
      newExport.fileSize = `${Math.floor(Math.random() * 100) + 10}.${Math.floor(Math.random() * 9)} MB`
      newExport.downloadUrl = `/exports/export_${newExport.id}.${
        exportConfig.value.format.includes('xlsx') ? 'xlsx' : 'csv'
      }`
      clearInterval(progressInterval)
    }
  }, 1000)
}

const confirmExport = () => {
  showPreviewModal.value = false
  startExport()
}

const downloadExport = (exportRecord: ExportRecord) => {
  console.log('Downloading export:', exportRecord.id)
}

const cancelExport = (exportRecord: ExportRecord) => {
  exportRecord.status = 'Cancelled'
  console.log('Cancelled export:', exportRecord.id)
}

const deleteExport = (exportRecord: ExportRecord) => {
  const index = exportHistory.value.findIndex((e) => e.id === exportRecord.id)
  if (index !== -1) {
    exportHistory.value.splice(index, 1)
  }
}

onMounted(() => {
  // Load export history
})
</script>
