<template>

  
  <div class="flex flex-col gap-4">
    <!-- Quick Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="business" size="2xl" color="primary" />
          <h3 class="text-2xl font-bold mt-2">{{ stats.totalVerifiers }}</h3>
          <p class="text-secondary">Total Verifiers</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="account_balance" size="2xl" color="success" />
          <h3 class="text-2xl font-bold mt-2">{{ stats.banks }}</h3>
          <p class="text-secondary">Bank Branches</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="credit_card" size="2xl" color="info" />
          <h3 class="text-2xl font-bold mt-2">{{ stats.aadhaarCenters }}</h3>
          <p class="text-secondary">Aadhaar Centers</p>
        </VaCardContent>
      </VaCard>
      
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="people" size="2xl" color="warning" />
          <h3 class="text-2xl font-bold mt-2">{{ stats.fieldOfficers }}</h3>
          <p class="text-secondary">Field Officers</p>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Search and Filter -->
    <VaCard>
      <VaCardContent class="flex flex-col sm:flex-row gap-4 items-end">
        <VaInput
          v-model="searchQuery"
          placeholder="Search by name, organization, or ID"
          class="flex-1"
          clearable
        >
          <template #prependInner>
            <VaIcon name="search" />
          </template>
        </VaInput>
        
        <VaSelect
          v-model="typeFilter"
          :options="verifierTypes"
          placeholder="Filter by Type"
          class="w-48"
          clearable
        />
        
        <VaSelect
          v-model="statusFilter"
          :options="statusOptions"
          placeholder="Filter by Status"
          class="w-40"
          clearable
        />
        
        <VaSelect
          v-model="districtFilter"
          :options="districtOptions"
          placeholder="Filter by District"
          class="w-48"
          clearable
        />
        
        <VaButton @click="addNewVerifier" preset="primary">
          Add New Verifier
        </VaButton>
      </VaCardContent>
    </VaCard>

    <!-- Verifiers Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <VaCard 
        v-for="verifier in filteredVerifiers" 
        :key="verifier.id"
        class="hover:shadow-lg transition-shadow"
      >
        <VaCardContent>
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <VaAvatar :src="verifier.avatar" size="large" />
              <div>
                <h3 class="font-semibold">{{ verifier.name }}</h3>
                <p class="text-sm text-secondary">ID: {{ verifier.id }}</p>
                <VaBadge
                  :text="verifier.type"
                  :color="getTypeColor(verifier.type)"
                  outline
                  class="mt-1"
                />
              </div>
            </div>
            <VaBadge
              :text="verifier.status"
              :color="getStatusColor(verifier.status)"
            />
          </div>
          
          <div class="space-y-2 mb-4">
            <div class="flex items-center gap-2">
              <VaIcon name="business" size="small" />
              <span class="text-sm">{{ verifier.organization }}</span>
            </div>
            <div class="flex items-center gap-2">
              <VaIcon name="location_on" size="small" />
              <span class="text-sm">{{ verifier.location }}, {{ verifier.district }}</span>
            </div>
            <div class="flex items-center gap-2">
              <VaIcon name="phone" size="small" />
              <span class="text-sm">{{ verifier.phone }}</span>
            </div>
            <div class="flex items-center gap-2">
              <VaIcon name="email" size="small" />
              <span class="text-sm">{{ verifier.email }}</span>
            </div>
          </div>
          
          <div class="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded">
            <div class="text-center">
              <div class="text-lg font-semibold text-success">{{ verifier.totalVerifications }}</div>
              <div class="text-xs text-secondary">Total</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-semibold text-primary">{{ verifier.thisMonthVerifications }}</div>
              <div class="text-xs text-secondary">This Month</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-semibold text-warning">{{ verifier.pendingVerifications }}</div>
              <div class="text-xs text-secondary">Pending</div>
            </div>
          </div>
          
          <div class="flex gap-2">
            <VaButton
              preset="plain"
              icon="visibility"
              @click="viewVerifier(verifier)"
              aria-label="View Details"
              size="small"
            />
            <VaButton
              preset="plain"
              icon="edit"
              @click="editVerifier(verifier)"
              aria-label="Edit"
              size="small"
            />
            <VaButton
              preset="plain"
              icon="assignment"
              @click="viewVerifications(verifier)"
              aria-label="View Verifications"
              size="small"
            />
            <VaButton
              preset="plain"
              :icon="verifier.status === 'Active' ? 'pause' : 'play_arrow'"
              @click="toggleVerifierStatus(verifier)"
              :aria-label="verifier.status === 'Active' ? 'Deactivate' : 'Activate'"
              size="small"
            />
          </div>
        </VaCardContent>
      </VaCard>
    </div>
  </div>

  <!-- Add/Edit Verifier Modal -->
  <VaModal
    v-model="showModal"
    :title="editingVerifier ? 'Edit Verifier' : 'Add New Verifier'"
    size="large"
    :ok-text="editingVerifier ? 'Update' : 'Add'"
    @ok="saveVerifier"
    @cancel="closeModal"
  >
    <VaForm ref="form" class="flex flex-col gap-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VaInput
          v-model="currentVerifier.name"
          label="Full Name"
          :rules="[required]"
        />
        
        <VaSelect
          v-model="currentVerifier.type"
          :options="verifierTypes"
          label="Verifier Type"
          :rules="[required]"
        />
        
        <VaInput
          v-model="currentVerifier.organization"
          label="Organization Name"
          :rules="[required]"
        />
        
        <VaInput
          v-model="currentVerifier.phone"
          label="Phone Number"
          :rules="[required, phoneValidation]"
        />
        
        <VaInput
          v-model="currentVerifier.email"
          label="Email Address"
          type="email"
          :rules="[required, emailValidation]"
        />
        
        <VaSelect
          v-model="currentVerifier.district"
          :options="districtOptions"
          label="District"
          :rules="[required]"
        />
        
        <VaInput
          v-model="currentVerifier.location"
          label="Location/Branch"
          :rules="[required]"
        />
        
        <VaInput
          v-model="currentVerifier.licenseNumber"
          label="License/Registration Number"
          :rules="[required]"
        />
      </div>
      
      <VaTextarea
        v-model="currentVerifier.address"
        label="Complete Address"
        :rules="[required]"
      />
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VaCheckbox
          v-model="currentVerifier.canVerifyLifeCertificate"
          label="Can Verify Life Certificates"
        />
        
        <VaCheckbox
          v-model="currentVerifier.canVerifyDocuments"
          label="Can Verify Documents"
        />
        
        <VaCheckbox
          v-model="currentVerifier.canProcessBiometric"
          label="Can Process Biometric Verification"
        />
        
        <VaCheckbox
          v-model="currentVerifier.canIssueDigitalCertificate"
          label="Can Issue Digital Certificates"
        />
      </div>
    </VaForm>
  </VaModal>

  <!-- Verifier Details Modal -->
  <VaModal
    v-model="showDetailsModal"
    title="Verifier Details"
    size="large"
    hide-default-actions
  >
    <div v-if="selectedVerifier" class="flex flex-col gap-4">
      <div class="flex items-center gap-4 mb-4">
        <VaAvatar :src="selectedVerifier.avatar" size="large" />
        <div>
          <h3 class="text-xl font-semibold">{{ selectedVerifier.name }}</h3>
          <p class="text-secondary">{{ selectedVerifier.organization }}</p>
          <div class="flex gap-2 mt-2">
            <VaBadge
              :text="selectedVerifier.type"
              :color="getTypeColor(selectedVerifier.type)"
              outline
            />
            <VaBadge
              :text="selectedVerifier.status"
              :color="getStatusColor(selectedVerifier.status)"
            />
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="font-semibold mb-3">Contact Information</h4>
          <div class="space-y-2">
            <p><strong>Phone:</strong> {{ selectedVerifier.phone }}</p>
            <p><strong>Email:</strong> {{ selectedVerifier.email }}</p>
            <p><strong>Location:</strong> {{ selectedVerifier.location }}</p>
            <p><strong>District:</strong> {{ selectedVerifier.district }}</p>
            <p><strong>License:</strong> {{ selectedVerifier.licenseNumber }}</p>
          </div>
        </div>
        
        <div>
          <h4 class="font-semibold mb-3">Performance Metrics</h4>
          <div class="space-y-2">
            <p><strong>Total Verifications:</strong> {{ selectedVerifier.totalVerifications }}</p>
            <p><strong>This Month:</strong> {{ selectedVerifier.thisMonthVerifications }}</p>
            <p><strong>Pending:</strong> {{ selectedVerifier.pendingVerifications }}</p>
            <p><strong>Success Rate:</strong> {{ selectedVerifier.successRate }}%</p>
            <p><strong>Joined:</strong> {{ formatDate(selectedVerifier.joinedDate) }}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h4 class="font-semibold mb-3">Verification Capabilities</h4>
        <div class="flex flex-wrap gap-2">
          <VaBadge v-if="selectedVerifier.canVerifyLifeCertificate" text="Life Certificate" color="success" />
          <VaBadge v-if="selectedVerifier.canVerifyDocuments" text="Document Verification" color="info" />
          <VaBadge v-if="selectedVerifier.canProcessBiometric" text="Biometric Processing" color="warning" />
          <VaBadge v-if="selectedVerifier.canIssueDigitalCertificate" text="Digital Certificates" color="primary" />
        </div>
      </div>
      
      <div class="flex justify-end gap-2 pt-4 border-t">
        <VaButton @click="showDetailsModal = false">Close</VaButton>
        <VaButton @click="editVerifier(selectedVerifier)" preset="secondary">Edit</VaButton>
        <VaButton @click="viewVerifications(selectedVerifier)" preset="primary">View Verifications</VaButton>
      </div>
    </div>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  VaCard, VaCardContent, VaInput, VaSelect, VaButton, VaIcon, VaAvatar, 
  VaBadge, VaModal, VaForm, VaTextarea, VaCheckbox 
} from 'vuestic-ui'

