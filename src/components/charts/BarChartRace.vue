<template>
  <div class="bar-chart-race-container" :style="{ width: width, height: height }">
    <div class="bars-container">
      <div v-for="(item, index) in currentData" :key="item.name" class="bar-item" :style="getBarStyle(item, index)">
        <div class="bar-background">
          <div
            class="bar-fill"
            :style="{
              width: getBarWidth(item.value),
              backgroundColor: item.color,
              transition: 'width 0.8s ease-in-out',
            }"
          ></div>
        </div>
        <div class="bar-label">
          <span class="state-name">{{ item.name }}</span>
          <span class="state-value">{{ formatValue(item.value) }}</span>
        </div>
      </div>
    </div>
    <div v-if="showTimeIndicator" class="time-indicator">
      {{ currentTimeLabel }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface BarData {
  name: string
  value: number
  color: string
}

interface Props {
  data: Record<string, BarData[]>
  width?: string
  height?: string
  title?: string
  showTimeIndicator?: boolean
  animationSpeed?: number
  maxBars?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '200px',
  title: '',
  showTimeIndicator: true,
  animationSpeed: 2000,
  maxBars: 10,
})

const currentTimeIndex = ref(0)
const isPlaying = ref(false)
const intervalId = ref<NodeJS.Timeout | null>(null)

const timeLabels = computed(() => Object.keys(props.data))
const currentTimeLabel = computed(() => timeLabels.value[currentTimeIndex.value] || '')

const currentData = computed(() => {
  const timeLabel = currentTimeLabel.value
  if (!timeLabel || !props.data[timeLabel]) return []

  return [...props.data[timeLabel]].sort((a, b) => b.value - a.value).slice(0, props.maxBars)
})

const maxValue = computed(() => {
  const allValues = Object.values(props.data)
    .flat()
    .map((item) => item.value)
  return Math.max(...allValues)
})

const getBarWidth = (value: number): string => {
  const percentage = (value / maxValue.value) * 100
  return `${Math.max(percentage, 1)}%`
}

const getBarStyle = (item: BarData, index: number) => {
  return {
    order: index,
    transition: 'all 0.8s ease-in-out',
  }
}

const formatValue = (value: number): string => {
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K'
  }
  return value.toLocaleString()
}

const startAnimation = () => {
  if (isPlaying.value) return

  isPlaying.value = true
  intervalId.value = setInterval(() => {
    currentTimeIndex.value = (currentTimeIndex.value + 1) % timeLabels.value.length
  }, props.animationSpeed)
}

const stopAnimation = () => {
  isPlaying.value = false
  if (intervalId.value) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
}

onMounted(() => {
  // Auto-start animation after a short delay
  setTimeout(() => {
    startAnimation()
  }, 1000)
})

onUnmounted(() => {
  stopAnimation()
})

defineExpose({
  startAnimation,
  stopAnimation,
  isPlaying: computed(() => isPlaying.value),
})
</script>

<style scoped>
.bar-chart-race-container {
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.chart-title {
  text-align: center;
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 5px;
  color: #333;
}

.bars-container {
  position: relative;
  height: 100%;
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 200px;
}

.bar-item {
  position: relative;
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  min-height: 32px;
  max-height: 40px;
}

.bar-background {
  flex: 1;
  height: 24px;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 12px;
  max-width: 75%;
}

.bar-fill {
  height: 100%;
  border-radius: 8px;
  min-width: 8px;
}

.bar-label {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 90px;
  font-size: 11px;
}

.state-name {
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90px;
}

.state-value {
  font-weight: 500;
  color: #666;
  font-size: 10px;
}

.time-indicator {
  position: absolute;
  bottom: 5px;
  right: 10px;
  font-size: 12px;
  font-weight: bold;
  color: #666;
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
