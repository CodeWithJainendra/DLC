<template>
  <VaCard class="cursor-pointer dlc-status-card h-full" @click="openModal">
    <VaCardTitle class="pb-1 px-4 pt-3 flex-shrink-0">
      <h1 class="text-sm font-bold text-secondary uppercase">DLC STATUS</h1>
      <div class="text-lg font-bold text-primary">State-wise</div>
      <div class="flex items-center gap-1 text-xs text-success">
        <VaIcon v-if="isLoading" name="refresh" size="12px" class="animate-spin" />
        <VaIcon v-else name="trending_up" size="12px" />
        <span>Total: {{ totalPensioners.toLocaleString() }}</span>
      </div>
      <div class="text-xs text-secondary opacity-70 mt-1">Click for detailed view</div>
    </VaCardTitle>
    <VaCardContent class="flex-1 p-0 overflow-hidden">
      <!-- Full Card Bar Chart Race -->
      <div class="h-full w-full px-3 py-2">
        <BarChartRace
          :data="stateWiseRaceData"
          :max-bars="6"
          :animation-speed="1500"
          width="100%"
          height="100%"
          :show-time-indicator="false"
        />
      </div>
    </VaCardContent>
  </VaCard>

  <!-- Modal Popup -->
  <VaModal
    v-model="showModal"
    size="large"
    :mobile-fullscreen="true"
    max-height="95vh"
    :close-on-click-outside="true"
    :hide-default-actions="false"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">DLC Status Charts</h2>
        <button 
          @click="refreshData" 
          class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          <VaIcon name="refresh" size="14px" class="mr-1" />
          Refresh Data
        </button>
      </div>
    </template>

    <div class="modal-body" style="min-height: 800px; max-height: 90vh; overflow-y: auto">
      <!-- State-wise Chart Section -->
      <div class="chart-wrapper" style="border: 2px solid orange">
        <div class="chart-header">
          <h3 class="chart-title">DLC Status : State-wise</h3>
          <p style="color: orange; font-size: 12px">Debug: First chart container</p>
        </div>
        <div class="chart-box" style="border: 1px solid purple">
          <canvas
            id="stateWiseChart"
            ref="stateWiseCanvas"
            style="width: 100%; height: 300px; border: 1px solid yellow"
          ></canvas>
          <p style="color: purple; font-size: 10px">Debug: Canvas element for first chart</p>
        </div>
      </div>

      <!-- Divider -->
      <div
        style="
          height: 30px;
          background: linear-gradient(90deg, red, blue);
          margin: 20px 0;
          text-align: center;
          color: white;
          line-height: 30px;
          font-weight: bold;
        "
      >
        === SECOND CHART SHOULD BE BELOW ===
      </div>

      <!-- Over All State-wise Chart Section -->
      <div style="background: red; padding: 20px; margin: 20px 0; border: 5px solid black">
        <h3 style="color: white; font-size: 20px; text-align: center">DLC Status : Over All State-wise</h3>
        <p style="color: yellow; font-size: 14px; text-align: center">
          🔴 SECOND CHART CONTAINER - SHOULD BE VISIBLE 🔴
        </p>
        <div style="background: white; padding: 10px; margin: 10px 0">
          <canvas
            id="overAllChart"
            ref="overAllCanvas"
            style="width: 100%; height: 400px; border: 3px solid green; background: lightblue"
          ></canvas>
          <p style="color: black; font-size: 12px; text-align: center">🟢 CANVAS ELEMENT FOR SECOND CHART 🟢</p>
        </div>
      </div>
    </div>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue'
import { VaCard, VaModal } from 'vuestic-ui'
import BarChartRace from '../../../../components/charts/BarChartRace.vue'
// import { useChartData } from '../../../../data/charts/composables/useChartData'
// import { doughnutConfig } from '../../../../components/va-charts/vaChartConfigs'
// import { ChartOptions } from 'chart.js'
// import { externalTooltipHandler } from '../../../../components/va-charts/external-tooltip'
import { Chart, registerables } from 'chart.js'
import { pensionersApi } from '../../../../services/pensionersApi'

// Register Chart.js components
Chart.register(...registerables)

// Modal state
const showModal = ref(false)

// Canvas references
const stateWiseCanvas = ref<HTMLCanvasElement | null>(null)
const overAllCanvas = ref<HTMLCanvasElement | null>(null)

