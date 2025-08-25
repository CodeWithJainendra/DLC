<template>
  <VaCard class="pension-states-race-card">
    <VaCardContent class="p-0">
      <!-- Header Section -->
      <div
        class="card-header"
        style="
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #1d4ed8 100%) !important;
          color: white !important;
        "
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="header-icon">
              <VaIcon name="trending_up" size="24px" color="white" />
            </div>
            <div>
              <h1 class="card-title" style="color: white !important; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3)">
                PENSION VERIFICATION RACE
              </h1>
              <p class="card-subtitle" style="color: rgba(255, 255, 255, 0.9) !important; font-size: 12px">
                State-wise verification progress over time
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <VaButton
              preset="plain"
              color="white"
              size="small"
              :icon="isPlaying ? 'pause' : 'play_arrow'"
              @click="toggleAnimation"
            />
            <VaButton preset="plain" color="white" size="small" icon="replay" @click="resetAnimation" />
          </div>
        </div>
      </div>

      <!-- Chart Content -->
      <div class="chart-content p-4">
        <BarChartRace
          ref="chartRef"
          :data="pensionRaceData"
          :width="'100%'"
          :height="'300px'"
          :animation-speed="3000"
          :max-bars="8"
          :show-time-indicator="true"
        />
      </div>
    </VaCardContent>
  </VaCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BarChartRace from '../../../../components/charts/BarChartRace.vue'
import PythonApiService, { type BarChartRaceData } from '@/services/pythonApi'

const chartRef = ref<InstanceType<typeof BarChartRace> | null>(null)
const pythonBackendConnected = ref(false)

const isPlaying = computed(() => chartRef.value?.isPlaying || false)

// Sample pension verification data by state over time
const pensionRaceData = ref({
  'Jan 2024': [
    { name: 'Uttar Pradesh', value: 45000, color: '#3b82f6' },
    { name: 'Maharashtra', value: 38000, color: '#ef4444' },
    { name: 'Bihar', value: 32000, color: '#10b981' },
    { name: 'West Bengal', value: 28000, color: '#f59e0b' },
    { name: 'Madhya Pradesh', value: 25000, color: '#8b5cf6' },
    { name: 'Tamil Nadu', value: 22000, color: '#06b6d4' },
    { name: 'Rajasthan', value: 20000, color: '#84cc16' },
    { name: 'Karnataka', value: 18000, color: '#f97316' },
    { name: 'Gujarat', value: 15000, color: '#ec4899' },
    { name: 'Andhra Pradesh', value: 12000, color: '#6366f1' },
  ],
  'Feb 2024': [
    { name: 'Uttar Pradesh', value: 48000, color: '#3b82f6' },
    { name: 'Maharashtra', value: 42000, color: '#ef4444' },
    { name: 'Bihar', value: 35000, color: '#10b981' },
    { name: 'West Bengal', value: 31000, color: '#f59e0b' },
    { name: 'Madhya Pradesh', value: 28000, color: '#8b5cf6' },
    { name: 'Tamil Nadu', value: 26000, color: '#06b6d4' },
    { name: 'Rajasthan', value: 23000, color: '#84cc16' },
    { name: 'Karnataka', value: 21000, color: '#f97316' },
    { name: 'Gujarat', value: 18000, color: '#ec4899' },
    { name: 'Andhra Pradesh', value: 15000, color: '#6366f1' },
  ],
  'Mar 2024': [
    { name: 'Uttar Pradesh', value: 52000, color: '#3b82f6' },
    { name: 'Maharashtra', value: 46000, color: '#ef4444' },
    { name: 'Bihar', value: 39000, color: '#10b981' },
    { name: 'West Bengal', value: 35000, color: '#f59e0b' },
    { name: 'Tamil Nadu', value: 32000, color: '#06b6d4' },
    { name: 'Madhya Pradesh', value: 30000, color: '#8b5cf6' },
    { name: 'Rajasthan', value: 27000, color: '#84cc16' },
    { name: 'Karnataka', value: 25000, color: '#f97316' },
    { name: 'Gujarat', value: 22000, color: '#ec4899' },
    { name: 'Andhra Pradesh', value: 19000, color: '#6366f1' },
  ],
  'Apr 2024': [
    { name: 'Uttar Pradesh', value: 55000, color: '#3b82f6' },
    { name: 'Maharashtra', value: 50000, color: '#ef4444' },
    { name: 'Bihar', value: 43000, color: '#10b981' },
    { name: 'West Bengal', value: 38000, color: '#f59e0b' },
    { name: 'Tamil Nadu', value: 36000, color: '#06b6d4' },
    { name: 'Madhya Pradesh', value: 33000, color: '#8b5cf6' },
    { name: 'Karnataka', value: 30000, color: '#f97316' },
    { name: 'Rajasthan', value: 28000, color: '#84cc16' },
    { name: 'Gujarat', value: 26000, color: '#ec4899' },
    { name: 'Andhra Pradesh', value: 23000, color: '#6366f1' },
  ],
  'May 2024': [
    { name: 'Uttar Pradesh', value: 58000, color: '#3b82f6' },
    { name: 'Maharashtra', value: 54000, color: '#ef4444' },
    { name: 'Bihar', value: 47000, color: '#10b981' },
    { name: 'West Bengal', value: 42000, color: '#f59e0b' },
    { name: 'Tamil Nadu', value: 40000, color: '#06b6d4' },
    { name: 'Madhya Pradesh', value: 36000, color: '#8b5cf6' },
    { name: 'Karnataka', value: 34000, color: '#f97316' },
    { name: 'Rajasthan', value: 31000, color: '#84cc16' },
    { name: 'Gujarat', value: 29000, color: '#ec4899' },
    { name: 'Andhra Pradesh', value: 27000, color: '#6366f1' },
  ],
  'Jun 2024': [
    { name: 'Uttar Pradesh', value: 62000, color: '#3b82f6' },
    { name: 'Maharashtra', value: 58000, color: '#ef4444' },
    { name: 'Bihar', value: 51000, color: '#10b981' },
    { name: 'West Bengal', value: 46000, color: '#f59e0b' },
    { name: 'Tamil Nadu', value: 44000, color: '#06b6d4' },
    { name: 'Karnataka', value: 39000, color: '#f97316' },
    { name: 'Madhya Pradesh', value: 38000, color: '#8b5cf6' },
    { name: 'Rajasthan', value: 35000, color: '#84cc16' },
    { name: 'Gujarat', value: 33000, color: '#ec4899' },
    { name: 'Andhra Pradesh', value: 31000, color: '#6366f1' },
  ],
})

