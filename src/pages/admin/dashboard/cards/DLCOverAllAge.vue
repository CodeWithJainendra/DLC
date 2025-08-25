<template>
  <VaCard class="cursor-pointer" @click="openModal">
    <VaCardTitle class="pb-0!">
      <h1 class="card-title text-secondary font-bold uppercase">DLC Status - Over All Age-wise</h1>
      <div class="text-xs text-secondary">Total : {{ totalPensioners.toLocaleString() }}</div>
    </VaCardTitle>
    <VaCardContent class="flex flex-row gap-1">
      <section class="w-1/2">
        <div v-if="isLoading" class="flex items-center justify-center py-4">
          <VaProgressCircle indeterminate size="small" />
        </div>
        <div v-else class="my-2 gap-1 flex flex-col text-xs">
          <div v-for="(group, index) in ageGroupsDisplay" :key="group.label" class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="inline-block w-2 h-2 mr-2" :style="{ backgroundColor: group.color }"></span>
              <span class="text-secondary">{{ group.label }}</span>
            </div>
            <span class="font-semibold">{{ group.count.toLocaleString() }}</span>
          </div>
        </div>
      </section>
      <div class="w-1/2 flex items-center h-full flex-1 lg:pl-16 pl-2 -mr-1 chart-wrapper">
        <div class="chart-container">
          <VaChart
            v-if="dlcChartData && !isLoading"
            :data="dlcChartData"
            class="chart chart--donut h-[90px] w-[90px]"
            type="doughnut"
            :options="options"
          />
        </div>
      </div>
    </VaCardContent>
  </VaCard>

  <!-- Modal Popup -->
  <VaModal v-model="showModal" size="large" :mobile-fullscreen="false" class="resize-modal">
    <template #header>
      <h2 class="text-xl font-bold">DLC Status - Over All Age-wise (Detailed View)</h2>
    </template>

    <div class="flex flex-col gap-6 p-4">
      <!-- Summary Section -->
      <div class="bg-blue-50 p-4 rounded-lg">
        <div class="text-2xl font-bold mb-2">Total Pensioners: {{ totalPensioners.toLocaleString() }}</div>
        <div class="text-sm text-gray-600">
          Age distribution based on birth year data from {{ new Date().getFullYear() }}
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Age Groups List -->
        <div class="lg:w-1/2">
          <h3 class="text-lg font-semibold mb-4">Age Group Breakdown</h3>
          <div v-if="isLoading" class="flex items-center justify-center py-8">
            <VaProgressCircle indeterminate />
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="(group, index) in ageGroupsDisplay"
              :key="group.label"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center">
                <span class="inline-block w-4 h-4 mr-3 rounded" :style="{ backgroundColor: group.color }"></span>
                <div>
                  <span class="font-medium text-lg">{{ group.label }}</span>
                  <div class="text-sm text-gray-600">{{ group.percentage }}% of total</div>
                </div>
              </div>
              <div class="text-right">
                <span class="font-bold text-xl">{{ group.count.toLocaleString() }}</span>
                <div class="text-sm text-gray-500">pensioners</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chart Section -->
        <div class="lg:w-1/2 flex flex-col items-center justify-center">
          <h3 class="text-lg font-semibold mb-4">Visual Distribution</h3>
          <VaChart
            v-if="dlcChartData && !isLoading"
            :data="dlcChartData"
            class="chart chart--donut h-[300px] w-[300px]"
            type="doughnut"
            :options="modalOptions"
          />
          <div v-if="isLoading" class="flex items-center justify-center h-[300px] w-[300px]">
            <VaProgressCircle indeterminate size="large" />
          </div>
        </div>
      </div>

      <!-- Additional Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div class="bg-green-50 p-4 rounded-lg text-center">
          <div class="text-2xl font-bold text-green-600">{{ averageAge.toFixed(1) }}</div>
          <div class="text-sm text-gray-600">Average Age</div>
        </div>
        <div class="bg-blue-50 p-4 rounded-lg text-center">
          <div class="text-2xl font-bold text-blue-600">{{ oldestAge }}</div>
          <div class="text-sm text-gray-600">Oldest Pensioner</div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg text-center">
          <div class="text-2xl font-bold text-purple-600">{{ youngestAge }}</div>
          <div class="text-sm text-gray-600">Youngest Pensioner</div>
        </div>
      </div>
    </div>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { VaCard, VaModal, VaProgressCircle } from 'vuestic-ui'
import VaChart from '../../../../components/va-charts/VaChart.vue'
import { useChartData } from '../../../../data/charts/composables/useChartData'
import { doughnutConfig } from '../../../../components/va-charts/vaChartConfigs'
import { ChartOptions } from 'chart.js'
import { pensionersApi } from '../../../../services/pensionersApi'

// Modal and loading state
const showModal = ref(false)
const isLoading = ref(true)
const ageDistribution = ref<Record<string, number>>({})
const totalPensioners = ref(0)
const allPensioners = ref<any[]>([])

// Age group colors and labels
const ageGroupConfig = [
  { key: '60-65', label: '60-65 years', color: '#4CAF50' },
  { key: '66-70', label: '66-70 years', color: '#2196F3' },
  { key: '71-75', label: '71-75 years', color: '#FF9800' },
  { key: '76-80', label: '76-80 years', color: '#9C27B0' },
  { key: '81-85', label: '81-85 years', color: '#F44336' },
  { key: '86+', label: '86+ years', color: '#795548' },
]

