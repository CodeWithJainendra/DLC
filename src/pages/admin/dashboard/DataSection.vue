<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
    <!-- First two cards: Total Registered Pensioners and Verified This Month -->
    <div v-for="metric in dashboardMetrics.slice(0, 2)" :key="metric.id" class="w-full">
      <DataSectionItem
        :title="metric.title"
        :value="metric.value"
        :change-text="metric.changeText"
        :up="metric.changeDirection === 'up'"
        :icon-background="metric.iconBackground"
        :icon-color="metric.iconColor"
      >
        <template #icon>
          <VaIcon :name="metric.icon" size="large" />
        </template>
      </DataSectionItem>
    </div>

    <!-- Third card: Graph card for Monthly Pensioner Verifications -->
    <div class="w-full">
      <VaCard
        class="cardview"
        style="height: 100px; min-height: 100px; max-height: 100px; transition: all 0.3s ease;"
        @mouseenter="hovered = true"
        @mouseleave="hovered = false"
      >
        <VaCardContent style="height: 100%; padding: 4px;">
          <!-- Full chart area only -->
          <div style="position: relative; width: 100%; height: 100%; overflow: hidden;">
            <VaChart
              type="line"
              :data="simpleChartData"
              :options="fullGraphChartOptions"
              style="width: 100%; height: 100%;"
            />
          </div>
        </VaCardContent>
      </VaCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useColors, useGlobalConfig } from 'vuestic-ui'
import DataSectionItem from './DataSectionItem.vue'
import VaChart from '@/components/va-charts/VaChart.vue'
import { statsApi } from '@/services/statsApi'

interface DashboardMetric {
  id: string
  title: string
  value: string
  icon: string
  changeText: string
  changeDirection: 'up' | 'down'
  iconBackground: string
  iconColor: string
}

const { getColor } = useColors()
const { globalConfig } = useGlobalConfig()

// Theme-aware colors
const isDarkTheme = computed(() => globalConfig.value.colors?.presets?.dark === globalConfig.value.colors?.currentPresetName)
const textColor = computed(() => isDarkTheme.value ? '#ffffff' : '#374151')
const gridColor = computed(() => isDarkTheme.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
const tooltipBg = computed(() => isDarkTheme.value ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)')
const tooltipText = computed(() => isDarkTheme.value ? '#ffffff' : '#1f2937')

// Real-time stats from Flask backend
const apiStats = ref({
  totalPensioners: '0',
  verifiedThisMonth: '0',
  pendingVerifications: '0',
  totalAmount: '₹0'
})

const dashboardMetrics = computed<DashboardMetric[]>(() => [
  {
    id: 'totalRegisteredPensioners',
    title: 'Total Registered Pensioners',
    value: apiStats.value.totalPensioners,
    icon: 'mso-people',
    changeText: '+2,150',
    changeDirection: 'up',
    iconBackground: getColor('primary'),
    iconColor: getColor('on-primary'),
  },
  {
    id: 'verifiedThisMonth',
    title: 'Verified This Month',
    value: apiStats.value.verifiedThisMonth,
    icon: 'mso-verified',
    changeText: '+12.8%',
    changeDirection: 'up',
    iconBackground: getColor('success'),
    iconColor: getColor('on-success'),
  },
  {
    id: 'pendingVerifications',
    title: 'Monthly Pensioner Verifications',
    value: topStateVerifications.value,
    icon: 'mso-trending_up',
    changeText: '+8.2%',
    changeDirection: 'up',
    iconBackground: getColor('success'),
    iconColor: getColor('on-success'),
  },
])

// Real API data for pensioner verifications
const topStateVerifications = ref('0')
const hovered = ref(false)
import type { ChartData } from 'chart.js'

// State-wise pensioner verification data - time series format
const simpleChartData = ref<ChartData<'line'>>({
  labels: [],
  datasets: [
    {
      label: 'Pensioners Verified',
      data: [],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      fill: true,
      tension: 0.3,
      borderWidth: 2,
      pointRadius: 2,
      pointHoverRadius: 4,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 1,
    },
  ],
})

// Theme-aware full graph chart options
const fullGraphChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 10,
      bottom: 15,
      left: 15,
      right: 15
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      mode: 'index' as const,
      intersect: false,
      backgroundColor: tooltipBg.value,
      titleColor: tooltipText.value,
      bodyColor: tooltipText.value,
      borderColor: gridColor.value,
      borderWidth: 1,
      cornerRadius: 4,
      padding: 6,
      displayColors: false,
      callbacks: {
        title: (context: any) => context[0].label,
        label: (context: any) => `${context.parsed.y.toLocaleString()}`
      }
    }
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: true,
        color: gridColor.value,
        drawBorder: true
      },
      ticks: {
        display: true,
        font: { size: 8 },
        color: textColor.value,
        maxRotation: 0,
        callback: function(value: any, index: any) {
          // Use dynamic labels coming from API aggregation
          const labels = simpleChartData.value.labels as string[]
          return labels[index] || ''
        }
      }
    },
    y: {
      display: true,
      grid: {
        display: true,
        color: gridColor.value,
        drawBorder: true
      },
      ticks: {
        display: true,
        font: { size: 8 },
        color: textColor.value,
        callback: function(value: any) {
          return (value / 1000).toFixed(0) + 'K'
        }
      },
      // y-axis will auto-scale based on data
    }
  },
  elements: {
    line: {
      tension: 0.3,
      borderWidth: 2,
      fill: true
    },
    point: {
      radius: 2,
      hoverRadius: 4,
      borderWidth: 1,
      hoverBorderWidth: 2
    }
  },
  animation: { duration: 800 }
}))