interface Verifier {
  id: string
  name: string
  type: 'Bank' | 'Aadhaar Center' | 'Field Officer' | 'Post Office'
  organization: string
  phone: string
  email: string
  district: string
  location: string
  address: string
  licenseNumber: string
  status: 'Active' | 'Inactive' | 'Suspended'
  totalVerifications: number
  thisMonthVerifications: number
  pendingVerifications: number
  successRate: number
  joinedDate: string
  avatar: string
  canVerifyLifeCertificate: boolean
  canVerifyDocuments: boolean
  canProcessBiometric: boolean
  canIssueDigitalCertificate: boolean
}

const searchQuery = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const districtFilter = ref('')
const showModal = ref(false)
const showDetailsModal = ref(false)
const editingVerifier = ref(false)
const selectedVerifier = ref<Verifier | null>(null)

const stats = ref({
  totalVerifiers: '1,247',
  banks: '456',
  aadhaarCenters: '234',
  fieldOfficers: '557'
})

const verifierTypes = ['Bank', 'Aadhaar Center', 'Field Officer', 'Post Office']
const statusOptions = ['Active', 'Inactive', 'Suspended']
const districtOptions = ['Meerut', 'Noida', 'Ghaziabad', 'Lucknow', 'Kanpur', 'Agra', 'Varanasi']