// Chart instances
let stateWiseChart: Chart | null = null
let overAllChart: Chart | null = null

// Real data from API
const realStateWiseData = ref<Record<string, number>>({})
const realOverAllData = ref<Record<string, number>>({})
const isLoading = ref(false)
const totalPensioners = ref(0)

// DLC Age-wise data
/* const ageWiseData = {
  labels: ['Above 60', 'Below 60'],
  datasets: [
    {
      data: [66753, 52333],
      backgroundColor: ['#4CAF50', '#673AB7'],
      borderWidth: 0,
    },
  ],
} */

// DLC Over All Age-wise data
/* const overAllAgeData = {
  labels: ['Below 60', '60-65', 'Above 65'],
  datasets: [
    {
      data: [66753, 26144, 26189],
      backgroundColor: ['#FF9800', '#8BC34A', '#795548'],
      borderWidth: 0,
    },
  ],
} */

// const ageWiseChartData = useChartData(ageWiseData)
// const overAllAgeChartData = useChartData(overAllAgeData)

// Load real data from API
const loadRealData = async () => {
  try {
    isLoading.value = true
    console.log('🔄 Loading real DLC data from API...')
    
    const response = await pensionersApi.getPensioners()
    const pensioners = response.DLC_generated_pensioners || []
    
    console.log(`📊 Loaded ${pensioners.length} pensioners from API`)
    
    // Get state-wise data
    const stateData = pensionersApi.getStateWiseData(pensioners)
    realStateWiseData.value = stateData
    
    // Calculate total
    totalPensioners.value = pensioners.length
    
    // Generate over all data (same as state-wise for now, but could be different logic)
    realOverAllData.value = { ...stateData }
    
    console.log('📊 Real API data processed:')
    console.log('  Total pensioners:', totalPensioners.value)
    console.log('  State-wise data:', realStateWiseData.value)
    console.log('  Over-all data:', realOverAllData.value)
    
    // Update race data with real data
    stateWiseRaceData.value = getStateWiseRaceData()
    
    console.log('✅ Real DLC data loaded:', {
      totalPensioners: totalPensioners.value,
      stateData: realStateWiseData.value,
      overAllData: realOverAllData.value,
      raceData: stateWiseRaceData.value
    })
    
  } catch (error) {
    console.error('❌ Error loading real DLC data:', error)
    // The API service already handles fallback data, so this shouldn't happen
    realStateWiseData.value = {}
    realOverAllData.value = {}
    totalPensioners.value = 0
  } finally {
    isLoading.value = false
  }
}

// Load data on component mount
onMounted(async () => {
  console.log('🔄 DLCStatus component mounted, loading real data...')
  await loadRealData()
  console.log('✅ Real data loaded in DLCStatus component')
})

// Refresh DLC data function
const refreshData = async () => {
  console.log('🔄 Refreshing DLC data...')
  try {
    await loadRealData()
    // Recreate charts if modal is open
    if (showModal.value) {
      setTimeout(() => {
        createCharts()
      }, 100)
    }
    console.log('✅ DLC data refreshed successfully')
  } catch (error) {
    console.error('❌ Error refreshing DLC data:', error)
  }
}

// Watch for real data changes and update charts
watch([realStateWiseData, realOverAllData], () => {
  console.log('🔄 Real data changed, updating charts...')
  console.log('State-wise data:', realStateWiseData.value)
  console.log('Over-all data:', realOverAllData.value)
  
  // Update race data
  stateWiseRaceData.value = getStateWiseRaceData()
  
  // If modal is open, recreate charts
  if (showModal.value) {
    setTimeout(() => {
      createCharts()
    }, 100)
  }
  
  // Also update the card display immediately
  console.log('📊 Updated total pensioners:', totalPensioners.value)
}, { deep: true })

// State-wise DLC Status data for bar chart race - Using Real API Data
const getStateWiseRaceData = () => {
  const stateData = realStateWiseData.value
  const colors = [
    '#4FC3F7', '#81C784', '#FFB74D', '#F06292', '#BA68C8',
    '#FF8A65', '#A1C181', '#F8BBD9', '#B39DDB', '#FFCC02'
  ]
  
  // Convert state data to race format
  const sortedStates = Object.entries(stateData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([state, count], index) => ({
      name: state,
      value: count,
      color: colors[index % colors.length]
    }))
  
  return {
    'Current Data': sortedStates
  }
}

