<template>

  
  <div class="flex flex-col gap-4">
    <!-- Search and Actions -->
    <VaCard>
      <VaCardContent class="flex flex-col sm:flex-row gap-4 items-end">
        <VaInput
          v-model="searchQuery"
          placeholder="Search mediators by name, location, or ID"
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
          class="w-40"
          clearable
        />
        
        <VaSelect
          v-model="locationFilter"
          :options="locationOptions"
          placeholder="Filter by Location"
          class="w-48"
          clearable
        />
        
        <VaButton @click="addNewMediator" preset="primary">
          Add New Mediator
        </VaButton>
      </VaCardContent>
    </VaCard>

    <!-- Mediators Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <VaCard 
        v-for="mediator in filteredMediators" 
        :key="mediator.id"
        class="hover:shadow-lg transition-shadow"
      >
        <VaCardContent>
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <VaAvatar :src="mediator.avatar" size="large" />
              <div>
                <h3 class="font-semibold">{{ mediator.name }}</h3>
                <p class="text-sm text-secondary">ID: {{ mediator.id }}</p>
              </div>
            </div>
            <VaBadge
              :text="mediator.status"
              :color="getStatusColor(mediator.status)"
            />
          </div>
          
          <div class="space-y-2 mb-4">
            <div class="flex items-center gap-2">
              <VaIcon name="location_on" size="small" />
              <span class="text-sm">{{ mediator.location }}</span>
            </div>
            <div class="flex items-center gap-2">
              <VaIcon name="phone" size="small" />
              <span class="text-sm">{{ mediator.phone }}</span>
            </div>
            <div class="flex items-center gap-2">
              <VaIcon name="business" size="small" />
              <span class="text-sm">{{ mediator.organization }}</span>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="text-center">
              <div class="text-lg font-semibold text-primary">{{ mediator.activeVerifications }}</div>
              <div class="text-xs text-secondary">Active</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-semibold text-success">{{ mediator.completedVerifications }}</div>
              <div class="text-xs text-secondary">Completed</div>
            </div>
          </div>
          
          <div class="flex gap-2">
            <VaButton
              preset="plain"
              icon="visibility"
              @click="viewMediator(mediator)"
              aria-label="View Details"
              size="small"
            />
            <VaButton
              preset="plain"
              icon="edit"
              @click="editMediator(mediator)"
              aria-label="Edit"
              size="small"
            />
            <VaButton
              preset="plain"
              icon="assignment"
              @click="viewAssignments(mediator)"
              aria-label="View Assignments"
              size="small"
            />
            <VaButton
              preset="plain"
              :icon="mediator.status === 'Active' ? 'pause' : 'play_arrow'"
              @click="toggleMediatorStatus(mediator)"
              :aria-label="mediator.status === 'Active' ? 'Deactivate' : 'Activate'"
              size="small"
            />
          </div>
        </VaCardContent>
      </VaCard>
    </div>
  </div>

  <!-- Add/Edit Mediator Modal -->
  <VaModal
    v-model="showModal"
    :title="editingMediator ? 'Edit Mediator' : 'Add New Mediator'"
    size="large"
    :ok-text="editingMediator ? 'Update' : 'Add'"
    @ok="saveMediator"
    @cancel="closeModal"
  >
    <VaForm ref="form" class="flex flex-col gap-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VaInput
          v-model="currentMediator.name"
          label="Full Name"
          :rules="[required]"
        />
        
        <VaInput
          v-model="currentMediator.phone"
          label="Phone Number"
          :rules="[required, phoneValidation]"
        />
        
        <VaInput
          v-model="currentMediator.email"
          label="Email Address"
          type="email"
          :rules="[required, emailValidation]"
        />
        
        <VaSelect
          v-model="currentMediator.organization"
          :options="organizationOptions"
          label="Organization"
          :rules="[required]"
        />
        
        <VaInput
          v-model="currentMediator.location"
          label="Location"
          :rules="[required]"
        />
        
        <VaSelect
          v-model="currentMediator.district"
          :options="districtOptions"
          label="District"
          :rules="[required]"
        />
        
        <VaInput
          v-model="currentMediator.aadhaarNumber"
          label="Aadhaar Number"
          :rules="[required, aadhaarValidation]"
        />
        
        <VaDateInput
          v-model="currentMediator.joiningDate"
          label="Joining Date"
          :rules="[required]"
        />
      </div>
      
      <VaTextarea
        v-model="currentMediator.address"
        label="Complete Address"
        :rules="[required]"
      />
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VaCheckbox
          v-model="currentMediator.canVerifyLifeCertificate"
          label="Can Verify Life Certificates"
        />
        
        <VaCheckbox
          v-model="currentMediator.canVerifyAddress"
          label="Can Verify Address"
        />
        
        <VaCheckbox
          v-model="currentMediator.canVerifyBankDetails"
          label="Can Verify Bank Details"
        />
        
        <VaCheckbox
          v-model="currentMediator.canVerifyDisability"
          label="Can Verify Disability Certificates"
        />
      </div>
    </VaForm>
  </VaModal>

  <!-- Mediator Details Modal -->
  <VaModal
    v-model="showDetailsModal"
    title="Mediator Details"
    size="large"
    hide-default-actions
  >
    <div v-if="selectedMediator" class="flex flex-col gap-4">
      <div class="flex items-center gap-4 mb-4">
        <VaAvatar :src="selectedMediator.avatar" size="large" />
        <div>
          <h3 class="text-xl font-semibold">{{ selectedMediator.name }}</h3>
          <p class="text-secondary">{{ selectedMediator.organization }}</p>
          <VaBadge
            :text="selectedMediator.status"
            :color="getStatusColor(selectedMediator.status)"
          />
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="font-semibold mb-3">Contact Information</h4>
          <div class="space-y-2">
            <p><strong>Phone:</strong> {{ selectedMediator.phone }}</p>
            <p><strong>Email:</strong> {{ selectedMediator.email }}</p>
            <p><strong>Location:</strong> {{ selectedMediator.location }}</p>
            <p><strong>District:</strong> {{ selectedMediator.district }}</p>
          </div>
        </div>
        
        <div>
          <h4 class="font-semibold mb-3">Performance Metrics</h4>
          <div class="space-y-2">
            <p><strong>Active Verifications:</strong> {{ selectedMediator.activeVerifications }}</p>
            <p><strong>Completed Verifications:</strong> {{ selectedMediator.completedVerifications }}</p>
            <p><strong>Average Rating:</strong> {{ selectedMediator.rating }}/5</p>
            <p><strong>Joining Date:</strong> {{ formatDate(selectedMediator.joiningDate) }}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h4 class="font-semibold mb-3">Verification Capabilities</h4>
        <div class="flex flex-wrap gap-2">
          <VaBadge v-if="selectedMediator.canVerifyLifeCertificate" text="Life Certificate" color="success" />
          <VaBadge v-if="selectedMediator.canVerifyAddress" text="Address Verification" color="info" />
          <VaBadge v-if="selectedMediator.canVerifyBankDetails" text="Bank Details" color="warning" />
          <VaBadge v-if="selectedMediator.canVerifyDisability" text="Disability Certificate" color="primary" />
        </div>
      </div>
      
      <div class="flex justify-end gap-2 pt-4 border-t">
        <VaButton @click="showDetailsModal = false">Close</VaButton>
        <VaButton @click="editMediator(selectedMediator)" preset="secondary">Edit</VaButton>
        <VaButton @click="viewAssignments(selectedMediator)" preset="primary">View Assignments</VaButton>
      </div>
    </div>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  VaCard, VaCardContent, VaInput, VaSelect, VaButton, VaIcon, VaAvatar, 
  VaBadge, VaModal, VaForm, VaDateInput, VaTextarea, VaCheckbox 
} from 'vuestic-ui'

