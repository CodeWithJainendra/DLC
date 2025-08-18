<template>
  <VaCard class="verification-map-card">
    <VaCardContent class="p-0">
      <!-- Header Section -->
      <div class="card-header">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="header-icon">
              <VaIcon name="map" size="24px" color="white" />
            </div>
            <div>
              <h1 class="card-title">VERIFICATION BY LOCATION</h1>
              <p class="card-subtitle">{{ totalMarkers }} Districts Tracked</p>
            </div>
          </div>
          <div class="flex gap-2">
            <VaButton
              preset="primary"
              size="small"
              class="zoom-btn"
              icon="zoom_in"
              @click="zoomIn"
            >
              Zoom In
            </VaButton>
            <VaButton
              preset="primary"
              size="small"
              class="zoom-btn"
              icon="zoom_out"
              @click="zoomOut"
            >
              Zoom Out
            </VaButton>
            <VaButton
              preset="primary"
              size="small"
              class="zoom-btn"
              icon="my_location"
              @click="centerOnIndia"
            >
              Center India
            </VaButton>
          </div>
        </div>
      </div>

      <!-- Map Section -->
      <div class="map-container">
        <!-- India SVG Map -->
        <div class="india-map-wrapper" :style="{ transform: `scale(${zoomLevel})` }">
          <svg
            viewBox="0 0 1000 700"
            class="india-map"
            @wheel="handleWheel"
          >
            <!-- India Map Path -->
            <path
              d="M300,100 Q350,80 400,90 Q450,85 500,95 Q550,90 600,100 Q650,95 700,110 L720,130 Q740,150 750,180 Q760,210 770,240 Q780,270 790,300 Q800,330 810,360 Q820,390 830,420 Q840,450 850,480 L860,510 Q850,540 840,570 Q830,600 820,630 L800,650 Q780,670 760,690 Q740,710 720,730 Q700,750 680,770 Q660,790 640,810 Q620,830 600,850 Q580,870 560,890 Q540,910 520,930 Q500,950 480,970 Q460,990 440,1010 Q420,1030 400,1050 Q380,1030 360,1010 Q340,990 320,970 Q300,950 280,930 Q260,910 240,890 Q220,870 200,850 Q180,830 160,810 Q140,790 120,770 Q100,750 80,730 Q60,710 40,690 Q20,670 10,650 Q5,630 10,610 Q15,590 25,570 Q35,550 45,530 Q55,510 65,490 Q75,470 85,450 Q95,430 105,410 Q115,390 125,370 Q135,350 145,330 Q155,310 165,290 Q175,270 185,250 Q195,230 205,210 Q215,190 225,170 Q235,150 245,130 L300,100 Z"
              fill="#e3f2fd"
              stroke="#1976d2"
              stroke-width="2"
              class="india-outline"
            />
            
            <!-- Verification Markers -->
            <g v-for="marker in verificationMarkers" :key="marker.id">
              <circle
                :cx="marker.x"
                :cy="marker.y"
                :r="getMarkerSize(marker.verifications)"
                :fill="getMarkerColor(marker.status)"
                :stroke="getMarkerBorderColor(marker.mode)"
                stroke-width="3"
                class="verification-marker"
                @click="showMarkerDetails(marker)"
                @mouseenter="showTooltip(marker, $event)"
                @mouseleave="hideTooltip"
              />
              
              <!-- Marker Label -->
              <text
                :x="marker.x"
                :y="marker.y + 5"
                text-anchor="middle"
                class="marker-label"
                fill="white"
                font-size="12"
                font-weight="bold"
              >
                {{ marker.verifications > 999 ? '1K+' : marker.verifications }}
              </text>
            </g>
          </svg>
        </div>

        <!-- Search Box -->
        <div class="search-overlay">
          <VaInput
            v-model="searchQuery"
            placeholder="Search for a location in India..."
            class="search-input"
            @keyup.enter="searchLocation"
          >
            <template #appendInner>
              <VaButton
                preset="primary"
                size="small"
                icon="search"
                @click="searchLocation"
              />
            </template>
          </VaInput>
        </div>

        <!-- Verification Data Overlay -->
        <div class="verification-overlay">
          <div class="verification-stats">
            <div class="stat-item">
              <div class="stat-number">{{ totalVerifications }}</div>
              <div class="stat-label">Total Verifications</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ onlineVerifications }}</div>
              <div class="stat-label">Online</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ offlineVerifications }}</div>
              <div class="stat-label">Offline</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ biometricVerifications }}</div>
              <div class="stat-label">Biometric</div>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div class="map-legend">
          <div class="legend-section">
            <h4>Verification Status</h4>
            <div class="legend-items">
              <div class="legend-item">
                <div class="legend-color" style="background: #4caf50"></div>
                <span>Verified ({{ verifiedCount }})</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background: #ff9800"></div>
                <span>Pending ({{ pendingCount }})</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background: #f44336"></div>
                <span>Rejected ({{ rejectedCount }})</span>
              </div>
            </div>
          </div>
          
          <div class="legend-section">
            <h4>Verification Mode</h4>
            <div class="legend-items">
              <div class="legend-item">
                <div class="legend-border" style="border-color: #2196f3"></div>
                <span>Online ({{ onlineVerifications }})</span>
              </div>
              <div class="legend-item">
                <div class="legend-border" style="border-color: #9c27b0"></div>
                <span>Offline ({{ offlineVerifications }})</span>
              </div>
              <div class="legend-item">
                <div class="legend-border" style="border-color: #ff5722"></div>
                <span>Biometric ({{ biometricVerifications }})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tooltip -->
      <div
        v-if="tooltip.show"
        class="map-tooltip"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <h5>{{ tooltip.data?.district }}</h5>
        <p><strong>Verifications:</strong> {{ tooltip.data?.verifications }}</p>
        <p><strong>Mode:</strong> {{ tooltip.data?.mode }}</p>
        <p><strong>Status:</strong> {{ tooltip.data?.status }}</p>
      </div>
    </VaCardContent>
  </VaCard>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { VaCard, VaButton, VaIcon, VaInput } from 'vuestic-ui'

