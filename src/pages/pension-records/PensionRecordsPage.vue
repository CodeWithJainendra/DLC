<template>
  <div class="flex flex-col gap-4">
    <!-- Search and Filter Section -->
    <VaCard>
      <VaCardContent class="flex flex-col sm:flex-row gap-4 items-end">
        <VaInput
          v-model="searchQuery"
          placeholder="Search by Pension Number, Name, or Aadhaar"
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

        <VaButton preset="primary" @click="searchPensioners"> Search </VaButton>

        <VaButton preset="secondary" @click="addNewPensioner"> Add New Pensioner </VaButton>
      </VaCardContent>
    </VaCard>

    <!-- Pensioners Table -->
    <VaCard>
      <VaCardTitle>
        <h2 class="text-xl font-semibold">Pensioner Records</h2>
        <div class="text-sm text-secondary">Total: {{ pensioners.length }} records</div>
      </VaCardTitle>

      <VaCardContent>
        <VaDataTable :items="filteredPensioners" :columns="columns" :loading="loading" striped hoverable>
          <template #cell(status)="{ rowData }">
            <VaBadge :text="rowData.status" :color="getStatusColor(rowData.status)" />
          </template>

          <template #cell(lastVerification)="{ rowData }">
            <span :class="getVerificationClass(rowData.lastVerification)">
              {{ formatDate(rowData.lastVerification) }}
            </span>
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="flex gap-2">
              <VaButton preset="plain" icon="visibility" aria-label="View Details" @click="viewPensioner(rowData)" />
              <VaButton preset="plain" icon="edit" aria-label="Edit" @click="editPensioner(rowData)" />
              <VaButton
                preset="plain"
                icon="verified"
                aria-label="Verify"
                :disabled="rowData.status === 'Verified'"
                @click="verifyPensioner(rowData)"
              />
            </div>
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>
  </div>

  <!-- Add/Edit Pensioner Modal -->
  <VaModal
    v-model="showModal"
    title="Pensioner Details"
    size="large"
    :ok-text="editingPensioner ? 'Update' : 'Add'"
    @ok="savePensioner"
    @cancel="closeModal"
  >
    <VaForm ref="form" class="flex flex-col gap-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VaInput v-model="currentPensioner.pensionNumber" label="Pension Number" :rules="[required]" />

        <VaInput v-model="currentPensioner.name" label="Full Name" :rules="[required]" />

        <VaInput
          v-model="currentPensioner.aadhaarNumber"
          label="Aadhaar Number"
          :rules="[required, aadhaarValidation]"
        />

        <VaDateInput v-model="currentPensioner.dateOfBirth" label="Date of Birth" :rules="[required]" />

        <VaInput v-model="currentPensioner.mobileNumber" label="Mobile Number" :rules="[required, mobileValidation]" />

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

        <VaSelect v-model="currentPensioner.bankName" :options="bankOptions" label="Bank Name" :rules="[required]" />
      </div>

      <VaTextarea v-model="currentPensioner.address" label="Address" :rules="[required]" />
    </VaForm>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  VaCard,
  VaCardContent,
  VaCardTitle,
  VaInput,
  VaSelect,
  VaButton,
  VaDataTable,
  VaBadge,
  VaModal,
  VaForm,
  VaDateInput,
  VaTextarea,
  VaIcon,
} from 'vuestic-ui'

interface Pensioner {
  id: string
  pensionNumber: string
  name: string
  aadhaarNumber: string
  dateOfBirth: string
  mobileNumber: string
  pensionType: string
  monthlyAmount: number
  bankName: string
  address: string
  status: 'Active' | 'Pending' | 'Verified' | 'Suspended'
  lastVerification: string
}

const searchQuery = ref('')
const statusFilter = ref('')
const loading = ref(false)
const showModal = ref(false)
const editingPensioner = ref(false)

