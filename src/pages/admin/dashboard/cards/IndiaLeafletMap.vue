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
              <p class="card-subtitle">
                {{ totalDistricts }} Districts • {{ totalVerifications.toLocaleString() }} Verifications
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <VaButton preset="primary" size="small" class="zoom-btn" icon="zoom_in" @click="zoomIn"> Zoom In </VaButton>
            <VaButton preset="primary" size="small" class="zoom-btn" icon="zoom_out" @click="zoomOut">
              Zoom Out
            </VaButton>
            <VaButton preset="primary" size="small" class="zoom-btn" icon="my_location" @click="centerOnIndia">
              Center India
            </VaButton>
          </div>
        </div>
      </div>

      <!-- Map Container -->
      <div class="map-container">
        <div id="india-leaflet-map" class="leaflet-map"></div>

        <!-- Search Box -->
        <div class="search-overlay">
          <VaInput
            v-model="searchQuery"
            placeholder="Search districts in India..."
            class="search-input"
            @keyup.enter="searchLocation"
          >
            <template #appendInner>
              <VaButton preset="primary" size="small" icon="search" @click="searchLocation" />
            </template>
          </VaInput>
        </div>

        <!-- Statistics Overlay -->
        <div class="stats-overlay">
          <div class="stats-grid">
            <div class="stat-card verified">
              <div class="stat-number">{{ verifiedCount }}</div>
              <div class="stat-label">Verified</div>
            </div>
            <div class="stat-card pending">
              <div class="stat-number">{{ pendingCount }}</div>
              <div class="stat-label">Pending</div>
            </div>
            <div class="stat-card rejected">
              <div class="stat-number">{{ rejectedCount }}</div>
              <div class="stat-label">Rejected</div>
            </div>
          </div>
        </div>

        <!-- Mode Statistics -->
        <div class="mode-overlay">
          <div class="mode-stats">
            <div class="mode-item online">
              <div class="mode-icon"></div>
              <span>Online: {{ onlineCount }}</span>
            </div>
            <div class="mode-item offline">
              <div class="mode-icon"></div>
              <span>Offline: {{ offlineCount }}</span>
            </div>
            <div class="mode-item biometric">
              <div class="mode-icon"></div>
              <span>Biometric: {{ biometricCount }}</span>
            </div>
          </div>
        </div>

        <!-- Legend - Hidden as requested by user -->
      </div>
    </VaCardContent>
  </VaCard>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { VaCard, VaButton, VaIcon, VaInput } from 'vuestic-ui'
import L from 'leaflet'

interface DistrictData {
  id: string
  district: string
  state: string
  lat: number
  lng: number
  verifications: number
  mode: 'Online' | 'Offline' | 'Biometric'
  status: 'Verified' | 'Pending' | 'Rejected'
}

// Map instance
let map: L.Map | null = null
let markers: L.Marker[] = []
const searchQuery = ref('')

