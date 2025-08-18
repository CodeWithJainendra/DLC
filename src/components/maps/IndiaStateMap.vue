<template>
  <div class="india-state-map">
    <svg viewBox="0 0 1000 600" class="state-map-svg">
      <!-- State Polygons -->
      <g v-for="state in statePolygons" :key="state.name">
        <path
          :d="state.path"
          :fill="getStateColor(stateData[state.name] || 0)"
          :stroke="'#374151'"
          :stroke-width="1"
          class="state-polygon"
          @mouseenter="showTooltip(state, $event)"
          @mouseleave="hideTooltip"
          @click="selectState(state)"
        />

        <!-- State Label -->
        <text
          :x="state.labelX"
          :y="state.labelY"
          text-anchor="middle"
          class="state-label"
          fill="#374151"
          font-size="12"
          font-weight="bold"
        >
          {{ state.code }}
        </text>
      </g>
    </svg>

    <!-- Tooltip -->
    <div
      v-if="tooltip.visible"
      class="map-tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <div class="tooltip-content">
        <h4>{{ tooltip.stateName }}</h4>
        <div class="tooltip-metric">
          <span class="metric-label">{{ formatMetricName(selectedMetric) }}:</span>
          <span class="metric-value">{{ tooltip.value.toLocaleString() }}</span>
        </div>
        <div class="tooltip-rank" v-if="tooltip.rank">
          <span class="rank-text">Rank: #{{ tooltip.rank }} of {{ totalStates }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const props = defineProps<{
  stateData: Record<string, number>
  selectedMetric: string
}>()

// Tooltip state
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  stateName: '',
  value: 0,
  rank: 0
})

// Computed properties
const totalStates = computed(() => Object.keys(props.stateData).length)

const stateRankings = computed(() => {
  const entries = Object.entries(props.stateData)
    .filter(([_, value]) => value > 0)
    .sort(([_, a], [__, b]) => b - a)

  const rankings: Record<string, number> = {}
  entries.forEach(([state, _], index) => {
    rankings[state] = index + 1
  })

  return rankings
})

// Compute color scale dynamically
const colorScale = computed(() => {
  const values = Object.values(props.stateData).filter(v => v > 0)
  if (values.length === 0) return { min: 0, max: 100 }

  return {
    min: Math.min(...values),
    max: Math.max(...values)
  }
})

// Color function for states
function getStateColor(value: number) {
  if (value === 0 || !value) return '#f3f4f6' // Light gray for no data

  const { min, max } = colorScale.value
  if (max === min) return '#fecaca' // Single color if all values are same

  const normalized = (value - min) / (max - min)

  // Different color schemes based on metric type
  if (props.selectedMetric === 'DLC_failed') {
    // Red scale for failures (more red = more failures = worse)
    if (normalized >= 0.75) return '#dc2626' // Dark red
    if (normalized >= 0.5) return '#ef4444'  // Red
    if (normalized >= 0.25) return '#f87171' // Light red
    return '#fecaca' // Very light red
  } else {
    // Green-blue scale for positive metrics (more intense = better)
    if (normalized >= 0.75) return '#059669' // Dark green
    if (normalized >= 0.5) return '#10b981'  // Green
    if (normalized >= 0.25) return '#34d399' // Light green
    return '#a7f3d0' // Very light green
  }
}

// Simplified state polygons for SVG map (using approximate shapes)
const statePolygons = [
  {
    name: 'Uttar Pradesh',
    code: 'UP',
    path: 'M400,200 L550,200 L550,280 L400,280 Z',
    labelX: 475,
    labelY: 240
  },
  {
    name: 'Maharashtra',
    code: 'MH',
    path: 'M300,350 L450,350 L450,430 L300,430 Z',
    labelX: 375,
    labelY: 390
  },
  {
    name: 'Bihar',
    code: 'BR',
    path: 'M550,200 L650,200 L650,260 L550,260 Z',
    labelX: 600,
    labelY: 230
  },
  {
    name: 'West Bengal',
    code: 'WB',
    path: 'M650,200 L750,200 L750,280 L650,280 Z',
    labelX: 700,
    labelY: 240
  },
  {
    name: 'Madhya Pradesh',
    code: 'MP',
    path: 'M350,280 L500,280 L500,350 L350,350 Z',
    labelX: 425,
    labelY: 315
  },
  {
    name: 'Tamil Nadu',
    code: 'TN',
    path: 'M350,480 L450,480 L450,560 L350,560 Z',
    labelX: 400,
    labelY: 520
  },
  {
    name: 'Rajasthan',
    code: 'RJ',
    path: 'M200,150 L350,150 L350,280 L200,280 Z',
    labelX: 275,
    labelY: 215
  },
  {
    name: 'Karnataka',
    code: 'KA',
    path: 'M300,430 L400,430 L400,510 L300,510 Z',
    labelX: 350,
    labelY: 470
  },
  {
    name: 'Gujarat',
    code: 'GJ',
    path: 'M150,250 L250,250 L250,350 L150,350 Z',
    labelX: 200,
    labelY: 300
  },
  {
    name: 'Andhra Pradesh',
    code: 'AP',
    path: 'M450,400 L550,400 L550,500 L450,500 Z',
    labelX: 500,
    labelY: 450
  }
]

// Helper functions
function formatMetricName(metric: string) {
  const names: Record<string, string> = {
    'pensioner_count': 'Pensioners',
    'DLC_potential': 'DLC Potential',
    'DLC_success': 'DLC Success',
    'DLC_failed': 'DLC Failed'
  }
  return names[metric] || metric
}

// Tooltip functions
function showTooltip(state: any, event: MouseEvent) {
  const value = props.stateData[state.name] || 0
  tooltip.value = {
    visible: true,
    x: event.clientX + 10,
    y: event.clientY - 10,
    stateName: state.name,
    value: value,
    rank: stateRankings.value[state.name] || 0
  }
}

function hideTooltip() {
  tooltip.value.visible = false
}

function selectState(state: any) {
  const value = props.stateData[state.name] || 0
  const rank = stateRankings.value[state.name] || 0
  console.log(`Selected: ${state.name} | ${formatMetricName(props.selectedMetric)}: ${value.toLocaleString()} | Rank: #${rank}`)
}
</script>

<style scoped>
.india-state-map {
  width: 100%;
  height: 100%;
  position: relative;
}

.state-map-svg {
  width: 100%;
  height: 100%;
}

.state-polygon {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.state-polygon:hover {
  opacity: 0.8;
  stroke-width: 2;
}

.state-label {
  pointer-events: none;
  font-family: 'Inter', sans-serif;
}

.map-tooltip {
  position: fixed;
  z-index: 1000;
  pointer-events: none;
}

.tooltip-content {
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 180px;
}

.tooltip-content h4 {
  margin: 0 0 8px 0;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 4px;
}

.tooltip-metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.metric-label {
  opacity: 0.8;
  font-size: 12px;
}

.metric-value {
  font-weight: 600;
  color: #60a5fa;
}

.tooltip-rank {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.rank-text {
  font-size: 11px;
  opacity: 0.7;
  font-style: italic;
}
</style>