interface Mediator {
  id: string
  name: string
  phone: string
  email: string
  organization: string
  location: string
  district: string
  aadhaarNumber: string
  joiningDate: string
  address: string
  status: 'Active' | 'Inactive' | 'Suspended'
  activeVerifications: number
  completedVerifications: number
  rating: number
  avatar: string
  canVerifyLifeCertificate: boolean
  canVerifyAddress: boolean
  canVerifyBankDetails: boolean
  canVerifyDisability: boolean
}

const searchQuery = ref('')
const statusFilter = ref('')
const locationFilter = ref('')
const showModal = ref(false)
const showDetailsModal = ref(false)
const editingMediator = ref(false)
const selectedMediator = ref<Mediator | null>(null)

const statusOptions = ['Active', 'Inactive', 'Suspended']
const locationOptions = ['Meerut', 'Noida', 'Ghaziabad', 'Lucknow', 'Kanpur', 'Agra']
const organizationOptions = ['Bank', 'Aadhaar Center', 'Post Office', 'CSC Center', 'Government Office']
const districtOptions = ['Meerut', 'Gautam Buddha Nagar', 'Ghaziabad', 'Lucknow', 'Kanpur', 'Agra']

const currentMediator = ref<Mediator>({
  id: '',
  name: '',
  phone: '',
  email: '',
  organization: '',
  location: '',
  district: '',
  aadhaarNumber: '',
  joiningDate: '',
  address: '',
  status: 'Active',
  activeVerifications: 0,
  completedVerifications: 0,
  rating: 0,
  avatar: '/api/placeholder/64/64',
  canVerifyLifeCertificate: false,
  canVerifyAddress: false,
  canVerifyBankDetails: false,
  canVerifyDisability: false
})

