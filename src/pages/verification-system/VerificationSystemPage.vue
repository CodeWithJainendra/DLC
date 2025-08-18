<template>
  <div class="flex flex-col gap-4">
    <!-- Quick Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="pending_actions" size="2xl" color="warning" />
          <h3 class="text-2xl font-bold mt-2">{{ stats.pendingVerifications }}</h3>
          <p class="text-secondary">Pending Verifications</p>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="verified" size="2xl" color="success" />
          <h3 class="text-2xl font-bold mt-2">{{ stats.completedToday }}</h3>
          <p class="text-secondary">Completed Today</p>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="schedule" size="2xl" color="info" />
          <h3 class="text-2xl font-bold mt-2">{{ stats.avgProcessingTime }}</h3>
          <p class="text-secondary">Avg Processing Time (hrs)</p>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="support_agent" size="2xl" color="primary" />
          <h3 class="text-2xl font-bold mt-2">{{ stats.activeMediators }}</h3>
          <p class="text-secondary">Active Mediators</p>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Verification Queue -->
    <VaCard>
      <VaCardTitle>
        <h2 class="text-xl font-semibold">Verification Queue</h2>
        <div class="flex gap-2">
          <VaSelect
            v-model="priorityFilter"
            :options="priorityOptions"
            placeholder="Filter by Priority"
            class="w-40"
            clearable
          />
          <VaSelect
            v-model="typeFilter"
            :options="verificationTypes"
            placeholder="Filter by Type"
            class="w-48"
            clearable
          />
        </div>
      </VaCardTitle>

      <VaCardContent>
        <VaDataTable :items="filteredVerifications" :columns="verificationColumns" :loading="loading" striped hoverable>
          <template #cell(priority)="{ rowData }">
            <VaBadge :text="rowData.priority" :color="getPriorityColor(rowData.priority)" />
          </template>

          <template #cell(type)="{ rowData }">
            <VaBadge :text="rowData.type" color="info" outline />
          </template>

          <template #cell(submittedDate)="{ rowData }">
            <span>{{ formatDate(rowData.submittedDate) }}</span>
            <div class="text-xs text-secondary">
              {{ getTimeAgo(rowData.submittedDate) }}
            </div>
          </template>

          <template #cell(mediator)="{ rowData }">
            <div v-if="rowData.mediator" class="flex items-center gap-2">
              <VaAvatar size="small" :src="rowData.mediator.avatar" />
              <span>{{ rowData.mediator.name }}</span>
            </div>
            <VaBadge v-else text="Unassigned" color="warning" outline />
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="flex gap-2">
              <VaButton preset="plain" icon="visibility" aria-label="View Details" @click="viewVerification(rowData)" />
              <VaButton
                v-if="!rowData.mediator"
                preset="plain"
                icon="person_add"
                aria-label="Assign Mediator"
                @click="assignMediator(rowData)"
              />
              <VaButton
                preset="plain"
                icon="check_circle"
                aria-label="Process"
                color="success"
                @click="processVerification(rowData)"
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
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 class="font-semibold mb-2">Pensioner Information</h4>
          <div class="space-y-2">
            <p><strong>Name:</strong> {{ selectedVerification.pensionerName }}</p>
            <p><strong>Pension Number:</strong> {{ selectedVerification.pensionNumber }}</p>
            <p><strong>Aadhaar:</strong> {{ selectedVerification.aadhaarNumber }}</p>
            <p><strong>Mobile:</strong> {{ selectedVerification.mobileNumber }}</p>
          </div>
        </div>

        <div>
          <h4 class="font-semibold mb-2">Verification Details</h4>
          <div class="space-y-2">
            <p><strong>Type:</strong> {{ selectedVerification.type }}</p>
            <p>
              <strong>Priority:</strong>
              <VaBadge :text="selectedVerification.priority" :color="getPriorityColor(selectedVerification.priority)" />
            </p>
            <p><strong>Submitted:</strong> {{ formatDate(selectedVerification.submittedDate) }}</p>
            <p><strong>Location:</strong> {{ selectedVerification.location }}</p>
          </div>
        </div>
      </div>

      <div v-if="selectedVerification.documents.length">
        <h4 class="font-semibold mb-2">Submitted Documents</h4>
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
          v-if="!selectedVerification.mediator"
          preset="secondary"
          @click="assignMediator(selectedVerification)"
        >
          Assign Mediator
        </VaButton>
        <VaButton preset="primary" @click="processVerification(selectedVerification)"> Process Verification </VaButton>
      </div>
    </div>
  </VaModal>

  <!-- Assign Mediator Modal -->
  <VaModal v-model="showAssignModal" title="Assign Mediator" @ok="confirmAssignment" @cancel="showAssignModal = false">
    <div class="flex flex-col gap-4">
      <VaSelect
        v-model="selectedMediatorId"
        :options="availableMediators"
        text-by="name"
        value-by="id"
        label="Select Mediator"
        placeholder="Choose a mediator"
      >
        <template #option="{ option }">
          <div v-if="option && typeof option === 'object'" class="flex items-center gap-2">
            <VaAvatar size="small" :src="(option as any).avatar" />
            <div>
              <div>{{ (option as any).name }}</div>
              <div class="text-xs text-secondary">
                {{ (option as any).location }} • {{ (option as any).activeVerifications }} active
              </div>
            </div>
          </div>
        </template>
      </VaSelect>

      <VaTextarea
        v-model="assignmentNotes"
        label="Assignment Notes (Optional)"
        placeholder="Add any special instructions..."
      />
    </div>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  VaCard,
  VaCardContent,
  VaCardTitle,
  VaIcon,
  VaDataTable,
  VaBadge,
  VaButton,
  VaSelect,
  VaModal,
  VaAvatar,
  VaTextarea,
} from 'vuestic-ui'