// District verification data for India
const districtData = ref<DistrictData[]>([
  {
    id: '1',
    district: 'New Delhi',
    state: 'Delhi',
    lat: 28.6139,
    lng: 77.209,
    verifications: 1247,
    mode: 'Online',
    status: 'Verified',
  },
  {
    id: '2',
    district: 'Mumbai',
    state: 'Maharashtra',
    lat: 19.076,
    lng: 72.8777,
    verifications: 892,
    mode: 'Offline',
    status: 'Pending',
  },
  {
    id: '3',
    district: 'Bangalore Urban',
    state: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946,
    verifications: 654,
    mode: 'Biometric',
    status: 'Verified',
  },
  {
    id: '4',
    district: 'Chennai',
    state: 'Tamil Nadu',
    lat: 13.0827,
    lng: 80.2707,
    verifications: 543,
    mode: 'Online',
    status: 'Rejected',
  },
  {
    id: '5',
    district: 'Kolkata',
    state: 'West Bengal',
    lat: 22.5726,
    lng: 88.3639,
    verifications: 789,
    mode: 'Offline',
    status: 'Verified',
  },
  {
    id: '6',
    district: 'Hyderabad',
    state: 'Telangana',
    lat: 17.385,
    lng: 78.4867,
    verifications: 432,
    mode: 'Biometric',
    status: 'Pending',
  },
  {
    id: '7',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.5204,
    lng: 73.8567,
    verifications: 321,
    mode: 'Online',
    status: 'Verified',
  },
  {
    id: '8',
    district: 'Ahmedabad',
    state: 'Gujarat',
    lat: 23.0225,
    lng: 72.5714,
    verifications: 567,
    mode: 'Offline',
    status: 'Pending',
  },
  {
    id: '9',
    district: 'Jaipur',
    state: 'Rajasthan',
    lat: 26.9124,
    lng: 75.7873,
    verifications: 445,
    mode: 'Biometric',
    status: 'Verified',
  },
  {
    id: '10',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    lat: 26.8467,
    lng: 80.9462,
    verifications: 678,
    mode: 'Online',
    status: 'Pending',
  },
  {
    id: '11',
    district: 'Bhopal',
    state: 'Madhya Pradesh',
    lat: 23.2599,
    lng: 77.4126,
    verifications: 234,
    mode: 'Offline',
    status: 'Verified',
  },
  {
    id: '12',
    district: 'Chandigarh',
    state: 'Chandigarh',
    lat: 30.7333,
    lng: 76.7794,
    verifications: 189,
    mode: 'Biometric',
    status: 'Pending',
  },
  {
    id: '13',
    district: 'Kochi',
    state: 'Kerala',
    lat: 9.9312,
    lng: 76.2673,
    verifications: 298,
    mode: 'Online',
    status: 'Verified',
  },
  {
    id: '14',
    district: 'Indore',
    state: 'Madhya Pradesh',
    lat: 22.7196,
    lng: 75.8577,
    verifications: 356,
    mode: 'Biometric',
    status: 'Pending',
  },
  {
    id: '15',
    district: 'Patna',
    state: 'Bihar',
    lat: 25.5941,
    lng: 85.1376,
    verifications: 412,
    mode: 'Offline',
    status: 'Verified',
  },
])

// Computed statistics
const totalDistricts = computed(() => districtData.value.length)
const totalVerifications = computed(() => districtData.value.reduce((sum, item) => sum + item.verifications, 0))

const verifiedCount = computed(() => districtData.value.filter((item) => item.status === 'Verified').length)

const pendingCount = computed(() => districtData.value.filter((item) => item.status === 'Pending').length)

const rejectedCount = computed(() => districtData.value.filter((item) => item.status === 'Rejected').length)

const onlineCount = computed(() => districtData.value.filter((item) => item.mode === 'Online').length)

const offlineCount = computed(() => districtData.value.filter((item) => item.mode === 'Offline').length)

const biometricCount = computed(() => districtData.value.filter((item) => item.mode === 'Biometric').length)

// Map functions
const initializeMap = () => {
  try {
    // Initialize map centered on India
    map = L.map('india-leaflet-map', {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: false,
    })

    // Add zoom control to top right
    L.control
      .zoom({
        position: 'topright',
      })
      .addTo(map)

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
      minZoom: 4,
    }).addTo(map)

    // Add district markers
    addDistrictMarkers()

    console.log('India map initialized successfully')
  } catch (error) {
    console.error('Error initializing map:', error)
  }
}

const addDistrictMarkers = () => {
  if (!map) return

  districtData.value.forEach((district) => {
    const markerColor = getStatusColor(district.status)
    const borderColor = getModeColor(district.mode)
    const markerSize = getMarkerSize(district.verifications)

    // Create custom marker HTML
    const markerHtml = `
      <div class="custom-marker" style="
        width: ${markerSize}px;
        height: ${markerSize}px;
        background: ${markerColor};
        border: 3px solid ${borderColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${markerSize > 20 ? '12px' : '10px'};
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        ${district.verifications > 999 ? '1K+' : district.verifications}
      </div>
    `

    const customIcon = L.divIcon({
      className: 'custom-district-marker',
      html: markerHtml,
      iconSize: [markerSize, markerSize],
      iconAnchor: [markerSize / 2, markerSize / 2],
    })

    const marker = L.marker([district.lat, district.lng], { icon: customIcon })
      .bindPopup(createPopupContent(district), {
        maxWidth: 300,
        className: 'custom-popup',
      })
      .addTo(map!)

    // Add hover effect
    marker.on('mouseover', function (this: any) {
      this.openPopup()
    })

    markers.push(marker)
  })
}