const currentVerifier = ref<Verifier>({
  id: '',
  name: '',
  type: 'Bank',
  organization: '',
  phone: '',
  email: '',
  district: '',
  location: '',
  address: '',
  licenseNumber: '',
  status: 'Active',
  totalVerifications: 0,
  thisMonthVerifications: 0,
  pendingVerifications: 0,
  successRate: 0,
  joinedDate: '',
  avatar: '/api/placeholder/64/64',
  canVerifyLifeCertificate: false,
  canVerifyDocuments: false,
  canProcessBiometric: false,
  canIssueDigitalCertificate: false
})

const verifiers = ref<Verifier[]>([
  {
    id: 'V001',
    name: 'अजय कुमार',
    type: 'Bank',
    organization: 'State Bank of India',
    phone: '9876543210',
    email: 'ajay.kumar@sbi.co.in',
    district: 'Meerut',
    location: 'Main Branch, Civil Lines',
    address: 'Civil Lines, Meerut, UP - 250001',
    licenseNumber: 'SBI-MRT-001',
    status: 'Active',
    totalVerifications: 1247,
    thisMonthVerifications: 89,
    pendingVerifications: 5,
    successRate: 98.5,
    joinedDate: '2023-01-15',
    avatar: '/api/placeholder/64/64',
    canVerifyLifeCertificate: true,
    canVerifyDocuments: true,
    canProcessBiometric: true,
    canIssueDigitalCertificate: false
  },
  {
    id: 'V002',
    name: 'प्रिया शर्मा',
    type: 'Aadhaar Center',
    organization: 'CSC Aadhaar Center',
    phone: '9876543211',
    email: 'priya.sharma@csc.gov.in',
    district: 'Noida',
    location: 'Sector 15, Noida',
    address: 'Sector 15, Noida, Gautam Buddha Nagar, UP - 201301',
    licenseNumber: 'CSC-NOI-002',
    status: 'Active',
    totalVerifications: 856,
    thisMonthVerifications: 67,
    pendingVerifications: 3,
    successRate: 96.8,
    joinedDate: '2023-03-20',
    avatar: '/api/placeholder/64/64',
    canVerifyLifeCertificate: true,
    canVerifyDocuments: true,
    canProcessBiometric: true,
    canIssueDigitalCertificate: true
  }
])

