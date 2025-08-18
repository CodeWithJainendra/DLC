<template>
  <VaCard class="states-disbursement-card">
    <VaCardContent class="p-0">
      <!-- Header Section -->
      <div class="card-header">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="header-icon">
              <VaIcon name="location_on" size="24px" color="white" />
            </div>
            <div>
              <h1 class="card-title">TOP STATES BY DISBURSEMENT</h1>
              <p class="card-subtitle">{{ stateData.length }} States Tracked</p>
            </div>
          </div>
          <VaButton preset="primary" size="small" class="export-btn" icon="download" @click="exportAsCSV">
            Export
          </VaButton>
        </div>
      </div>

      <!-- Controls Section -->
      <div class="controls-section">
        <VaButtonToggle v-model="selectedPeriod" :options="periods" class="period-toggle" />
      </div>

      <!-- Content Section -->
      <div class="card-content">
        <div v-if="stateData.length > 0">
          <VaDataTable
            class="states-table"
            :columns="[
              { key: 'state', label: 'STATE' },
              { key: 'amount', label: 'AMOUNT', align: 'right' },
            ]"
            :items="stateData"
          >
            <template #cell(state)="{ rowData }">
              <div class="state-name">
                <div class="state-flag">
                  {{ getStateFlag(rowData.state) }}
                </div>
                {{ rowData.state }}
              </div>
            </template>
            <template #cell(amount)="{ rowData }">
              <div class="amount-display">
                <div class="amount-value">₹{{ rowData[`amount${selectedPeriod}`] }}</div>
                <div class="amount-trend">
                  <VaIcon name="trending_up" size="12px" color="success" />
                </div>
              </div>
            </template>
          </VaDataTable>
        </div>
      </div>
    </VaCardContent>
  </VaCard>
</template>

<script setup lang="ts">
import { ref, Ref } from 'vue'
import { downloadAsCSV } from '../../../../services/toCSV'

const selectedPeriod = ref('Today') as Ref<'Today' | 'Week' | 'Month'>
const periods = ['Today', 'Week', 'Month'].map((period) => ({ label: period, value: period }))

const stateData = [
  {
    state: 'Uttar Pradesh',
    amountToday: '87.5L',
    amountWeek: '6.1Cr',
    amountMonth: '25.2Cr',
  },
  {
    state: 'Maharashtra',
    amountToday: '74.6L',
    amountWeek: '5.2Cr',
    amountMonth: '21.8Cr',
  },
  {
    state: 'Bihar',
    amountToday: '63.1L',
    amountWeek: '4.4Cr',
    amountMonth: '18.5Cr',
  },
  {
    state: 'West Bengal',
    amountToday: '52.6L',
    amountWeek: '3.7Cr',
    amountMonth: '15.4Cr',
  },
  {
    state: 'Rajasthan',
    amountToday: '45.3L',
    amountWeek: '3.2Cr',
    amountMonth: '13.3Cr',
  },
  {
    state: 'Madhya Pradesh',
    amountToday: '38.1L',
    amountWeek: '2.7Cr',
    amountMonth: '11.2Cr',
  },
  {
    state: 'Tamil Nadu',
    amountToday: '35.1L',
    amountWeek: '2.5Cr',
    amountMonth: '10.3Cr',
  },
]

const exportAsCSV = () => {
  downloadAsCSV(stateData, 'state-disbursement')
}

const getStateFlag = (stateName: string) => {
  const stateFlags: Record<string, string> = {
    'Uttar Pradesh': '🏛️',
    Maharashtra: '🏭',
    Bihar: '🌾',
    'West Bengal': '🎭',
    Rajasthan: '🏰',
    'Madhya Pradesh': '🦁',
    'Tamil Nadu': '🏛️',
  }
  return stateFlags[stateName] || '🏢'
}
</script>

<style scoped>
.states-disbursement-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
  border: 1px solid var(--va-background-border);
}

.states-disbursement-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-header {
  background: linear-gradient(135deg, var(--va-success) 0%, var(--va-success-dark) 100%);
  padding: 20px 24px;
  color: white;
}

/* Light theme header fix */
[data-theme='light'] .card-header {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%) !important;
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

.export-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.export-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: translateY(-1px);
}

/* Light theme button visibility fix */
[data-theme='light'] .export-btn {
  background: var(--va-primary) !important;
  border: 1px solid var(--va-primary) !important;
  color: white !important;
}

[data-theme='light'] .export-btn:hover {
  background: var(--va-primary-dark) !important;
  border: 1px solid var(--va-primary-dark) !important;
}

.controls-section {
  padding: 20px 24px;
  background: var(--va-background-secondary);
  border-bottom: 1px solid var(--va-background-border);
}

.period-toggle {
  --va-button-toggle-background: var(--va-background-primary);
  --va-button-toggle-color: var(--va-text-primary);
}

.period-toggle :deep(.va-button-toggle__button) {
  font-weight: 600;
  border-radius: 8px;
  margin: 0 2px;
}

.period-toggle :deep(.va-button-toggle__button--active) {
  background: var(--va-primary) !important;
  color: white !important;
}

/* Theme-aware period toggle fixes */
.period-toggle :deep(.va-button-toggle__button) {
  color: var(--va-text-primary) !important;
  background: var(--va-background-primary) !important;
  border: 1px solid var(--va-background-border) !important;
}

.period-toggle :deep(.va-button-toggle__button--active) {
  background: var(--va-primary) !important;
  color: white !important;
  border: 1px solid var(--va-primary) !important;
}

.card-content {
  padding: 0;
}

.states-table {
  --va-data-table-thead-background: var(--va-background-secondary);
}

.states-table :deep(.va-data-table__table-tr) {
  transition: all 0.2s ease;
}

.states-table :deep(.va-data-table__table-tr:hover) {
  background: var(--va-background-secondary);
  transform: scale(1.01);
}

.states-table :deep(.va-data-table__table-th) {
  background: var(--va-background-secondary);
  font-weight: 600;
  color: var(--va-text-primary);
  padding: 16px 24px;
  border-bottom: 2px solid var(--va-background-border);
}

.states-table :deep(.va-data-table__table-td) {
  padding: 16px 24px;
  border-bottom: 1px solid var(--va-background-border);
}

.state-name {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  color: var(--va-text-primary);
  font-size: 14px;
}

.state-flag {
  font-size: 20px;
  width: 32px;
  height: 32px;
  background: var(--va-background-secondary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--va-background-border);
}

.amount-display {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.amount-value {
  font-weight: 700;
  color: var(--va-success);
  font-size: 16px;
}

.amount-trend {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(var(--va-success-rgb), 0.1);
  border-radius: 50%;
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

.state-name {
  color: var(--va-text-primary) !important;
  font-weight: 600 !important;
}

.amount-value {
  color: var(--va-success) !important;
  font-weight: 700 !important;
}

.states-table :deep(.va-data-table__table-th) {
  color: var(--va-text-primary) !important;
  background: var(--va-background-secondary) !important;
  font-weight: 600 !important;
}

.states-table :deep(.va-data-table__table-td) {
  color: var(--va-text-primary) !important;
  font-weight: 500 !important;
}

.states-table :deep(.va-data-table__table-tr:hover) {
  background: var(--va-background-secondary) !important;
}

/* Theme-aware card background */
.states-disbursement-card {
  background: var(--va-background-primary) !important;
  border: 1px solid var(--va-background-border) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

/* Dark theme adjustments */
[data-theme='dark'] .states-disbursement-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

[data-theme='dark'] .states-disbursement-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

[data-theme='dark'] .state-flag {
  background: var(--va-background-primary);
}
</style>
