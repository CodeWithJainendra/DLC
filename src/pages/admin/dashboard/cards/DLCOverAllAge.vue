<template>
  <VaCard class="cursor-pointer" @click="openModal">
    <VaCardTitle class="pb-0!">
      <h1 class="card-title text-secondary font-bold uppercase">DLC Status - Over All Age-wise</h1>
      <div class="text-xs text-secondary">Total : {{ totalPensioners.toLocaleString() }}</div>
    </VaCardTitle>
    <VaCardContent class="flex flex-row gap-1">
      <section class="w-1/2">
        <div class="my-2 gap-1 flex flex-col text-xs">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="inline-block w-2 h-2 mr-2" style="background-color: #ff9800"></span>
              <span class="text-secondary">Below 60</span>
            </div>
            <span class="font-semibold">{{ realAgeData['Below 60'].toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="inline-block w-2 h-2 mr-2" style="background-color: #8bc34a"></span>
              <span class="text-secondary">60-65</span>
            </div>
            <span class="font-semibold">{{ realAgeData['60-65'].toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="inline-block w-2 h-2 mr-2" style="background-color: #795548"></span>
              <span class="text-secondary">Above 65</span>
            </div>
            <span class="font-semibold">{{ realAgeData['Above 65'].toLocaleString() }}</span>
          </div>
        </div>
      </section>
      <div class="w-1/2 flex items-center h-full flex-1 lg:pl-16 pl-2 -mr-1 chart-wrapper">
        <div class="chart-container">
          <VaChart
            v-if="dlcChartData"
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
  <VaModal v-model="showModal" size="large" :mobile-fullscreen="false">
    <template #header>
      <h2 class="text-xl font-bold">DLC Status - Over All Age-wise (Detailed View)</h2>
    </template>

    <div class="flex flex-col lg:flex-row gap-6 p-4">
      <div class="lg:w-1/2">
        <div class="text-2xl font-bold mb-4">Total: 1,19,086</div>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div class="flex items-center">
              <span class="inline-block w-4 h-4 mr-3 rounded" style="background-color: #ff9800"></span>
              <span class="font-medium">Below 60</span>
            </div>
            <span class="font-bold text-lg">{{ realAgeData['Below 60'].toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div class="flex items-center">
              <span class="inline-block w-4 h-4 mr-3 rounded" style="background-color: #8bc34a"></span>
              <span class="font-medium">60-65</span>
            </div>
            <span class="font-bold text-lg">{{ realAgeData['60-65'].toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div class="flex items-center">
              <span class="inline-block w-4 h-4 mr-3 rounded" style="background-color: #795548"></span>
              <span class="font-medium">Above 65</span>
            </div>
            <span class="font-bold text-lg">{{ realAgeData['Above 65'].toLocaleString() }}</span>
          </div>
        </div>
      </div>
      <div class="lg:w-1/2 flex items-center justify-center">
        <VaChart
          v-if="dlcChartData"
          :data="dlcChartData"
          class="chart chart--donut h-[300px] w-[300px]"
          type="doughnut"
          :options="modalOptions"
        />
      </div>
    </div>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { VaCard, VaModal } from 'vuestic-ui'
import VaChart from '../../../../components/va-charts/VaChart.vue'
import { useChartData } from '../../../../data/charts/composables/useChartData'
import { doughnutConfig } from '../../../../components/va-charts/vaChartConfigs'
import { ChartOptions } from 'chart.js'
import { pensionersApi } from '../../../../services/pensionersApi'


// Modal state
const showModal = ref(false)

// Real API data
const isLoading = ref(false)
const realAgeData = ref<Record<string, number>>({
  'Below 60': 0,
  '60-65': 0,
  'Above 65': 0
})
const totalPensioners = ref(0)

// Load real data from API
const loadRealData = async () => {
  try {
    isLoading.value = true
    console.log('🔄 Loading real age-wise data from API...')

    const response = await pensionersApi.getPensioners()
    const pensioners = response.DLC_generated_pensioners || []

    console.log(`📊 Loaded ${pensioners.length} pensioners from API`)

    // Calculate age distribution
    const currentYear = new Date().getFullYear()
    const ageStats = {
      'Below 60': 0,
      '60-65': 0,
      'Above 65': 0
    }

    pensioners.forEach((pensioner: any) => {
      const age = currentYear - pensioner.pensioner_YearOfBirth
      if (age < 60) {
        ageStats['Below 60']++
      } else if (age >= 60 && age <= 65) {
        ageStats['60-65']++
      } else {
        ageStats['Above 65']++
      }
    })

    realAgeData.value = ageStats
    totalPensioners.value = pensioners.length

    console.log('📊 Age distribution processed:', ageStats)

  } catch (error) {
    console.error('❌ Error loading age data:', error)
    // Show zeros instead of fallback data
    realAgeData.value = {
      'Below 60': 0,
      '60-65': 0,
      'Above 65': 0
    }
    totalPensioners.value = 0
  } finally {
    isLoading.value = false
  }
}

// Dynamic chart data based on real API data
const dlcChartData = computed(() => {
  const chartData = {
    labels: ['Below 60', '60-65', 'Above 65'],
    datasets: [
      {
        data: [
          realAgeData.value['Below 60'],
          realAgeData.value['60-65'],
          realAgeData.value['Above 65']
        ],
        backgroundColor: ['#FF9800', '#8BC34A', '#795548'],
        borderWidth: 0,
      },
    ],
  }
  return useChartData(chartData)
})

// Load data on component mount
onMounted(() => {
  loadRealData()
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
        size: 7
      },
      bodyFont: {
        size: 7
      },
      caretSize: 3,
      callbacks: {
        title: function() {
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
        size: 8
      },
      bodyFont: {
        size: 8
      },
      callbacks: {
        title: function() {
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
    },
  },
  circumference: 360,
  cutout: '60%',
}

const openModal = () => {
  showModal.value = true
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

/* Global tooltip fix */
:global(.chartjs-tooltip) {
  z-index: 99999 !important;
  font-size: 7px !important;
  padding: 3px !important;
  max-width: 80px !important;
  word-wrap: break-word !important;
}
</style>
