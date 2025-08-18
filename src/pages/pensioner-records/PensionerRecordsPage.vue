<template>

  
  <div class="flex flex-col gap-4">
    <!-- Quick Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="people" size="2xl" color="primary" />
          <h3 class="text-2xl font-bold mt-2">{{ stats.totalPensioners }}</h3>
          <p class="text-secondary">Total Registered</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="verified" size="2xl" color="success" />
          <h3 class="text-2xl font-bold mt-2">{{ stats.verifiedThisYear }}</h3>
          <p class="text-secondary">Verified This Year</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="schedule" size="2xl" color="warning" />
          <h3 class="text-2xl font-bold mt-2">{{ stats.pendingVerification }}</h3>
          <p class="text-secondary">Pending Verification</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="flag" size="2xl" color="danger" />
          <h3 class="text-2xl font-bold mt-2">{{ stats.flaggedProfiles }}</h3>
          <p class="text-secondary">Flagged Profiles</p>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Search and Filter Section -->
    <VaCard>
      <VaCardContent class="flex flex-col sm:flex-row gap-4 items-end">
        <VaInput
          v-model="searchQuery"
          placeholder="Search by Pension ID, Name, Aadhaar, Mobile"
          class="flex-1"
          clearable
        >
          <template #prependInner>
            <VaIcon name="search" />
          </template>
        </VaInput>
        
        <VaSelect
          v-model="statusFilter"
          :options="statusOptions"
          placeholder="Filter by Status"
          class="w-48"
          clearable
        />
        
        <VaSelect
          v-model="districtFilter"
          :options="districtOptions"
          placeholder="Filter by District"
          class="w-48"
          clearable
        />
        
        <VaButton @click="searchPensioners" preset="primary">
          Search
        </VaButton>
        
        <VaButton @click="addNewPensioner" preset="secondary">
          Add New Pensioner
        </VaButton>
        
        <VaButton @click="bulkUpload" preset="plain" icon="cloud_upload">
          Bulk Upload
        </VaButton>
      </VaCardContent>
    </VaCard>

    <!-- Pensioners Table -->
    <VaCard>
      <VaCardTitle>
        <h2 class="text-xl font-semibold">Pensioner Database</h2>
        <div class="text-sm text-secondary">
          Total: {{ filteredPensioners.length }} records | Showing: {{ Math.min(filteredPensioners.length, 50) }}
        </div>
      </VaCardTitle>
      
      <VaCardContent>
        <VaDataTable
          :items="paginatedPensioners"
          :columns="columns"
          :loading="loading"
          striped
          hoverable
        >
          <template #cell(photo)="{ rowData }">
            <VaAvatar :src="rowData.photo" size="small" />
          </template>
          
          <template #cell(verificationStatus)="{ rowData }">
            <VaBadge
              :text="rowData.verificationStatus"
              :color="getStatusColor(rowData.verificationStatus)"
            />
          </template>
          
          <template #cell(lastVerification)="{ rowData }">
            <div>
              <div :class="getVerificationClass(rowData.lastVerification)">
                {{ formatDate(rowData.lastVerification) }}
              </div>
              <div class="text-xs text-secondary">
                {{ rowData.verificationMode }}
              </div>
            </div>
          </template>
          
          <template #cell(actions)="{ rowData }">
            <div class="flex gap-2">
              <VaButton
                preset="plain"
                icon="visibility"
                @click="viewPensioner(rowData)"
                aria-label="View Profile"
                size="small"
              />
              <VaButton
                preset="plain"
                icon="edit"
                @click="editPensioner(rowData)"
                aria-label="Edit"
                size="small"
              />
              <VaButton
                preset="plain"
                icon="verified"
                @click="verifyPensioner(rowData)"
                aria-label="Verify"
                size="small"
                :disabled="rowData.verificationStatus === 'Verified'"
              />
              <VaButton
                preset="plain"
                icon="flag"
                @click="flagPensioner(rowData)"
                aria-label="Flag Profile"
                size="small"
                color="danger"
              />
            </div>
          </template>
        </VaDataTable>
        
        <!-- Pagination -->
        <div class="flex justify-between items-center mt-4">
          <div class="text-sm text-secondary">
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredPensioners.length) }} of {{ filteredPensioners.length }} entries
          </div>
          <VaPagination
            v-model="currentPage"
            :pages="totalPages"
            :visible-pages="5"
          />
        </div>
      </VaCardContent>
    </VaCard>
  </div>

  <!-- Add/Edit Pensioner Modal -->
  <VaModal
    v-model="showModal"
    :title="editingPensioner ? 'Edit Pensioner Profile' : 'Add New Pensioner'"
    size="large"
    :ok-text="editingPensioner ? 'Update' : 'Add'"
    @ok="savePensioner"
    @cancel="closeModal"
  >
    <VaForm ref="form" class="flex flex-col gap-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VaInput
          v-model="currentPensioner.pensionId"
          label="Pension ID"
          :rules="[required]"
        />
        
        <VaInput
          v-model="currentPensioner.name"
          label="Full Name"
          :rules="[required]"
        />
        
        <VaInput
          v-model="currentPensioner.aadhaarNumber"
          label="Aadhaar Number"
          :rules="[required, aadhaarValidation]"
        />
        
        <VaDateInput
          v-model="currentPensioner.dateOfBirth"
          label="Date of Birth"
          :rules="[required]"
        />
        
        <VaInput
          v-model="currentPensioner.mobileNumber"
          label="Mobile Number"
          :rules="[required, mobileValidation]"
        />
        
        <VaSelect
          v-model="currentPensioner.pensionType"
          :options="pensionTypes"
          label="Pension Type"
          :rules="[required]"
        />
        
        <VaInput
          v-model="currentPensioner.monthlyAmount"
          label="Monthly Pension Amount"
          type="number"
          :rules="[required]"
        />
        
        <VaSelect
          v-model="currentPensioner.bankName"
          :options="bankOptions"
          label="Bank Name"
          :rules="[required]"
        />
        
        <VaInput
          v-model="currentPensioner.accountNumber"
          label="Bank Account Number"
          :rules="[required]"
        />
        
        <VaSelect
          v-model="currentPensioner.district"
          :options="districtOptions"
          label="District"
          :rules="[required]"
        />
      </div>
      
      <VaTextarea
        v-model="currentPensioner.address"
        label="Complete Address"
        :rules="[required]"
      />
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VaFileUpload
          v-model="currentPensioner.photoFile"
          type="single"
          file-types="image/*"
          dropzone
        >
          Upload Photo
        </VaFileUpload>
        
        <VaFileUpload
          v-model="currentPensioner.documentsFile"
          type="gallery"
          file-types="image/*,.pdf"
          dropzone
        >
          Upload Documents
        </VaFileUpload>
      </div>
    </VaForm>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  VaCard, VaCardContent, VaCardTitle, VaInput, VaSelect, VaButton, 
  VaDataTable, VaBadge, VaModal, VaForm, VaDateInput, VaTextarea, 
  VaIcon, VaAvatar, VaPagination, VaFileUpload 
} from 'vuestic-ui'