// Compact chart options (unused)
const compactChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 5,
      bottom: 15,
      left: 25,
      right: 10
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      mode: 'index' as const,
      intersect: false,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#1f2937',
      bodyColor: '#6b7280',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      cornerRadius: 4,
      padding: 6,
      displayColors: false,
      callbacks: {
        title: (context: any) => context[0].label,
        label: (context: any) => `${context.parsed.y.toLocaleString()}`
      }
    }
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.1)',
        drawBorder: true
      },
      ticks: {
        display: true,
        font: { size: 8 },
        color: '#6b7280',
        maxRotation: 0,
        callback: function(value: any, index: any) {
          const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
          return labels[index] || ''
        }
      }
    },
    y: {
      display: true,
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.1)',
        drawBorder: true
      },
      ticks: {
        display: true,
        font: { size: 8 },
        color: '#6b7280',
        stepSize: 2000,
        callback: function(value: any) {
          return (value / 1000).toFixed(0)
        }
      },
      min: 30000,
      max: 42000
    }
  },
  elements: {
    line: {
      tension: 0.2,
      borderWidth: 2,
      fill: true
    },
    point: {
      radius: 2,
      hoverRadius: 4,
      borderWidth: 1,
      hoverBorderWidth: 2
    }
  },
  animation: { duration: 800 }
}

// Full card chart options for better visibility (unused)
const fullCardChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      mode: 'index' as const,
      intersect: false,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#1f2937',
      bodyColor: '#6b7280',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      cornerRadius: 4,
      padding: 8,
      displayColors: false,
      callbacks: {
        title: (context: any) => context[0].label,
        label: (context: any) => `Pensioners: ${context.parsed.y.toLocaleString()}`
      }
    }
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.05)',
        drawBorder: false
      },
      ticks: {
        display: true,
        font: { size: 9 },
        color: '#6b7280',
        maxRotation: 0
      }
    },
    y: {
      display: true,
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.05)',
        drawBorder: false
      },
      ticks: {
        display: true,
        font: { size: 9 },
        color: '#6b7280',
        callback: function(value: any) {
          return (value / 1000).toFixed(0) + 'K'
        }
      },
      min: 30000,
      max: 42000
    }
  },
  elements: {
    line: {
      tension: 0.3,
      borderWidth: 2,
      fill: true
    },
    point: {
      radius: 2,
      hoverRadius: 4,
      borderWidth: 1,
      hoverBorderWidth: 2
    }
  },
  animation: { duration: 800 }
}

