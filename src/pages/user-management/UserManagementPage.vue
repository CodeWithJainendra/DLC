<template>
  <div class="flex flex-col gap-4">
    <!-- User Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="admin_panel_settings" size="2xl" color="primary" />
          <h3 class="text-2xl font-bold mt-2">{{ userStats.totalUsers }}</h3>
          <p class="text-secondary">Total Users</p>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="verified_user" size="2xl" color="success" />
          <h3 class="text-2xl font-bold mt-2">{{ userStats.activeUsers }}</h3>
          <p class="text-secondary">Active Users</p>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="supervisor_account" size="2xl" color="info" />
          <h3 class="text-2xl font-bold mt-2">{{ userStats.admins }}</h3>
          <p class="text-secondary">Administrators</p>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent class="text-center">
          <VaIcon name="schedule" size="2xl" color="warning" />
          <h3 class="text-2xl font-bold mt-2">{{ userStats.pendingApproval }}</h3>
          <p class="text-secondary">Pending Approval</p>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- User Management -->
    <VaCard>
      <VaCardTitle>
        <h2 class="text-xl font-semibold">System Users</h2>
        <div class="flex gap-2">
          <VaSelect v-model="roleFilter" :options="roleOptions" placeholder="Filter by Role" class="w-48" clearable />
          <VaSelect
            v-model="statusFilter"
            :options="statusOptions"
            placeholder="Filter by Status"
            class="w-40"
            clearable
          />
          <VaButton preset="primary" @click="addNewUser"> Add New User </VaButton>
        </div>
      </VaCardTitle>

      <VaCardContent>
        <VaDataTable :items="users" :columns="columns" :loading="loading" striped hoverable>
          <template #cell(avatar)="{ rowData }">
            <VaAvatar :src="rowData.avatar" size="small" />
          </template>

          <template #cell(role)="{ rowData }">
            <VaBadge :text="rowData.role" :color="getRoleColor(rowData.role)" outline />
          </template>

          <template #cell(status)="{ rowData }">
            <VaBadge :text="rowData.status" :color="getStatusColor(rowData.status)" />
          </template>

          <template #cell(lastLogin)="{ rowData }">
            <div>
              <div>{{ formatDate(rowData.lastLogin) }}</div>
              <div class="text-xs text-secondary">
                {{ getTimeAgo(rowData.lastLogin) }}
              </div>
            </div>
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="flex gap-2">
              <VaButton
                preset="plain"
                icon="visibility"
                aria-label="View Details"
                size="small"
                @click="viewUser(rowData)"
              />
              <VaButton preset="plain" icon="edit" aria-label="Edit" size="small" @click="editUser(rowData)" />
              <VaButton
                preset="plain"
                :icon="rowData.status === 'Active' ? 'block' : 'check'"
                :aria-label="rowData.status === 'Active' ? 'Deactivate' : 'Activate'"
                size="small"
                :color="rowData.status === 'Active' ? 'danger' : 'success'"
                @click="toggleUserStatus(rowData)"
              />
              <VaButton
                preset="plain"
                icon="key"
                aria-label="Reset Password"
                size="small"
                @click="resetPassword(rowData)"
              />
            </div>
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>
  </div>

  <!-- Add/Edit User Modal -->
  <VaModal
    v-model="showModal"
    :title="editingUser ? 'Edit User' : 'Add New User'"
    size="large"
    :ok-text="editingUser ? 'Update' : 'Create'"
    @ok="saveUser"
    @cancel="closeModal"
  >
    <VaForm ref="form" class="flex flex-col gap-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VaInput v-model="currentUser.name" label="Full Name" :rules="[required]" />

        <VaInput v-model="currentUser.email" label="Email Address" type="email" :rules="[required, emailValidation]" />

        <VaInput v-model="currentUser.phone" label="Phone Number" :rules="[required, phoneValidation]" />

        <VaSelect v-model="currentUser.role" :options="roleOptions" label="User Role" :rules="[required]" />

        <VaSelect
          v-model="currentUser.department"
          :options="departmentOptions"
          label="Department"
          :rules="[required]"
        />

        <VaSelect
          v-model="currentUser.district"
          :options="districtOptions"
          label="Assigned District"
          :rules="[required]"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VaCheckbox v-model="currentUser.canManagePensioners" label="Can Manage Pensioners" />

        <VaCheckbox v-model="currentUser.canVerifyDocuments" label="Can Verify Documents" />

        <VaCheckbox v-model="currentUser.canGenerateReports" label="Can Generate Reports" />

        <VaCheckbox v-model="currentUser.canManageUsers" label="Can Manage Users" />
      </div>

      <VaTextarea
        v-model="currentUser.notes"
        label="Notes (Optional)"
        placeholder="Additional notes about the user..."
      />
    </VaForm>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  VaCard,
  VaCardContent,
  VaCardTitle,
  VaSelect,
  VaButton,
  VaDataTable,
  VaBadge,
  VaModal,
  VaForm,
  VaInput,
  VaCheckbox,
  VaTextarea,
  VaIcon,
  VaAvatar,
} from 'vuestic-ui'

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: string
  department: string
  district: string
  status: 'Active' | 'Inactive' | 'Pending'
  lastLogin: string
  createdDate: string
  avatar: string
  canManagePensioners: boolean
  canVerifyDocuments: boolean
  canGenerateReports: boolean
  canManageUsers: boolean
  notes: string
}