interface Pensioner {
  id: string
  pensionId: string
  name: string
  aadhaarNumber: string
  dateOfBirth: string
  mobileNumber: string
  pensionType: string
  monthlyAmount: number
  bankName: string
  accountNumber: string
  district: string
  address: string
  photo: string
  verificationStatus: 'Verified' | 'Pending' | 'Expired' | 'Flagged'
  lastVerification: string
  verificationMode: 'Online' | 'Offline'
  photoFile?: File[]
  documentsFile?: File[]
}

const searchQuery = ref('')
const statusFilter = ref('')
const districtFilter = ref('')
const loading = ref(false)
const showModal = ref(false)
const editingPensioner = ref(false)
const currentPage = ref(1)
const pageSize = ref(50)

const stats = ref({
  totalPensioners: '2,45,847',
  verifiedThisYear: '1,89,234',
  pendingVerification: '56,613',
  flaggedProfiles: '23'
})

const statusOptions = ['Verified', 'Pending', 'Expired', 'Flagged']
const districtOptions = ['Meerut', 'Noida', 'Ghaziabad', 'Lucknow', 'Kanpur', 'Agra', 'Varanasi']
const pensionTypes = ['Family Pension', 'Service Pension', 'Disability Pension', 'Old Age Pension']
const bankOptions = ['SBI', 'PNB', 'BOI', 'Canara Bank', 'Union Bank', 'HDFC', 'ICICI', 'Axis Bank']

const currentPensioner = ref<Pensioner>({
  id: '',
  pensionId: '',
  name: '',
  aadhaarNumber: '',
  dateOfBirth: '',
  mobileNumber: '',
  pensionType: '',
  monthlyAmount: 0,
  bankName: '',
  accountNumber: '',
  district: '',
  address: '',
  photo: '/api/placeholder/40/40',
  verificationStatus: 'Pending',
  lastVerification: '',
  verificationMode: 'Online'
})