const createPopupContent = (district: DistrictData) => {
  const statusClass = district.status.toLowerCase()
  const modeClass = district.mode.toLowerCase()

  return `
    <div class="district-popup">
      <h3 class="popup-title">${district.district}</h3>
      <p class="popup-state">${district.state}</p>

      <div class="popup-stats">
        <div class="stat-row">
          <span class="stat-label">📊 Verifications:</span>
          <span class="stat-value">${district.verifications.toLocaleString()}</span>
        </div>

        <div class="stat-row">
          <span class="stat-label">🔧 Mode:</span>
          <span class="stat-value mode-${modeClass}">${district.mode}</span>
        </div>

        <div class="stat-row">
          <span class="stat-label">✅ Status:</span>
          <span class="stat-value status-${statusClass}">${district.status}</span>
        </div>
      </div>

      <div class="popup-footer">
        <small>Click marker for details</small>
      </div>
    </div>
  `
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Verified':
      return '#10b981'
    case 'Pending':
      return '#f59e0b'
    case 'Rejected':
      return '#ef4444'
    default:
      return '#6b7280'
  }
}

const getModeColor = (mode: string) => {
  switch (mode) {
    case 'Online':
      return '#3b82f6'
    case 'Offline':
      return '#8b5cf6'
    case 'Biometric':
      return '#f97316'
    default:
      return '#6b7280'
  }
}

const getMarkerSize = (verifications: number) => {
  if (verifications > 1000) return 28
  if (verifications > 500) return 24
  if (verifications > 200) return 20
  return 16
}

const zoomIn = () => {
  if (map) map.zoomIn()
}

const zoomOut = () => {
  if (map) map.zoomOut()
}

const centerOnIndia = () => {
  if (map) {
    map.setView([20.5937, 78.9629], 5, { animate: true, duration: 1 })
  }
}

const searchLocation = async () => {
  if (!searchQuery.value.trim()) return

  const foundDistrict = districtData.value.find(
    (d) =>
      d.district.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      d.state.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )

  if (foundDistrict && map) {
    map.setView([foundDistrict.lat, foundDistrict.lng], 10, { animate: true })

    // Find and open the marker popup
    const marker = markers.find((m) => {
      const pos = m.getLatLng()
      return pos.lat === foundDistrict.lat && pos.lng === foundDistrict.lng
    })

    if (marker) {
      setTimeout(() => marker.openPopup(), 500)
    }
  }
}

onMounted(() => {
  setTimeout(() => {
    initializeMap()
  }, 500)
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
  markers = []
})
</script>

<style lang="scss" scoped>
.verification-map-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.verification-map-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.card-header {
  background: linear-gradient(135deg, var(--va-primary) 0%, var(--va-primary-dark) 100%);
  padding: 20px 24px;
  color: white !important;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.5px;
  color: white !important;
  text-transform: uppercase;
}

.card-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 4px 0 0 0;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95) !important;
}

.zoom-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.zoom-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: translateY(-1px);
}

.map-container {
  position: relative;
  height: 600px;
  background: #f8f9fa;
  overflow: hidden;
}

.leaflet-map {
  width: 100%;
  height: 100%;
  z-index: 1;
}

.search-overlay {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: 320px;
}

.search-input {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stats-overlay {
  position: absolute;
  top: 80px;
  left: 20px;
  z-index: 1000;
}

.stats-grid {
  display: flex;
  gap: 12px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  min-width: 80px;
  border-left: 4px solid;
}

.stat-card.verified {
  border-left-color: #10b981;
}

.stat-card.pending {
  border-left-color: #f59e0b;
}

.stat-card.rejected {
  border-left-color: #ef4444;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-card.verified .stat-number {
  color: #10b981;
}

.stat-card.pending .stat-number {
  color: #f59e0b;
}

.stat-card.rejected .stat-number {
  color: #ef4444;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.mode-overlay {
  position: absolute;
  top: 160px;
  left: 20px;
  z-index: 1000;
}

.mode-stats {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mode-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.mode-icon {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid;
}

.mode-item.online .mode-icon {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.2);
}

.mode-item.offline .mode-icon {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.2);
}

.mode-item.biometric .mode-icon {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.2);
}

.map-legend {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  z-index: 1000;
}

.map-legend h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #374151;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-dot.verified {
  background: #10b981;
}

.legend-dot.pending {
  background: #f59e0b;
}

.legend-dot.rejected {
  background: #ef4444;
}

.legend-border {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid;
  background: white;
}

.legend-border.online {
  border-color: #3b82f6;
}

.legend-border.offline {
  border-color: #8b5cf6;
}

.legend-border.biometric {
  border-color: #f97316;
}

/* Custom Leaflet Styles */
:deep(.leaflet-container) {
  background: #f0f8ff;
  font-family: 'Inter', sans-serif;
}

