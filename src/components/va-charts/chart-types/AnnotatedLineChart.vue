<template>
  <div class="annotated-line-chart">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
)

interface Props {
  data: ChartData<'line'>
  height?: number
  annotations?: Array<{
    type: 'line' | 'box' | 'point'
    value?: number
    label?: string
    color?: string
    position?: 'start' | 'center' | 'end'
  }>
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  annotations: () => []
})

const chartCanvas = ref<HTMLCanvasElement>()
let chartInstance: ChartJS | null = null

const createChart = async () => {
  await nextTick()
  
  if (!chartCanvas.value) return

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 300)
  gradient.addColorStop(0, 'rgba(102, 126, 234, 0.3)')
  gradient.addColorStop(1, 'rgba(102, 126, 234, 0.05)')

  // Enhanced chart options
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#6b7280',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 16,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: '600'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          title: (context) => {
            return `${context[0].label}`
          },
          label: (context) => {
            return `${context.parsed.y.toLocaleString()} verifications`
          }
        }
      },
      annotation: {
        annotations: {
          // Support line annotation
          supportLine: {
            type: 'line',
            yMin: 8100,
            yMax: 8100,
            borderColor: '#10b981',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              display: true,
              content: 'Support',
              position: 'start',
              backgroundColor: '#10b981',
              color: '#ffffff',
              padding: 8,
              cornerRadius: 6,
              font: {
                size: 12,
                weight: '600'
              }
            }
          },
          // Point annotation for significant events
          pointAnnotation: {
            type: 'point',
            xValue: 'Nov 23',
            yValue: 9500,
            backgroundColor: '#7c3aed',
            borderColor: '#ffffff',
            borderWidth: 3,
            radius: 8,
            label: {
              display: true,
              content: 'Annual Peak',
              position: 'top',
              backgroundColor: '#7c3aed',
              color: '#ffffff',
              padding: 8,
              cornerRadius: 6,
              font: {
                size: 12,
                weight: '600'
              },
              yAdjust: -10
            }
          },
          // New beginning annotation
          newBeginning: {
            type: 'line',
            xMin: 'Dec 02',
            xMax: 'Dec 02',
            borderColor: '#f59e0b',
            borderWidth: 2,
            borderDash: [3, 3],
            label: {
              display: true,
              content: 'New Beginning',
              position: 'top',
              backgroundColor: '#f59e0b',
              color: '#ffffff',
              padding: 8,
              cornerRadius: 6,
              font: {
                size: 12,
                weight: '600'
              },
              yAdjust: -20
            }
          }
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
          color: '#6b7280',
          font: {
            size: 12,
            weight: '500'
          },
          padding: 10
        },
        border: {
          display: false
        }
      },
      y: {
        display: true,
        position: 'left',
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: '500'
          },
          padding: 15,
          callback: function(value) {
            return (value as number).toLocaleString()
          }
        },
        border: {
          display: false
        }
      }
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3,
        borderCapStyle: 'round',
        borderJoinStyle: 'round'
      },
      point: {
        radius: 0,
        hoverRadius: 8,
        hitRadius: 10,
        borderWidth: 3,
        hoverBorderWidth: 3
      }
    }
  }

  // Enhanced data with gradient fill
  const enhancedData = {
    ...props.data,
    datasets: props.data.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: gradient,
      borderColor: '#667eea',
      pointBackgroundColor: '#667eea',
      pointBorderColor: '#ffffff',
      pointHoverBackgroundColor: '#667eea',
      pointHoverBorderColor: '#ffffff',
      fill: true,
      tension: 0.4
    }))
  }

  chartInstance = new ChartJS(ctx, {
    type: 'line',
    data: enhancedData,
    options
  })
}

// Watch for data changes
watch(() => props.data, createChart, { deep: true })

onMounted(() => {
  createChart()
})
</script>

<style lang="scss" scoped>
.annotated-line-chart {
  position: relative;
  width: 100%;
  height: 100%;
  
  canvas {
    border-radius: 12px;
  }
}
</style>