// Computed properties for display
const ageGroupsDisplay = computed(() => {
  return ageGroupConfig
    .map((config) => {
      const count = ageDistribution.value[config.key] || 0
      const percentage = totalPensioners.value > 0 ? ((count / totalPensioners.value) * 100).toFixed(1) : '0.0'
      return {
        ...config,
        count,
        percentage,
      }
    })
    .filter((group) => group.count > 0)
})

// Chart data
const dlcChartData = computed(() => {
  if (Object.keys(ageDistribution.value).length === 0) return null

  const validGroups = ageGroupsDisplay.value
  const chartData = {
    labels: validGroups.map((group) => group.label),
    datasets: [
      {
        data: validGroups.map((group) => group.count),
        backgroundColor: validGroups.map((group) => group.color),
        borderWidth: 0,
      },
    ],
  }

  return useChartData(chartData).value
})

// Age statistics
const averageAge = computed(() => {
  if (allPensioners.value.length === 0) return 0
  const currentYear = new Date().getFullYear()
  const totalAge = allPensioners.value.reduce((sum, pensioner) => {
    return sum + (currentYear - pensioner.pensioner_YearOfBirth)
  }, 0)
  return totalAge / allPensioners.value.length
})

const oldestAge = computed(() => {
  if (allPensioners.value.length === 0) return 0
  const currentYear = new Date().getFullYear()
  return Math.max(...allPensioners.value.map((p) => currentYear - p.pensioner_YearOfBirth))
})

const youngestAge = computed(() => {
  if (allPensioners.value.length === 0) return 0
  const currentYear = new Date().getFullYear()
  return Math.min(...allPensioners.value.map((p) => currentYear - p.pensioner_YearOfBirth))
})

// Load real data from API
const loadAgeData = async () => {
  try {
    isLoading.value = true
    const response = await pensionersApi.getPensioners()
    const pensioners = response.DLC_generated_pensioners || []

    allPensioners.value = pensioners
    totalPensioners.value = pensioners.length
    ageDistribution.value = pensionersApi.getAgeDistribution(pensioners)

    console.log('Age distribution loaded:', ageDistribution.value)
    console.log('Total pensioners:', totalPensioners.value)
  } catch (error) {
    console.error('Error loading age data:', error)
    // The API service already handles fallback data, so this shouldn't happen
    // But if it does, set reasonable defaults
    ageDistribution.value = {
      '60-65': 0,
      '66-70': 0,
      '71-75': 0,
      '76-80': 0,
      '81-85': 0,
      '86+': 0,
    }
    totalPensioners.value = 0
    allPensioners.value = []
  } finally {
    isLoading.value = false
  }
}

// Load data on component mount
onMounted(() => {
  loadAgeData()
})

const options: ChartOptions<'doughnut'> = {
  ...doughnutConfig,
  plugins: {
    ...doughnutConfig.plugins,
    tooltip: {
      enabled: true,
      position: 'nearest',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderWidth: 0,
      cornerRadius: 3,
      padding: 3,
      displayColors: false,
      titleFont: {
        size: 7,
      },
      bodyFont: {
        size: 7,
      },
      caretSize: 3,
      callbacks: {
        title: function () {
          return ''
        },
        label: function (context) {
          const label = context.label || ''
          const value = context.parsed
          const total = context.dataset.data.reduce((acc: number, val: number) => acc + val, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return `${label}: ${percentage}%`
        },
      },
    },
    legend: {
      display: false,
    },
  },
  circumference: 360,
  cutout: '70%',
  interaction: {
    intersect: false,
    mode: 'nearest',
  },
}

const modalOptions: ChartOptions<'doughnut'> = {
  ...doughnutConfig,
  plugins: {
    ...doughnutConfig.plugins,
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderWidth: 0,
      cornerRadius: 3,
      padding: 4,
      displayColors: false,
      titleFont: {
        size: 10,
      },
      bodyFont: {
        size: 10,
      },
      callbacks: {
        title: function () {
          return ''
        },
        label: function (context) {
          const label = context.label || ''
          const value = context.parsed
          const total = context.dataset.data.reduce((acc: number, val: number) => acc + val, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return `${label}: ${value.toLocaleString()} (${percentage}%)`
        },
      },
    },
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        padding: 15,
        usePointStyle: true,
        font: {
          size: 12,
        },
      },
    },
  },
  circumference: 360,
  cutout: '60%',
}

const openModal = async () => {
  showModal.value = true
  // Refresh data when modal opens if needed
  if (Object.keys(ageDistribution.value).length === 0) {
    await loadAgeData()
  }
}
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  overflow: visible !important;
}

.chart-container {
  position: relative;
  overflow: visible !important;
  z-index: 1000;
}

:deep(.chart) {
  overflow: visible !important;
  position: relative;
  z-index: 1000;
}

:deep(.chart canvas) {
  overflow: visible !important;
}

/* Force card and content to allow overflow */
:deep(.va-card) {
  overflow: visible !important;
  position: relative;
  z-index: 1;
}

:deep(.va-card-content) {
  overflow: visible !important;
  position: relative;
  z-index: 1;
}

/* Modal resizing */
.resize-modal :deep(.va-modal__dialog) {
  resize: both;
  overflow: auto;
  min-width: 600px;
  min-height: 400px;
  max-width: 95vw;
  max-height: 95vh;
}

.resize-modal :deep(.va-modal__dialog):after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background: linear-gradient(-45deg, transparent 0%, transparent 40%, #ccc 40%, #ccc 60%, transparent 60%);
  cursor: nw-resize;
  pointer-events: none;
}

/* Global tooltip fix */
:global(.chartjs-tooltip) {
  z-index: 99999 !important;
  font-size: 10px !important;
  padding: 8px !important;
  max-width: 200px !important;
  word-wrap: break-word !important;
}
</style>