const mediators = ref<Mediator[]>([
  {
    id: 'M001',
    name: 'अजय कुमार',
    phone: '9876543210',
    email: 'ajay.kumar@example.com',
    organization: 'Bank',
    location: 'Meerut',
    district: 'Meerut',
    aadhaarNumber: '1234-5678-9012',
    joiningDate: '2023-01-15',
    address: 'Sector 12, Meerut, UP',
    status: 'Active',
    activeVerifications: 5,
    completedVerifications: 234,
    rating: 4.8,
    avatar: '/api/placeholder/64/64',
    canVerifyLifeCertificate: true,
    canVerifyAddress: true,
    canVerifyBankDetails: true,
    canVerifyDisability: false
  },
  {
    id: 'M002',
    name: 'प्रिया शर्मा',
    phone: '9876543211',
    email: 'priya.sharma@example.com',
    organization: 'Aadhaar Center',
    location: 'Noida',
    district: 'Gautam Buddha Nagar',
    aadhaarNumber: '2345-6789-0123',
    joiningDate: '2023-03-20',
    address: 'Sector 15, Noida, UP',
    status: 'Active',
    activeVerifications: 3,
    completedVerifications: 156,
    rating: 4.6,
    avatar: '/api/placeholder/64/64',
    canVerifyLifeCertificate: true,
    canVerifyAddress: true,
    canVerifyBankDetails: false,
    canVerifyDisability: true
  }
])

const filteredMediators = computed(() => {
  let filtered = mediators.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(m => 
      m.name.toLowerCase().includes(query) ||
      m.location.toLowerCase().includes(query) ||
      m.id.toLowerCase().includes(query)
    )
  }
  
  if (statusFilter.value) {
    filtered = filtered.filter(m => m.status === statusFilter.value)
  }
  
  if (locationFilter.value) {
    filtered = filtered.filter(m => m.location === locationFilter.value)
  }
  
  return filtered
})

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
const aadhaarValidation = (value: string) => {
  const aadhaarRegex = /^\d{4}-\d{4}-\d{4}$/
  return aadhaarRegex.test(value) || 'Invalid Aadhaar format (XXXX-XXXX-XXXX)'
}

const addNewMediator = () => {
  editingMediator.value = false
  currentMediator.value = {
    id: '',
    name: '',
    phone: '',
    email: '',
    organization: '',
    location: '',
    district: '',
    aadhaarNumber: '',
    joiningDate: '',
    address: '',
    status: 'Active',
    activeVerifications: 0,
    completedVerifications: 0,
    rating: 0,
    avatar: '/api/placeholder/64/64',
    canVerifyLifeCertificate: false,
    canVerifyAddress: false,
    canVerifyBankDetails: false,
    canVerifyDisability: false
  }
  showModal.value = true
}

const viewMediator = (mediator: Mediator) => {
  selectedMediator.value = mediator
  showDetailsModal.value = true
}

const editMediator = (mediator: Mediator) => {
  editingMediator.value = true
  currentMediator.value = { ...mediator }
  showModal.value = true
  showDetailsModal.value = false
}

const viewAssignments = (mediator: Mediator) => {
  // Navigate to assignments view
  console.log('View assignments for:', mediator)
}

const toggleMediatorStatus = (mediator: Mediator) => {
  mediator.status = mediator.status === 'Active' ? 'Inactive' : 'Active'
}

const saveMediator = () => {
  if (editingMediator.value) {
    const index = mediators.value.findIndex(m => m.id === currentMediator.value.id)
    if (index !== -1) {
      mediators.value[index] = { ...currentMediator.value }
    }
  } else {
    currentMediator.value.id = 'M' + String(Date.now()).slice(-3)
    mediators.value.push({ ...currentMediator.value })
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