const stateWiseRaceData = ref(getStateWiseRaceData())

/* const options: ChartOptions<'doughnut'> = {
  ...doughnutConfig,
  plugins: {
    ...doughnutConfig.plugins,
    tooltip: {
      enabled: false,
      position: 'nearest',
      external: externalTooltipHandler,
    },
    legend: {
      display: false,
    },
  },
  circumference: 360,
  cutout: '70%',
} */

// State-wise Chart Data for Modal - Using Real API Data
const getStateWiseChartData = () => {
  const stateData = realStateWiseData.value
  console.log('🔍 getStateWiseChartData called with stateData:', stateData)
  
  const sortedStates = Object.entries(stateData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10) // Top 10 states
  
  const colors = [
    '#4FC3F7', '#81C784', '#FFB74D', '#F06292', '#BA68C8',
    '#FF8A65', '#A1C181', '#F8BBD9', '#B39DDB', '#FFCC02'
  ]
  
  return {
    labels: sortedStates.map(([state]) => state),
    datasets: [
      {
        label: 'DLC Status',
        data: sortedStates.map(([, count]) => count),
        backgroundColor: colors.slice(0, sortedStates.length),
        borderColor: colors.slice(0, sortedStates.length),
        borderWidth: 1,
      },
    ],
  }
}

// Over All State-wise Chart Data for Modal - Using Real API Data
const getOverAllStateChartData = () => {
  const overAllData = realOverAllData.value
  const sortedStates = Object.entries(overAllData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15) // Top 15 states
  
  const colors = [
    '#4FC3F7', '#81C784', '#FFB74D', '#F06292', '#BA68C8',
    '#FF8A65', '#A1C181', '#F8BBD9', '#B39DDB', '#FFCC02',
    '#FFAB91', '#C5E1A5', '#F48FB1', '#CE93D8', '#80CBC4'
  ]
  
  return {
    labels: sortedStates.map(([state]) => state),
    datasets: [
      {
        label: 'Over All DLC Status',
        data: sortedStates.map(([, count]) => count),
        backgroundColor: colors.slice(0, sortedStates.length),
        borderColor: colors.slice(0, sortedStates.length),
        borderWidth: 1,
      },
    ],
  }
}

// Bar Chart Options for State-wise
/* const stateWiseBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: function (context: any) {
          return `${context.label}: ${context.parsed.y.toLocaleString()}`
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 45,
        font: {
          size: 10,
        },
      },
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value: any) {
          return value.toLocaleString()
        },
      },
    },
  },
} */

// Bar Chart Options for Over All State-wise
/* const overAllStateBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: function (context: any) {
          return `${context.label}: ${context.parsed.y.toLocaleString()}`
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 45,
        font: {
          size: 10,
        },
      },
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value: any) {
          return value.toLocaleString()
        },
      },
    },
  },
} */