const filteredVerifiers = computed(() => {
  let filtered = verifiers.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(v => 
      v.name.toLowerCase().includes(query) ||
      v.organization.toLowerCase().includes(query) ||
      v.id.toLowerCase().includes(query)
    )
  }
  
  if (typeFilter.value) {
    filtered = filtered.filter(v => v.type === typeFilter.value)
  }
  
  if (statusFilter.value) {
    filtered = filtered.filter(v => v.status === statusFilter.value)
  }
  
  if (districtFilter.value) {
    filtered = filtered.filter(v => v.district === districtFilter.value)
  }
  
  return filtered
})

const getTypeColor = (type: string) => {
  const colors = {
    'Bank': 'success',
    'Aadhaar Center': 'info',
    'Field Officer': 'warning',
    'Post Office': 'primary'
  }
  return colors[type as keyof typeof colors] || 'secondary'
}

const getStatusColor = (status: string) => {
  const colors = {
    'Active': 'success',
    'Inactive': 'warning',
    'Suspended': 'danger'
  }
  return colors[status as keyof typeof colors] || 'secondary'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN')
}

const required = (value: any) => !!value || 'This field is required'
const phoneValidation = (value: string) => {
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(value) || 'Invalid phone number'
}
const emailValidation = (value: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value) || 'Invalid email address'
}

const addNewVerifier = () => {
  editingVerifier.value = false
  currentVerifier.value = {
    id: '',
    name: '',
    type: 'Bank',
    organization: '',
    phone: '',
    email: '',
    district: '',
    location: '',
    address: '',
    licenseNumber: '',
    status: 'Active',
    totalVerifications: 0,
    thisMonthVerifications: 0,
    pendingVerifications: 0,
    successRate: 0,
    joinedDate: new Date().toISOString().split('T')[0],
    avatar: '/api/placeholder/64/64',
    canVerifyLifeCertificate: false,
    canVerifyDocuments: false,
    canProcessBiometric: false,
    canIssueDigitalCertificate: false
  }
  showModal.value = true
}

const viewVerifier = (verifier: Verifier) => {
  selectedVerifier.value = verifier
  showDetailsModal.value = true
}

const editVerifier = (verifier: Verifier) => {
  editingVerifier.value = true
  currentVerifier.value = { ...verifier }
  showModal.value = true
  showDetailsModal.value = false
}

const viewVerifications = (verifier: Verifier) => {
  console.log('View verifications for:', verifier.name)
}

const toggleVerifierStatus = (verifier: Verifier) => {
  verifier.status = verifier.status === 'Active' ? 'Inactive' : 'Active'
}

const saveVerifier = () => {
  if (editingVerifier.value) {
    const index = verifiers.value.findIndex(v => v.id === currentVerifier.value.id)
    if (index !== -1) {
      verifiers.value[index] = { ...currentVerifier.value }
    }
  } else {
    currentVerifier.value.id = 'V' + String(Date.now()).slice(-3)
    verifiers.value.push({ ...currentVerifier.value })
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