const statusOptions = ['Active', 'Pending', 'Verified', 'Suspended']
const pensionTypes = ['Family Pension', 'Service Pension', 'Disability Pension', 'Old Age Pension']
const bankOptions = ['SBI', 'PNB', 'BOI', 'Canara Bank', 'Union Bank', 'HDFC', 'ICICI', 'Axis Bank']

const currentPensioner = ref<Pensioner>({
  id: '',
  pensionNumber: '',
  name: '',
  aadhaarNumber: '',
  dateOfBirth: '',
  mobileNumber: '',
  pensionType: '',
  monthlyAmount: 0,
  bankName: '',
  address: '',
  status: 'Pending',
  lastVerification: '',
})

const pensioners = ref<Pensioner[]>([
  {
    id: '1',
    pensionNumber: 'PEN001234',
    name: 'राम कुमार शर्मा',
    aadhaarNumber: '1234-5678-9012',
    dateOfBirth: '1955-03-15',
    mobileNumber: '9876543210',
    pensionType: 'Service Pension',
    monthlyAmount: 15000,
    bankName: 'SBI',
    address: 'Village Rampur, District Meerut, UP',
    status: 'Active',
    lastVerification: '2024-01-15',
  },
  {
    id: '2',
    pensionNumber: 'PEN001235',
    name: 'सुनीता देवी',
    aadhaarNumber: '2345-6789-0123',
    dateOfBirth: '1960-07-22',
    mobileNumber: '9876543211',
    pensionType: 'Family Pension',
    monthlyAmount: 12000,
    bankName: 'PNB',
    address: 'Sector 15, Noida, UP',
    status: 'Pending',
    lastVerification: '2023-11-20',
  },
])

const columns = [
  { key: 'pensionNumber', label: 'Pension Number' },
  { key: 'name', label: 'Name' },
  { key: 'pensionType', label: 'Type' },
  { key: 'monthlyAmount', label: 'Amount' },
  { key: 'status', label: 'Status' },
  { key: 'lastVerification', label: 'Last Verification' },
  { key: 'actions', label: 'Actions', width: '120px' },
]

const filteredPensioners = computed(() => {
  let filtered = pensioners.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.pensionNumber.toLowerCase().includes(query) ||
        p.name.toLowerCase().includes(query) ||
        p.aadhaarNumber.includes(query),
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter((p) => p.status === statusFilter.value)
  }

  return filtered
})

const getStatusColor = (status: string) => {
  const colors = {
    Active: 'success',
    Verified: 'info',
    Pending: 'warning',
    Suspended: 'danger',
  }
  return colors[status as keyof typeof colors] || 'secondary'
}

const getVerificationClass = (date: string) => {
  const verificationDate = new Date(date)
  const now = new Date()
  const daysDiff = Math.floor((now.getTime() - verificationDate.getTime()) / (1000 * 60 * 60 * 24))

  if (daysDiff > 365) return 'text-danger'
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
  // Simulate API call
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const addNewPensioner = () => {
  editingPensioner.value = false
  currentPensioner.value = {
    id: '',
    pensionNumber: '',
    name: '',
    aadhaarNumber: '',
    dateOfBirth: '',
    mobileNumber: '',
    pensionType: '',
    monthlyAmount: 0,
    bankName: '',
    address: '',
    status: 'Pending',
    lastVerification: '',
  }
  showModal.value = true
}

const viewPensioner = (pensioner: Pensioner) => {
  // Navigate to detailed view
  console.log('View pensioner:', pensioner)
}

const editPensioner = (pensioner: Pensioner) => {
  editingPensioner.value = true
  currentPensioner.value = { ...pensioner }
  showModal.value = true
}

const verifyPensioner = (pensioner: Pensioner) => {
  // Open verification process
  console.log('Verify pensioner:', pensioner)
}

const savePensioner = () => {
  if (editingPensioner.value) {
    const index = pensioners.value.findIndex((p) => p.id === currentPensioner.value.id)
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
