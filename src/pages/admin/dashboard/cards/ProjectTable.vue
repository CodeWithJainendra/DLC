<script setup lang="ts">
import { defineVaDataTableColumns } from 'vuestic-ui'
import { ref } from 'vue'

interface PensionScheme {
  id: string
  schemeName: string
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'INACTIVE'
  beneficiaries: number
  monthlyAmount: number
}

const columns = defineVaDataTableColumns([
  { label: 'SCHEME NAME', key: 'schemeName', sortable: true },
  { label: 'STATUS', key: 'status', sortable: true },
  { label: 'BENEFICIARIES', key: 'beneficiaries', sortable: true },
  { label: 'MONTHLY AMOUNT', key: 'monthlyAmount', sortable: true },
])

const pensionSchemes = ref<PensionScheme[]>([
  {
    id: '1',
    schemeName: 'Old Age Pension Scheme',
    status: 'ACTIVE',
    beneficiaries: 125678,
    monthlyAmount: 1500,
  },
  {
    id: '2',
    schemeName: 'Widow Pension Scheme',
    status: 'ACTIVE',
    beneficiaries: 89456,
    monthlyAmount: 1200,
  },
  {
    id: '3',
    schemeName: 'Disability Pension Scheme',
    status: 'ACTIVE',
    beneficiaries: 45234,
    monthlyAmount: 1800,
  },
  {
    id: '4',
    schemeName: 'Farmer Pension Scheme',
    status: 'UNDER_REVIEW',
    beneficiaries: 67890,
    monthlyAmount: 2000,
  },
  {
    id: '5',
    schemeName: 'Ex-Servicemen Pension',
    status: 'ACTIVE',
    beneficiaries: 34567,
    monthlyAmount: 3500,
  },
])

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'success'
    case 'UNDER_REVIEW':
      return 'warning'
    case 'INACTIVE':
      return 'danger'
    default:
      return 'secondary'
  }
}

const formatNumber = (num: number) => {
  return num.toLocaleString('en-IN')
}

const formatCurrency = (amount: number) => {
  return `₹${amount.toLocaleString('en-IN')}`
}

const getSchemeIcon = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'check_circle'
    case 'UNDER_REVIEW':
      return 'schedule'
    case 'INACTIVE':
      return 'cancel'
    default:
      return 'help'
  }
}
</script>

<template>
  <VaCard class="pension-schemes-card">
    <VaCardContent class="p-0">
      <!-- Header Section -->
      <div class="card-header">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="header-icon">
              <VaIcon name="account_balance" size="24px" color="white" />
            </div>
            <div>
              <h1 class="card-title">PENSION SCHEMES</h1>
              <p class="card-subtitle">{{ pensionSchemes.length }} Active Schemes</p>
            </div>
          </div>
          <VaButton preset="primary" size="small" class="view-all-btn" icon="visibility"> View Stats </VaButton>
        </div>
      </div>

      <!-- Content Section -->
      <div class="card-content">
        <div v-if="pensionSchemes.length > 0">
          <VaDataTable
            :items="pensionSchemes"
            :columns="columns"
            class="pension-table"
          >
            <template #cell(schemeName)="{ rowData }">
              <div class="scheme-name">
                <VaIcon
                  :name="getSchemeIcon(rowData.status)"
                  size="16px"
                  :color="getStatusColor(rowData.status)"
                  class="mr-2"
                />
                {{ rowData.schemeName }}
              </div>
            </template>

            <template #cell(status)="{ rowData }">
              <VaBadge :text="rowData.status" :color="getStatusColor(rowData.status)" class="status-badge" />
            </template>

            <template #cell(beneficiaries)="{ rowData }">
              <div class="beneficiaries-count">
                {{ formatNumber(rowData.beneficiaries) }}
              </div>
            </template>

            <template #cell(monthlyAmount)="{ rowData }">
              <div class="monthly-amount">
                {{ formatCurrency(rowData.monthlyAmount) }}
              </div>
            </template>
          </VaDataTable>
        </div>
      </div>
    </VaCardContent>
  </VaCard>
</template>

<style scoped>
.pension-schemes-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
  border: 1px solid var(--va-background-border);
}

.pension-schemes-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-header {
  background: linear-gradient(135deg, var(--va-primary) 0%, var(--va-primary-dark) 100%);
  padding: 20px 24px;
  color: white;
}

/* Light theme header fix */
[data-theme='light'] .card-header {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%) !important;
  color: white !important;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: white;
}

.card-subtitle {
  font-size: 14px;
  margin: 4px 0 0 0;
  color: rgba(255, 255, 255, 0.8);
}

.view-all-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.view-all-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: translateY(-1px);
}

/* Theme-aware button visibility fix */
.view-all-btn {
  background: var(--va-primary) !important;
  border: 1px solid var(--va-primary) !important;
  color: white !important;
}

.view-all-btn:hover {
  background: var(--va-primary-dark) !important;
  border: 1px solid var(--va-primary-dark) !important;
}

.card-content {
  padding: 0;
}

.pension-table {
  --va-data-table-thead-background: var(--va-background-secondary);
}

.pension-table :deep(.va-data-table__table-tr) {
  transition: all 0.2s ease;
}

.pension-table :deep(.va-data-table__table-tr:hover) {
  background: var(--va-background-secondary);
  transform: scale(1.01);
}

.pension-table :deep(.va-data-table__table-th) {
  background: var(--va-background-secondary);
  font-weight: 600;
  color: var(--va-text-primary);
  padding: 16px 20px;
  border-bottom: 2px solid var(--va-background-border);
}

.pension-table :deep(.va-data-table__table-td) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--va-background-border);
}

.scheme-name {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: var(--va-text-primary);
  font-size: 14px;
}

.status-badge {
  font-weight: 600;
  font-size: 11px;
  padding: 6px 12px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.beneficiaries-count {
  font-weight: 700;
  color: var(--va-primary);
  font-size: 15px;
}

.monthly-amount {
  font-weight: 700;
  color: var(--va-success);
  font-size: 15px;
}

.no-data {
  padding: 40px;
  text-align: center;
  color: var(--va-text-secondary);
  font-style: italic;
}

/* Theme-aware text visibility fixes */
.card-title {
  color: white !important;
  font-weight: 700 !important;
}

.card-subtitle {
  color: rgba(255, 255, 255, 0.95) !important;
  font-weight: 500 !important;
}

.scheme-name {
  color: var(--va-text-primary) !important;
  font-weight: 600 !important;
}

.beneficiaries-count {
  color: var(--va-primary) !important;
  font-weight: 600 !important;
}

.monthly-amount {
  color: var(--va-success) !important;
  font-weight: 700 !important;
}

.pension-table :deep(.va-data-table__table-th) {
  color: var(--va-text-primary) !important;
  background: var(--va-background-secondary) !important;
  font-weight: 600 !important;
}

.pension-table :deep(.va-data-table__table-td) {
  color: var(--va-text-primary) !important;
  font-weight: 500 !important;
}

.pension-table :deep(.va-data-table__table-tr:hover) {
  background: var(--va-background-secondary) !important;
}

/* Theme-aware card background */
.pension-schemes-card {
  background: var(--va-background-primary) !important;
  border: 1px solid var(--va-background-border) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

/* Dark theme adjustments */
[data-theme='dark'] .pension-schemes-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

[data-theme='dark'] .pension-schemes-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}
</style>