const roleFilter = ref('')
const statusFilter = ref('')
const loading = ref(false)
const showModal = ref(false)
const editingUser = ref(false)

const userStats = ref({
  totalUsers: '156',
  activeUsers: '142',
  admins: '12',
  pendingApproval: '8',
})

const roleOptions = ['Super Admin', 'State Admin', 'District Admin', 'Data Entry Operator', 'Verifier', 'Auditor']
const statusOptions = ['Active', 'Inactive', 'Pending']
const departmentOptions = ['Pension Department', 'IT Department', 'Finance Department', 'Audit Department']
const districtOptions = ['Meerut', 'Noida', 'Ghaziabad', 'Lucknow', 'Kanpur', 'Agra', 'All Districts']

const currentUser = ref<User>({
  id: '',
  name: '',
  email: '',
  phone: '',
  role: '',
  department: '',
  district: '',
  status: 'Active',
  lastLogin: '',
  createdDate: '',
  avatar: '/api/placeholder/40/40',
  canManagePensioners: false,
  canVerifyDocuments: false,
  canGenerateReports: false,
  canManageUsers: false,
  notes: '',
})

const columns = [
  { key: 'avatar', label: 'Photo', width: '60px' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'department', label: 'Department' },
  { key: 'district', label: 'District' },
  { key: 'status', label: 'Status' },
  { key: 'lastLogin', label: 'Last Login' },
  { key: 'actions', label: 'Actions', width: '180px' },
]

const users = ref<User[]>([
  {
    id: '1',
    name: 'राजेश कुमार',
    email: 'rajesh.kumar@pension.gov.in',
    phone: '9876543210',
    role: 'State Admin',
    department: 'Pension Department',
    district: 'All Districts',
    status: 'Active',
    lastLogin: '2024-01-20T10:30:00Z',
    createdDate: '2023-01-15T00:00:00Z',
    avatar: '/api/placeholder/40/40',
    canManagePensioners: true,
    canVerifyDocuments: true,
    canGenerateReports: true,
    canManageUsers: true,
    notes: 'Senior administrator with full access',
  },
  {
    id: '2',
    name: 'प्रिया शर्मा',
    email: 'priya.sharma@pension.gov.in',
    phone: '9876543211',
    role: 'District Admin',
    department: 'Pension Department',
    district: 'Meerut',
    status: 'Active',
    lastLogin: '2024-01-19T16:45:00Z',
    createdDate: '2023-03-20T00:00:00Z',
    avatar: '/api/placeholder/40/40',
    canManagePensioners: true,
    canVerifyDocuments: true,
    canGenerateReports: true,
    canManageUsers: false,
    notes: 'District level administrator for Meerut',
  },
])

const getRoleColor = (role: string) => {
  const colors = {
    'Super Admin': 'danger',
    'State Admin': 'primary',
    'District Admin': 'info',
    'Data Entry Operator': 'success',
    Verifier: 'warning',
    Auditor: 'secondary',
  }
  return colors[role as keyof typeof colors] || 'secondary'
}

const getStatusColor = (status: string) => {
  const colors = {
    Active: 'success',
    Inactive: 'warning',
    Pending: 'info',
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

const required = (value: any) => !!value || 'This field is required'
const emailValidation = (value: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value) || 'Invalid email address'
}
const phoneValidation = (value: string) => {
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(value) || 'Invalid phone number'
}

const addNewUser = () => {
  editingUser.value = false
  currentUser.value = {
    id: '',
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    district: '',
    status: 'Active',
    lastLogin: '',
    createdDate: new Date().toISOString(),
    avatar: '/api/placeholder/40/40',
    canManagePensioners: false,
    canVerifyDocuments: false,
    canGenerateReports: false,
    canManageUsers: false,
    notes: '',
  }
  showModal.value = true
}

const viewUser = (user: User) => {
  console.log('View user details:', user)
}

const editUser = (user: User) => {
  editingUser.value = true
  currentUser.value = { ...user }
  showModal.value = true
}

const toggleUserStatus = (user: User) => {
  user.status = user.status === 'Active' ? 'Inactive' : 'Active'
  console.log('Toggled user status:', user.id, user.status)
}

const resetPassword = (user: User) => {
  console.log('Reset password for user:', user.id)
}

const saveUser = () => {
  if (editingUser.value) {
    const index = users.value.findIndex((u) => u.id === currentUser.value.id)
    if (index !== -1) {
      users.value[index] = { ...currentUser.value }
    }
  } else {
    currentUser.value.id = Date.now().toString()
    users.value.push({ ...currentUser.value })
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