const pensioners = ref<Pensioner[]>([
  {
    id: '1',
    pensionId: 'UP2024001234',
    name: 'राम कुमार शर्मा',
    aadhaarNumber: '1234-5678-9012',
    dateOfBirth: '1955-03-15',
    mobileNumber: '9876543210',
    pensionType: 'Service Pension',
    monthlyAmount: 15000,
    bankName: 'SBI',
    accountNumber: '12345678901',
    district: 'Meerut',
    address: 'Village Rampur, Tehsil Meerut, District Meerut, UP - 250001',
    photo: '/api/placeholder/40/40',
    verificationStatus: 'Verified',
    lastVerification: '2024-01-15',
    verificationMode: 'Online'
  },
  {
    id: '2',
    pensionId: 'UP2024001235',
    name: 'सुनीता देवी',
    aadhaarNumber: '2345-6789-0123',
    dateOfBirth: '1960-07-22',
    mobileNumber: '9876543211',
    pensionType: 'Family Pension',
    monthlyAmount: 12000,
    bankName: 'PNB',
    accountNumber: '23456789012',
    district: 'Noida',
    address: 'Sector 15, Noida, Gautam Buddha Nagar, UP - 201301',
    photo: '/api/placeholder/40/40',
    verificationStatus: 'Pending',
    lastVerification: '2023-11-20',
    verificationMode: 'Offline'
  }
])

const columns = [
  { key: 'photo', label: 'Photo', width: '60px' },
  { key: 'pensionId', label: 'Pension ID' },
  { key: 'name', label: 'Name' },
  { key: 'mobileNumber', label: 'Mobile' },
  { key: 'district', label: 'District' },
  { key: 'pensionType', label: 'Type' },
  { key: 'monthlyAmount', label: 'Amount' },
  { key: 'verificationStatus', label: 'Status' },
  { key: 'lastVerification', label: 'Last Verification' },
  { key: 'actions', label: 'Actions', width: '180px' }
]

const filteredPensioners = computed(() => {
  let filtered = pensioners.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.pensionId.toLowerCase().includes(query) ||
      p.name.toLowerCase().includes(query) ||
      p.aadhaarNumber.includes(query) ||
      p.mobileNumber.includes(query)
    )
  }
  
  if (statusFilter.value) {
    filtered = filtered.filter(p => p.verificationStatus === statusFilter.value)
  }
  
  if (districtFilter.value) {
    filtered = filtered.filter(p => p.district === districtFilter.value)
  }
  
  return filtered
})

const totalPages = computed(() => Math.ceil(filteredPensioners.value.length / pageSize.value))

const paginatedPensioners = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredPensioners.value.slice(start, end)
})

const getStatusColor = (status: string) => {
  const colors = {
    'Verified': 'success',
    'Pending': 'warning',
    'Expired': 'danger',
    'Flagged': 'danger'
  }
  return colors[status as keyof typeof colors] || 'secondary'
}

const getVerificationClass = (date: string) => {
  const verificationDate = new Date(date)
  const now = new Date()
  const daysDiff = Math.floor((now.getTime() - verificationDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff > 365) return 'text-danger font-semibold'
  if (daysDiff > 300) return 'text-warning'
  return 'text-success'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN')
}

const required = (value: any) => !!value || 'This field is required'
const aadhaarValidation = (value: string) => {
  const aadhaarRegex = /^\d{4}-\d{4}-\d{4}$/
  return aadhaarRegex.test(value) || 'Invalid Aadhaar format (XXXX-XXXX-XXXX)'
}
const mobileValidation = (value: string) => {
  const mobileRegex = /^[6-9]\d{9}$/
  return mobileRegex.test(value) || 'Invalid mobile number'
}

const searchPensioners = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const addNewPensioner = () => {
  editingPensioner.value = false
  currentPensioner.value = {
    id: '',
    pensionId: '',
    name: '',
    aadhaarNumber: '',
    dateOfBirth: '',
    mobileNumber: '',
    pensionType: '',
    monthlyAmount: 0,
    bankName: '',
    accountNumber: '',
    district: '',
    address: '',
    photo: '/api/placeholder/40/40',
    verificationStatus: 'Pending',
    lastVerification: '',
    verificationMode: 'Online'
  }
  showModal.value = true
}

const viewPensioner = (pensioner: Pensioner) => {
  console.log('View pensioner:', pensioner)
}

const editPensioner = (pensioner: Pensioner) => {
  editingPensioner.value = true
  currentPensioner.value = { ...pensioner }
  showModal.value = true
}

const verifyPensioner = (pensioner: Pensioner) => {
  console.log('Verify pensioner:', pensioner)
}

const flagPensioner = (pensioner: Pensioner) => {
  console.log('Flag pensioner:', pensioner)
}

const bulkUpload = () => {
  console.log('Bulk upload pensioners')
}

const savePensioner = () => {
  if (editingPensioner.value) {
    const index = pensioners.value.findIndex(p => p.id === currentPensioner.value.id)
    if (index !== -1) {
      pensioners.value[index] = { ...currentPensioner.value }
    }
  } else {
    currentPensioner.value.id = Date.now().toString()
    pensioners.value.push({ ...currentPensioner.value })
  }
  closeModal()
}

const closeModal = () => {
  showModal.value = false
}

onMounted(() => {
  // Load initial data
})
</script>
