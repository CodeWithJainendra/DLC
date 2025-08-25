<template>
  <VaCard class="flex flex-col">
    <VaCardTitle class="flex items-start justify-between">
      <h1 class="card-title text-secondary font-bold uppercase">DLC Status - Overall Analytics</h1>
      <div class="flex gap-2">
        <VaSelect v-model="selectedMonth" preset="small" :options="monthsWithCurrentYear" class="w-24" />
        <VaButton class="h-2" size="small" preset="primary" @click="exportAsCSV">Export</VaButton>
      </div>
    </VaCardTitle>
    <VaCardContent class="flex flex-col-reverse md:flex-row md:items-center justify-between gap-5 h-full">
      <section class="flex flex-col items-start w-full sm:w-1/3 md:w-2/5 lg:w-1/4 gap-2 md:gap-8 pl-4">
        <div>
          <p class="text-xl font-semibold">{{ totalVerifications.toLocaleString() }}</p>
          <p class="whitespace-nowrap mt-2">Total: 1,19,086</p>
          <p class="text-sm text-secondary mt-1">Click for detailed view</p>
        </div>
        <div class="flex flex-col sm:flex-col gap-2 md:gap-8 w-full">
          <div>
            <div class="flex items-center">
              <span class="inline-block w-2 h-2 mr-2 -ml-4" :style="{ backgroundColor: earningsColor }"></span>
              <span class="text-secondary">State-wise Verified</span>
            </div>
            <div class="mt-2 text-xl font-semibold">{{ earningsForSelectedMonth.earning.toLocaleString() }}</div>
          </div>
          <div>
            <div class="flex items-center">
              <span class="inline-block w-2 h-2 mr-2 -ml-4" :style="{ backgroundColor: expensesColor }"></span>
              <span class="text-secondary">Pending Review</span>
            </div>
            <div class="mt-2 text-xl font-semibold">{{ earningsForSelectedMonth.expenses.toLocaleString() }}</div>
          </div>
        </div>
      </section>
      <div class="w-2/3 md:w-3/5 lg:w-3/4 h-full min-h-72 sm:min-h-32 pt-4">
        <div v-if="Object.keys(stateWiseRaceData).length === 0" class="flex items-center justify-center h-full">
          <div class="text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p class="text-sm text-secondary">Loading state-wise data...</p>
          </div>
        </div>
        <div v-else class="h-full">
          <!-- Map Container -->
          <div class="bg-white rounded-lg shadow-sm h-full flex flex-col">
            <div class="flex items-center justify-between p-4 border-b">
              <h3 class="text-lg font-semibold text-gray-800">State-wise DLC Status Distribution</h3>
            </div>

            <!-- Map Visualization -->
            <div class="flex-1 p-4">
              <div class="h-full relative">
                <IndiaStateMap
                  :state-data="processedStateData"
                  :selected-metric="selectedMetric"
                  class="w-full h-full"
                />

                <!-- Controls -->
                <div class="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3">
                  <div class="flex flex-col gap-2">
                    <VaButton preset="primary" size="small" icon="visibility" class="mb-2" @click="toggleStatsPopup">
                      View Stats
                    </VaButton>
                    <VaSelect
                      v-model="selectedMetric"
                      :options="metricOptions"
                      preset="small"
                      class="w-40"
                      placeholder="Select Metric"
                    />
                    <VaSelect
                      v-model="selectedAgeGroup"
                      :options="ageGroupOptions"
                      preset="small"
                      class="w-40"
                      placeholder="Age Group"
                    />
                  </div>
                </div>

                <!-- Legend - completely hidden initially, no longer shown by default -->

                <!-- Stats Popup -->
                <Transition name="stats-popup">
                  <div
                    v-if="showStatsPopup"
                    class="absolute bottom-4 left-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-80 max-w-96 stats-popup-card z-20"
                  >
                    <div class="flex items-center justify-between mb-3">
                      <h4 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <VaIcon name="analytics" size="20px" color="primary" />
                        Statistics Overview
                      </h4>
                      <VaButton
                        preset="plain"
                        size="small"
                        icon="close"
                        class="text-gray-500 hover:text-gray-700"
                        @click="toggleStatsPopup"
                      />
                    </div>

                    <div class="space-y-3">
                      <!-- Legend Section -->
                      <div class="bg-gray-50 rounded-lg p-3">
                        <h5 class="text-sm font-medium text-gray-700 mb-2">
                          {{ selectedMetric.replace('_', ' ').toUpperCase() }} Legend
                        </h5>
                        <div class="flex flex-col gap-1">
                          <div v-for="(range, index) in legendRanges" :key="index" class="flex items-center gap-2">
                            <div class="w-4 h-4 rounded border" :style="{ backgroundColor: range.color }"></div>
                            <span class="text-xs text-gray-600">{{ range.label }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Current Metric Stats -->
                      <div class="bg-gray-50 rounded-lg p-3">
                        <h5 class="text-sm font-medium text-gray-700 mb-2">
                          {{ formatMetricName(selectedMetric) }} ({{ selectedAgeGroup }} years)
                        </h5>
                        <div class="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span class="text-gray-600">Total:</span>
                            <span class="font-semibold ml-1">{{ totalCurrentMetric.toLocaleString() }}</span>
                          </div>
                          <div>
                            <span class="text-gray-600">Average:</span>
                            <span class="font-semibold ml-1">{{ averageCurrentMetric.toLocaleString() }}</span>
                          </div>
                          <div>
                            <span class="text-gray-600">Highest:</span>
                            <span class="font-semibold ml-1">{{ highestState.value.toLocaleString() }}</span>
                          </div>
                          <div>
                            <span class="text-gray-600">Lowest:</span>
                            <span class="font-semibold ml-1">{{ lowestState.value.toLocaleString() }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Top Performers -->
                      <div>
                        <h5 class="text-sm font-medium text-gray-700 mb-2">Top 3 States</h5>
                        <div class="space-y-1">
                          <div
                            v-for="(state, index) in topStates"
                            :key="state.name"
                            class="flex items-center justify-between text-sm"
                          >
                            <div class="flex items-center gap-2">
                              <span
                                class="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center"
                              >
                                {{ index + 1 }}
                              </span>
                              <span class="font-medium">{{ state.name }}</span>
                            </div>
                            <span class="text-gray-600">{{ state.value.toLocaleString() }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VaCardContent>
  </VaCard>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { VaCard, VaSelect, VaButton, VaIcon } from 'vuestic-ui'
import IndiaStateMap from '../../../../components/maps/IndiaStateMap.vue'
import { downloadAsCSV } from '../../../../services/toCSV'
import { statsApi, type StateWiseData } from '@/services/statsApi'
import {
  earningsColor,
  expensesColor,
  months,
  generateRevenues,
  getRevenuePerMonth,
  // formatMoney,
} from '../../../../data/charts/revenueChartData'

const revenues = generateRevenues(months)

const currentYear = new Date().getFullYear()
const monthsWithCurrentYear = months.map((month) => `${month} ${currentYear}`)

const selectedMonth = ref(monthsWithCurrentYear[0])

const earningsForSelectedMonth = computed(() => getRevenuePerMonth(selectedMonth.value.split(' ')[0], revenues))
const totalVerifications = computed(() => {
  return earningsForSelectedMonth.value.earning + earningsForSelectedMonth.value.expenses
})

const exportAsCSV = () => {
  downloadAsCSV(revenues, 'revenue-report')
}

// State-wise race data for BarChartRace
const stateWiseRaceData = ref<Record<string, Array<{ name: string; value: number; color: string }>>>({})
const pythonBackendConnected = ref(false)

// Map-related data
const selectedMetric = ref('DLC_success')
const selectedAgeGroup = ref('60-79')
const showStatsPopup = ref(false)

// Metric options for dropdown
const metricOptions = ['pensioner_count', 'DLC_potential', 'DLC_success', 'DLC_failed']

// Age group options
const ageGroupOptions = ['60-79', '80+']

// Real state-wise data from backend
const stateWiseData = ref<StateWiseData[]>([])

// Processed state data for map visualization
const processedStateData = computed(() => {
  const result: Record<string, number> = {}
  // Map selected metric to appropriate field from backend response
  // pensioner_count -> totalPensioners
  // DLC_potential   -> totalPensioners (proxy until backend provides potential)
  // DLC_success     -> verified
  // DLC_failed      -> pending
  stateWiseData.value.forEach((row) => {
    let value = 0
    switch (selectedMetric.value) {
      case 'pensioner_count':
        value = row.totalPensioners
        break
      case 'DLC_potential':
        value = row.totalPensioners
        break
      case 'DLC_success':
        value = row.verified
        break
      case 'DLC_failed':
        value = row.pending
        break
      default:
        value = row.totalPensioners
    }
    result[row.state] = value
  })
  return result
})

// Legend ranges for map
const legendRanges = computed(() => {
  const values = Object.values(processedStateData.value)
  if (values.length === 0) return []

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min
  const step = range / 4

  return [
    { color: '#fee2e2', label: `${min.toLocaleString()} - ${Math.round(min + step).toLocaleString()}` },
    {
      color: '#fecaca',
      label: `${Math.round(min + step).toLocaleString()} - ${Math.round(min + step * 2).toLocaleString()}`,
    },
    {
      color: '#f87171',
      label: `${Math.round(min + step * 2).toLocaleString()} - ${Math.round(min + step * 3).toLocaleString()}`,
    },
    { color: '#dc2626', label: `${Math.round(min + step * 3).toLocaleString()} - ${max.toLocaleString()}` },
  ]
})

// Stats popup computed properties
const totalCurrentMetric = computed(() => {
  const values = Object.values(processedStateData.value)
  return values.reduce((sum, val) => sum + val, 0)
})

const averageCurrentMetric = computed(() => {
  const values = Object.values(processedStateData.value).filter((v) => v > 0)
  return values.length > 0 ? Math.round(values.reduce((sum, val) => sum + val, 0) / values.length) : 0
})

const highestState = computed(() => {
  const entries = Object.entries(processedStateData.value)
  const highest = entries.reduce((max, [state, value]) => (value > max.value ? { name: state, value } : max), {
    name: '',
    value: 0,
  })
  return highest
})

const lowestState = computed(() => {
  const entries = Object.entries(processedStateData.value).filter(([_, value]) => value > 0)
  if (entries.length === 0) return { name: '', value: 0 }
  const lowest = entries.reduce((min, [state, value]) => (value < min.value ? { name: state, value } : min), {
    name: entries[0][0],
    value: entries[0][1],
  })
  return lowest
})

const topStates = computed(() => {
  return Object.entries(processedStateData.value)
    .filter(([_, value]) => value > 0)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3)
    .map(([name, value]) => ({ name, value }))
})

// Helper functions
function formatMetricName(metric: string) {
  const names: Record<string, string> = {
    pensioner_count: 'Pensioners',
    DLC_potential: 'DLC Potential',
    DLC_success: 'DLC Success',
    DLC_failed: 'DLC Failed',
  }
  return names[metric] || metric
}

function toggleStatsPopup() {
  showStatsPopup.value = !showStatsPopup.value
}

// State colors for consistency
const stateColors: Record<string, string> = {
  'Uttar Pradesh': '#3b82f6',
  Maharashtra: '#ef4444',
  Bihar: '#10b981',
  'West Bengal': '#f59e0b',
  'Madhya Pradesh': '#8b5cf6',
  'Tamil Nadu': '#06b6d4',
  Rajasthan: '#84cc16',
  Karnataka: '#f97316',
  Gujarat: '#ec4899',
  'Andhra Pradesh': '#6366f1',
}

// Mock data generator kept for fallback of race chart (if used later)
const getMockStateData = () => {
  const states = Object.keys(stateColors)
  const months = ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024']
  const data: Record<string, Array<{ name: string; value: number; color: string }>> = {}
  const baseValues: Record<string, number> = {}
  states.forEach((state) => {
    baseValues[state] = Math.floor(Math.random() * 15000) + 5000
  })
  months.forEach((month, index) => {
    data[month] = []
    states.forEach((state) => {
      const growth = 1 + index * 0.15 + (Math.random() - 0.5) * 0.2
      const value = Math.floor(baseValues[state] * growth)
      data[month].push({ name: state, value, color: stateColors[state] })
    })
    data[month] = data[month].sort((a, b) => b.value - a.value).slice(0, 8)
  })
  return data
}

// Load state-wise data from Flask backend
const loadStateWiseData = async () => {
  try {
    console.log('🔍 Fetching state-wise data from Flask backend...')
    const data = await statsApi.getStateWiseData()
    stateWiseData.value = data
    pythonBackendConnected.value = data.length > 0
    console.log('✅ State-wise data loaded:', data)
  } catch (error) {
    console.error('❌ Failed to load state-wise data:', error)
    stateWiseData.value = []
    pythonBackendConnected.value = false
  }
}

// Load data on mount
onMounted(async () => {
  console.log('🔄 Loading state-wise data...')
  await loadStateWiseData()
  console.log('📊 State data loaded:', stateWiseData.value)
})
</script>

<style scoped>
/* Stats popup animations */
.stats-popup-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stats-popup-leave-active {
  transition: all 0.2s ease-in;
}

.stats-popup-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.stats-popup-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.stats-popup-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

/* Hover effects for stats items */
.stats-popup-card .grid > div {
  transition: background-color 0.2s ease;
}

.stats-popup-card .grid > div:hover {
  background-color: rgba(59, 130, 246, 0.05);
  border-radius: 4px;
  padding: 2px 4px;
}

/* Top states list animations */
.stats-popup-card .space-y-1 > div {
  transition: all 0.2s ease;
}

.stats-popup-card .space-y-1 > div:hover {
  background-color: rgba(59, 130, 246, 0.05);
  border-radius: 6px;
  padding: 4px 8px;
  margin: 0 -8px;
}
</style>