// Enhanced chart options for pensioner data visualization (unused)
const simpleChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      mode: 'index' as const,
      intersect: false,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#1f2937',
      bodyColor: '#6b7280',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      cornerRadius: 4,
      padding: 6,
      displayColors: false,
      callbacks: {
        title: (context: any) => context[0].label,
        label: (context: any) => `Pensioners: ${context.parsed.y.toLocaleString()}`
      }
    }
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.1)',
        drawBorder: false
      },
      ticks: {
        display: true,
        font: { size: 8 },
        color: '#6b7280',
        maxRotation: 0
      }
    },
    y: {
      display: true,
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.1)',
        drawBorder: false
      },
      ticks: {
        display: true,
        font: { size: 8 },
        color: '#6b7280',
        callback: function(value: any) {
          return (value / 1000).toFixed(0) + 'K'
        }
      },
      min: 30000,
      max: 42000
    }
  },
  elements: {
    line: {
      tension: 0.3,
      borderWidth: 2,
      fill: true
    },
    point: {
      radius: 2,
      hoverRadius: 4,
      borderWidth: 1,
      hoverBorderWidth: 2
    }
  },
  animation: { duration: 800 }
}

// Fetch real-time stats from Flask backend
async function fetchApiStats() {
  try {
    const stats = await statsApi.getFormattedStats()
    apiStats.value = stats
    console.log('📊 Updated dashboard stats:', stats)
  } catch (error) {
    console.error('Failed to fetch API stats:', error)
    // Keep existing values or set fallback
    apiStats.value = {
      totalPensioners: '0',
      verifiedThisMonth: '0',
      pendingVerifications: '0',
      totalAmount: '₹0'
    }
  }
}

async function fetchVerificationTrends() {
  // Fetch analytics trends from Flask backend
  try {
    const trends = await statsApi.getAnalyticsTrends(30)
    
    if (trends.dates.length > 0 && trends.verifications.length > 0) {
      // Use last 8 data points for the chart
      const lastEight = Math.min(8, trends.dates.length)
      const labels = trends.dates.slice(-lastEight).map(date => {
        const d = new Date(date)
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
      })
      const data = trends.verifications.slice(-lastEight)
      
      simpleChartData.value.labels = labels
      simpleChartData.value.datasets[0].data = data
      topStateVerifications.value = data[data.length - 1]?.toLocaleString() || '0'
      simpleChartData.value.datasets[0].borderColor = '#3b82f6'
      simpleChartData.value.datasets[0].backgroundColor = 'rgba(59, 130, 246, 0.2)'
    } else {
      setDemoData()
    }
  } catch (error) {
    console.error('Failed to fetch verification trends:', error)
    setDemoData()
  }
}

// Helper function to check if data is increasing
function isDataIncreasing(data: number[]): boolean {
  if (data.length < 2) return true
  const firstHalf = data.slice(0, Math.floor(data.length / 2))
  const secondHalf = data.slice(Math.floor(data.length / 2))
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
  return secondAvg > firstAvg
}

// Demo data function for pensioner verifications
function setDemoData() {
  topStateVerifications.value = '156'
  simpleChartData.value.labels = [
    '18 Aug', '19 Aug', '20 Aug', '21 Aug', '22 Aug', '23 Aug', '24 Aug', '25 Aug'
  ] as string[]
  simpleChartData.value.datasets[0].data = [
    120, 135, 128, 142, 156, 171, 148, 156
  ] as number[]
  // Blue color for pensioner verification data
  simpleChartData.value.datasets[0].borderColor = '#3b82f6'
  simpleChartData.value.datasets[0].backgroundColor = 'rgba(59, 130, 246, 0.2)'
}

// Auto-refresh data every 30 seconds for real-time updates
let refreshInterval: NodeJS.Timeout | null = null

onMounted(() => {
  // Fetch initial data
  fetchApiStats()
  fetchVerificationTrends()

  // Set up real-time data refresh
  refreshInterval = setInterval(() => {
    fetchApiStats()
    fetchVerificationTrends()
  }, 30000) // Refresh every 30 seconds
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.cardview {
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.cardview:hover {
  /* Removed transform and enhanced shadow effects */
}

/* Dark theme border support */
:deep(.va-card) {
  border: 1px solid var(--va-background-border);
}

:deep(.va-card:hover) {
  /* Removed hover border changes */
}
</style>

<style scoped>
.full-graph-card:hover {
  /* Removed transform and shadow effects */
}

.cardview {
  transition: all 0.3s ease;
}
</style>