:deep(.leaflet-control-zoom) {
  border: none !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

:deep(.leaflet-control-zoom a) {
  background: white !important;
  color: #374151 !important;
  border: none !important;
  width: 34px !important;
  height: 34px !important;
  line-height: 34px !important;
  font-size: 18px !important;
  font-weight: bold !important;
  border-radius: 8px !important;
}

:deep(.leaflet-control-zoom a:hover) {
  background: #f3f4f6 !important;
}

:deep(.custom-district-marker) {
  background: transparent !important;
  border: none !important;
}

:deep(.custom-marker:hover) {
  transform: scale(1.1) !important;
}

/* Custom Popup Styles */
:deep(.custom-popup .leaflet-popup-content-wrapper) {
  background: var(--va-background-primary, white) !important;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  padding: 0;
  overflow: hidden;
}

:deep(.custom-popup .leaflet-popup-content) {
  margin: 0;
  padding: 0;
  width: auto !important;
}

:deep(.custom-popup .leaflet-popup-tip) {
  background: var(--va-background-primary, white) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.district-popup) {
  padding: 16px;
  font-family: 'Inter', sans-serif;
}

:deep(.popup-title) {
  font-size: 16px;
  font-weight: 700;
  color: var(--va-text-primary, #1f2937) !important;
  margin: 0 0 4px 0;
}

:deep(.popup-state) {
  font-size: 12px;
  color: var(--va-text-secondary, #6b7280) !important;
  margin: 0 0 12px 0;
  font-style: italic;
}

:deep(.popup-stats) {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

:deep(.stat-row) {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.stat-label) {
  font-size: 13px;
  color: var(--va-text-secondary, #6b7280) !important;
  font-weight: 500;
}

:deep(.stat-value) {
  font-size: 13px;
  font-weight: 600;
  color: var(--va-text-primary, #1f2937) !important;
}

:deep(.stat-value.mode-online) {
  color: #3b82f6;
}

:deep(.stat-value.mode-offline) {
  color: #8b5cf6;
}

:deep(.stat-value.mode-biometric) {
  color: #f97316;
}

:deep(.stat-value.status-verified) {
  color: #10b981;
}

:deep(.stat-value.status-pending) {
  color: #f59e0b;
}

:deep(.stat-value.status-rejected) {
  color: #ef4444;
}

:deep(.popup-footer) {
  text-align: center;
  padding-top: 8px;
  border-top: 1px solid var(--va-background-border, #e5e7eb);
}

:deep(.popup-footer small) {
  color: var(--va-text-secondary, #9ca3af) !important;
  font-size: 11px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .map-container {
    height: 500px;
  }

  .search-overlay {
    width: calc(100% - 40px);
    left: 20px;
    transform: none;
  }

  .stats-overlay {
    position: relative;
    top: 0;
    left: 0;
    margin: 16px;
  }

  .stats-grid {
    flex-wrap: wrap;
    gap: 8px;
  }

  .stat-card {
    min-width: 70px;
    padding: 10px 12px;
  }

  .stat-number {
    font-size: 20px;
  }

  .mode-overlay {
    position: relative;
    top: 0;
    left: 0;
    margin: 16px;
  }

  .map-legend {
    position: relative;
    bottom: 0;
    right: 0;
    margin: 16px;
    width: calc(100% - 32px);
  }
}

/* Dark theme support */
[data-theme='dark'] .verification-map-card {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

[data-theme='dark'] .stat-card,
[data-theme='dark'] .mode-stats,
[data-theme='dark'] .map-legend,
[data-theme='dark'] .search-input {
  background: rgba(31, 41, 55, 0.95) !important;
  color: white !important;
}

[data-theme='dark'] .stat-label,
[data-theme='dark'] .legend-item {
  color: #d1d5db !important;
}

[data-theme='dark'] .map-legend h4 {
  color: white !important;
}

/* Additional popup theme fixes */
[data-theme='dark'] :deep(.custom-popup .leaflet-popup-content-wrapper) {
  background: var(--va-background-primary) !important;
}

[data-theme='dark'] :deep(.custom-popup .leaflet-popup-tip) {
  background: var(--va-background-primary) !important;
}

[data-theme='light'] :deep(.custom-popup .leaflet-popup-content-wrapper) {
  background: white !important;
}

[data-theme='light'] :deep(.custom-popup .leaflet-popup-tip) {
  background: white !important;
}
</style>