// Create charts function
const createCharts = async () => {
  await nextTick()

  console.log('🎨 Creating charts...')

  // Check if canvas elements exist in DOM
  const stateCanvasEl = document.getElementById('stateWiseChart')
  const overAllCanvasEl = document.getElementById('overAllChart')

  console.log('🎯 State-wise canvas in DOM:', !!stateCanvasEl, stateCanvasEl)
  console.log('🎯 Over all canvas in DOM:', !!overAllCanvasEl, overAllCanvasEl)
  console.log('📌 State-wise canvas ref:', !!stateWiseCanvas.value, stateWiseCanvas.value)
  console.log('📌 Over all canvas ref:', !!overAllCanvas.value, overAllCanvas.value)

  // Destroy existing charts
  if (stateWiseChart) {
    stateWiseChart.destroy()
  }
  if (overAllChart) {
    overAllChart.destroy()
  }

  // Create State-wise Chart
  const stateWiseCanvasElement =
    stateWiseCanvas.value || (document.getElementById('stateWiseChart') as HTMLCanvasElement)
  if (stateWiseCanvasElement) {
    console.log('Creating state-wise chart...')
    console.log('🔍 Current realStateWiseData:', realStateWiseData.value)
    console.log('🔍 Current realOverAllData:', realOverAllData.value)
    const ctx1 = stateWiseCanvasElement.getContext('2d')
    if (ctx1) {
      const stateWiseData = getStateWiseChartData()
      console.log('State-wise chart data:', stateWiseData)
      
      stateWiseChart = new Chart(ctx1, {
        type: 'bar',
        data: stateWiseData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              enabled: true,
              callbacks: {
                label: function (context: any) {
                  return `${context.label}: ${context.parsed.y.toLocaleString()}`
                },
              },
            },
          },
          scales: {
            x: {
              ticks: {
                maxRotation: 45,
                minRotation: 45,
                font: {
                  size: 10,
                },
              },
              grid: {
                display: false,
              },
            },
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value: any) {
                  return value.toLocaleString()
                },
              },
            },
          },
        },
      })
    }
  }

  // Create Over All State-wise Chart
  const overAllCanvasElement = overAllCanvas.value || (document.getElementById('overAllChart') as HTMLCanvasElement)
  if (overAllCanvasElement) {
    console.log('Creating over all chart...')
    console.log('Over all canvas element:', overAllCanvasElement)
    const ctx2 = overAllCanvasElement.getContext('2d')
    if (ctx2) {
      console.log('Over all context created successfully')
      const overAllData = getOverAllStateChartData()
      console.log('Over all chart data:', overAllData)
      
      overAllChart = new Chart(ctx2, {
        type: 'bar',
        data: overAllData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              enabled: true,
              callbacks: {
                label: function (context: any) {
                  return `${context.label}: ${context.parsed.y.toLocaleString()}`
                },
              },
            },
          },
          scales: {
            x: {
              ticks: {
                maxRotation: 45,
                minRotation: 45,
                font: {
                  size: 10,
                },
              },
              grid: {
                display: false,
              },
            },
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value: any) {
                  return value.toLocaleString()
                },
              },
            },
          },
        },
      })
      console.log('Over all chart created successfully')
    } else {
      console.error('Failed to get 2D context for over all canvas')
    }
  } else {
    console.error('Over all canvas not found')
  }

  console.log('Charts creation completed')
}

const openModal = async () => {
  console.log('🚀 Opening modal...')
  console.log('📊 Current real data - State-wise:', realStateWiseData.value)
  console.log('📈 Current real data - Over all:', realOverAllData.value)
  console.log('📊 State-wise data:', getStateWiseChartData())
  console.log('📈 Over all data:', getOverAllStateChartData())

  showModal.value = true
  console.log('✅ Modal state set to:', showModal.value)

  // Wait for DOM to be ready and create charts
  await nextTick()
  console.log('⏳ NextTick completed, waiting 500ms...')

  setTimeout(() => {
    console.log('🔧 Attempting to create charts...')
    console.log('👁️ Modal visible:', showModal.value)
    console.log('🎯 All canvas elements in DOM:', document.querySelectorAll('canvas').length)
    console.log(
      '📋 Canvas IDs found:',
      Array.from(document.querySelectorAll('canvas')).map((c) => c.id),
    )
    createCharts()
  }, 500)
}
</script>

<style scoped>
.dlc-status-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 350px;
}

.dlc-status-card :deep(.va-card__content) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 !important;
}

.dlc-status-card :deep(.va-card__title) {
  flex-shrink: 0;
}

/* Modal Styles */
.modal-body {
  padding: 1rem;
  max-height: 85vh;
  overflow-y: auto;
  background: #f8f9fa;
  min-height: 75vh;
}

.chart-wrapper {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 450px;
  display: block !important;
  visibility: visible !important;
}

.chart-header {
  margin-bottom: 1rem;
  text-align: center;
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.chart-box {
  width: 100%;
  height: 300px;
  position: relative;
  background: white;
  border-radius: 4px;
}

.chart-box canvas {
  width: 100% !important;
  height: 100% !important;
  max-width: 100%;
  max-height: 300px;
}

.chart-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #ddd, transparent);
  margin: 1rem 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-body {
    padding: 0.5rem;
    max-height: 85vh;
  }

  .chart-wrapper {
    padding: 1rem;
    margin-bottom: 0.5rem;
  }

  .chart-box {
    height: 250px;
  }

  .chart-box canvas {
    max-height: 250px;
  }

  .chart-title {
    font-size: 1.1rem;
  }
}
</style>