interface VerificationMarker {
  id: string
  district: string
  x: number
  y: number
  verifications: number
  mode: 'Online' | 'Offline' | 'Biometric'
  status: 'Verified' | 'Pending' | 'Rejected'
}

// Zoom functionality
const zoomLevel = ref(1)
const minZoom = 0.5
const maxZoom = 3
const searchQuery = ref('')

const zoomIn = () => {
  if (zoomLevel.value < maxZoom) {
    zoomLevel.value += 0.2
  }
}

const zoomOut = () => {
  if (zoomLevel.value > minZoom) {
    zoomLevel.value -= 0.2
  }
}

const centerOnIndia = () => {
  zoomLevel.value = 1
}

const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  if (event.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

// Verification markers data
const verificationMarkers = ref<VerificationMarker[]>([
  {
    id: '1',
    district: 'Delhi',
    x: 480,
    y: 180,
    verifications: 1247,
    mode: 'Online',
    status: 'Verified'
  },
  {
    id: '2',
    district: 'Mumbai',
    x: 380,
    y: 350,
    verifications: 892,
    mode: 'Offline',
    status: 'Pending'
  },
  {
    id: '3',
    district: 'Bangalore',
    x: 520,
    y: 480,
    verifications: 654,
    mode: 'Biometric',
    status: 'Verified'
  },
  {
    id: '4',
    district: 'Chennai',
    x: 580,
    y: 520,
    verifications: 543,
    mode: 'Online',
    status: 'Rejected'
  },
  {
    id: '5',
    district: 'Kolkata',
    x: 650,
    y: 280,
    verifications: 789,
    mode: 'Offline',
    status: 'Verified'
  },
  {
    id: '6',
    district: 'Hyderabad',
    x: 550,
    y: 420,
    verifications: 432,
    mode: 'Biometric',
    status: 'Pending'
  },
  {
    id: '7',
    district: 'Pune',
    x: 420,
    y: 380,
    verifications: 321,
    mode: 'Online',
    status: 'Verified'
  },
  {
    id: '8',
    district: 'Ahmedabad',
    x: 350,
    y: 280,
    verifications: 567,
    mode: 'Offline',
    status: 'Pending'
  },
  {
    id: '9',
    district: 'Jaipur',
    x: 420,
    y: 220,
    verifications: 445,
    mode: 'Biometric',
    status: 'Verified'
  },
  {
    id: '10',
    district: 'Lucknow',
    x: 550,
    y: 240,
    verifications: 678,
    mode: 'Online',
    status: 'Pending'
  },
  {
    id: '11',
    district: 'Bhopal',
    x: 480,
    y: 320,
    verifications: 234,
    mode: 'Offline',
    status: 'Verified'
  },
  {
    id: '12',
    district: 'Chandigarh',
    x: 450,
    y: 140,
    verifications: 189,
    mode: 'Biometric',
    status: 'Pending'
  }
])

const totalMarkers = computed(() => verificationMarkers.value.length)

// Computed statistics
const totalVerifications = computed(() =>
  verificationMarkers.value.reduce((sum, item) => sum + item.verifications, 0)
)

const onlineVerifications = computed(() =>
  verificationMarkers.value
    .filter(item => item.mode === 'Online')
    .reduce((sum, item) => sum + item.verifications, 0)
)

const offlineVerifications = computed(() =>
  verificationMarkers.value
    .filter(item => item.mode === 'Offline')
    .reduce((sum, item) => sum + item.verifications, 0)
)

const biometricVerifications = computed(() =>
  verificationMarkers.value
    .filter(item => item.mode === 'Biometric')
    .reduce((sum, item) => sum + item.verifications, 0)
)

const verifiedCount = computed(() =>
  verificationMarkers.value.filter(item => item.status === 'Verified').length
)

const pendingCount = computed(() =>
  verificationMarkers.value.filter(item => item.status === 'Pending').length
)

const rejectedCount = computed(() =>
  verificationMarkers.value.filter(item => item.status === 'Rejected').length
)

// Marker styling functions
const getMarkerSize = (verifications: number) => {
  if (verifications > 1000) return 20
  if (verifications > 500) return 16
  if (verifications > 200) return 12
  return 8
}

const getMarkerColor = (status: string) => {
  switch (status) {
    case 'Verified': return '#4caf50'
    case 'Pending': return '#ff9800'
    case 'Rejected': return '#f44336'
    default: return '#9e9e9e'
  }
}

const getMarkerBorderColor = (mode: string) => {
  switch (mode) {
    case 'Online': return '#2196f3'
    case 'Offline': return '#9c27b0'
    case 'Biometric': return '#ff5722'
    default: return '#757575'
  }
}

// Tooltip functionality
const tooltip = ref({
  show: false,
  x: 0,
  y: 0,
  data: null as VerificationMarker | null
})

const showTooltip = (marker: VerificationMarker, event: MouseEvent) => {
  tooltip.value = {
    show: true,
    x: event.clientX + 10,
    y: event.clientY - 10,
    data: marker
  }
}

const hideTooltip = () => {
  tooltip.value.show = false
}

const showMarkerDetails = (marker: VerificationMarker) => {
  console.log('Marker clicked:', marker)
}

const searchLocation = () => {
  if (searchQuery.value.trim()) {
    console.log('Searching for:', searchQuery.value)
    // Simple search simulation
    const foundMarker = verificationMarkers.value.find(m =>
      m.district.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    if (foundMarker) {
      showTooltip(foundMarker, { clientX: foundMarker.x, clientY: foundMarker.y } as MouseEvent)
      setTimeout(() => hideTooltip(), 3000)
    }
  }
}

// Animation on mount
onMounted(() => {
  // Animate zoom in effect on load
  zoomLevel.value = 0.5
  setTimeout(() => {
    zoomLevel.value = 1
  }, 500)
})
</script>