const toggleAnimation = () => {
  if (chartRef.value) {
    if (isPlaying.value) {
      chartRef.value.stopAnimation()
    } else {
      chartRef.value.startAnimation()
    }
  }
}

const resetAnimation = () => {
  if (chartRef.value) {
    chartRef.value.stopAnimation()
    // Reset to first frame
    setTimeout(() => {
      chartRef.value?.startAnimation()
    }, 100)
  }
}

// Load data from Python backend
const loadPythonData = async () => {
  try {
    pythonBackendConnected.value = await PythonApiService.checkBackendHealth()

    if (pythonBackendConnected.value) {
      const raceData = await PythonApiService.getBarChartRaceData()

      // Convert Python data format to component format
      const convertedData: Record<string, Array<{ name: string; value: number; color: string }>> = {}
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

      for (const [period, stateData] of Object.entries(raceData.data)) {
        convertedData[period] = Object.entries(stateData)
          .map(([state, value]) => ({
            name: state,
            value: value,
            color: stateColors[state] || '#95A5A6',
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10)
      }

      pensionRaceData.value = convertedData
      console.log('🐍 Loaded bar chart race data from Python backend')
    } else {
      console.log('📊 Using existing mock data - Python backend not available')
    }
  } catch (error) {
    console.error('Failed to load Python data:', error)
    pythonBackendConnected.value = false
  }
}

onMounted(async () => {
  // Load Python data first
  await loadPythonData()

  // Auto-start animation after component mounts
  setTimeout(() => {
    chartRef.value?.startAnimation()
  }, 1500)
})
</script>

<style scoped>
.pension-states-race-card {
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 16px 20px;
  border-radius: 12px 12px 0 0;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.5px;
}

.card-subtitle {
  margin: 4px 0 0 0;
  opacity: 0.9;
}

.chart-content {
  background: #ffffff;
  min-height: 300px;
}
</style>