interface Verification {
  id: string
  pensionNumber: string
  pensionerName: string
  aadhaarNumber: string
  mobileNumber: string
  type: string
  priority: 'High' | 'Medium' | 'Low'
  submittedDate: string
  location: string
  mediator?: {
    id: string
    name: string
    avatar: string
  }
  documents: Array<{
    id: string
    name: string
    url: string
  }>
}

interface Mediator {
  id: string
  name: string
  avatar: string
  location: string
  activeVerifications: number
}

const loading = ref(false)
const showDetailsModal = ref(false)
const showAssignModal = ref(false)
const selectedVerification = ref<Verification | null>(null)
const selectedMediatorId = ref('')
const assignmentNotes = ref('')
const priorityFilter = ref('')
const typeFilter = ref('')

const stats = ref({
  pendingVerifications: 1847,
  completedToday: 156,
  avgProcessingTime: 4.2,
  activeMediators: 127,
})

const priorityOptions = ['High', 'Medium', 'Low']
const verificationTypes = ['Life Certificate', 'Address Verification', 'Bank Details Update', 'Disability Certificate']

const verifications = ref<Verification[]>([
  {
    id: '1',
    pensionNumber: 'PEN001234',
    pensionerName: 'राम कुमार शर्मा',
    aadhaarNumber: '1234-5678-9012',
    mobileNumber: '9876543210',
    type: 'Life Certificate',
    priority: 'High',
    submittedDate: '2024-01-20T10:30:00Z',
    location: 'Meerut, UP',
    documents: [
      { id: '1', name: 'Life Certificate.pdf', url: '#' },
      { id: '2', name: 'Aadhaar Copy.pdf', url: '#' },
    ],
  },
  {
    id: '2',
    pensionNumber: 'PEN001235',
    pensionerName: 'सुनीता देवी',
    aadhaarNumber: '2345-6789-0123',
    mobileNumber: '9876543211',
    type: 'Address Verification',
    priority: 'Medium',
    submittedDate: '2024-01-19T14:15:00Z',
    location: 'Noida, UP',
    mediator: {
      id: 'M001',
      name: 'अजय कुमार',
      avatar: '/api/placeholder/32/32',
    },
    documents: [{ id: '3', name: 'Address Proof.pdf', url: '#' }],
  },
])

const availableMediators = ref<Mediator[]>([
  {
    id: 'M001',
    name: 'अजय कुमार',
    avatar: '/api/placeholder/32/32',
    location: 'Meerut',
    activeVerifications: 5,
  },
  {
    id: 'M002',
    name: 'प्रिया शर्मा',
    avatar: '/api/placeholder/32/32',
    location: 'Noida',
    activeVerifications: 3,
  },
])

const verificationColumns = [
  { key: 'pensionNumber', label: 'Pension Number' },
  { key: 'pensionerName', label: 'Pensioner Name' },
  { key: 'type', label: 'Type' },
  { key: 'priority', label: 'Priority' },
  { key: 'submittedDate', label: 'Submitted' },
  { key: 'mediator', label: 'Assigned To' },
  { key: 'actions', label: 'Actions', width: '150px' },
]

const filteredVerifications = computed(() => {
  let filtered = verifications.value

  if (priorityFilter.value) {
    filtered = filtered.filter((v) => v.priority === priorityFilter.value)
  }

  if (typeFilter.value) {
    filtered = filtered.filter((v) => v.type === typeFilter.value)
  }

  return filtered
})

const getPriorityColor = (priority: string) => {
  const colors = {
    High: 'danger',
    Medium: 'warning',
    Low: 'success',
  }
  return colors[priority as keyof typeof colors] || 'secondary'
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

const viewVerification = (verification: Verification) => {
  selectedVerification.value = verification
  showDetailsModal.value = true
}

const assignMediator = (verification: Verification) => {
  selectedVerification.value = verification
  selectedMediatorId.value = ''
  assignmentNotes.value = ''
  showAssignModal.value = true
}

const processVerification = (verification: Verification) => {
  // Navigate to processing page
  console.log('Process verification:', verification)
}

const confirmAssignment = () => {
  if (selectedVerification.value && selectedMediatorId.value) {
    const mediator = availableMediators.value.find((m) => m.id === selectedMediatorId.value)
    if (mediator) {
      selectedVerification.value.mediator = {
        id: mediator.id,
        name: mediator.name,
        avatar: mediator.avatar,
      }
    }
  }
  showAssignModal.value = false
}

const viewDocument = (document: any) => {
  // Open document viewer
  console.log('View document:', document)
}

onMounted(() => {
  // Load initial data
})
</script>
