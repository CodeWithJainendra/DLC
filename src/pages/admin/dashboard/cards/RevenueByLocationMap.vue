<template>
  <VaCard class="verification-map-card">
    <VaCardContent class="p-0">

      <!-- Leaflet Map Section -->
      <div class="map-container">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-overlay">
          <div class="loading-content">
            <VaIcon name="refresh" size="24px" class="loading-spinner" />
            <p>Loading pensioners data...</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-if="apiError" class="error-overlay">
          <div class="error-content">
            <VaIcon name="error" size="24px" color="#f44336" />
            <p>{{ apiError }}</p>
            <button @click="fetchPensionersData()" class="retry-btn">
              <VaIcon name="refresh" size="16px" />
              Retry
            </button>
          </div>
        </div>

        <!-- Breadcrumb Navigation -->
        <div v-if="currentViewLevel !== 'state'" class="breadcrumb-nav">
          <button @click="backToStateView" class="breadcrumb-btn">
            🗺️ States
          </button>
          <span class="breadcrumb-separator">→</span>
          <button 
            v-if="currentViewLevel === 'district'" 
            class="breadcrumb-btn active"
          >
            🏛️ {{ selectedState }} Districts
          </button>
          <button 
            v-if="currentViewLevel === 'pincode'" 
            @click="backToDistrictView"
            class="breadcrumb-btn"
          >
            🏛️ {{ selectedState }} Districts
          </button>
          <span v-if="currentViewLevel === 'pincode'" class="breadcrumb-separator">→</span>
          <button 
            v-if="currentViewLevel === 'pincode'" 
            class="breadcrumb-btn active"
          >
            📍 {{ selectedDistrict }} Pincodes
          </button>
        </div>

        <div id="leaflet-map" class="leaflet-map"></div>

        <!-- State Info Popup Modal -->
        <VaModal v-model="showStateModal" size="large" :mobile-fullscreen="false" class="state-modal">
          <template #header>
            <h2 class="text-xl font-bold">{{ selectedStateData?.name }} - Pensioner Details</h2>
          </template>
          
          <div v-if="selectedStateData" class="p-4">
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div class="bg-blue-50 p-4 rounded-lg text-center">
                <div class="text-2xl font-bold text-blue-600">{{ selectedStateData.totalPensioners.toLocaleString() }}</div>
                <div class="text-sm text-gray-600">Total Pensioners</div>
              </div>
              <div class="bg-green-50 p-4 rounded-lg text-center">
                <div class="text-2xl font-bold text-green-600">{{ selectedStateData.totalBanks }}</div>
                <div class="text-sm text-gray-600">Banks</div>
              </div>
              <div class="bg-purple-50 p-4 rounded-lg text-center">
                <div class="text-2xl font-bold text-purple-600">{{ selectedStateData.districts.length }}</div>
                <div class="text-sm text-gray-600">Districts</div>
              </div>
            </div>

            <!-- Districts Table -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-3">District-wise Breakdown</h3>
              <div class="overflow-x-auto">
                <table class="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">District</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pensioners</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Banks</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr v-for="district in selectedStateData.districts" :key="district.name" class="hover:bg-gray-50">
                      <td class="px-4 py-2 text-sm font-medium text-gray-900">{{ district.name }}</td>
                      <td class="px-4 py-2 text-sm text-gray-600">{{ district.pensioners.toLocaleString() }}</td>
                      <td class="px-4 py-2 text-sm text-gray-600">{{ district.banks }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Banks List -->
            <div>
              <h3 class="text-lg font-semibold mb-3">Top Banks in {{ selectedStateData.name }}</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div v-for="bank in selectedStateData.topBanks" :key="bank.name" 
                     class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span class="font-medium">{{ bank.name }}</span>
                  <span class="text-sm text-gray-600">{{ bank.count }} pensioners</span>
                </div>
              </div>
            </div>
          </div>
        </VaModal>


        <!-- Floating Legend Panel -->
        <div class="floating-legend-container">
          <!-- Small Floating Card Button - Always positioned -->
          <div class="floating-card-wrapper">
            <div
              v-if="!showLegendPanel"
              class="floating-legend-card"
              @click="toggleLegendPanel"
            >
              <VaIcon name="bar_chart" size="18px" />
              <span class="card-text">View Stats</span>
            </div>

          </div>

          <!-- Expanded Legend Panel - Separate positioning -->
          <transition name="legend-expand">
            <div v-if="showLegendPanel" class="expanded-legend-panel">
              <!-- Close Button -->
              <div class="legend-close-btn" @click="toggleLegendPanel">
                <VaIcon name="close" size="14px" color="#666" />
              </div>

              <!-- Legend Content -->
              <div class="legend-content">
                <!-- Pensioner Count Color Legend -->
                <div class="legend-section">
                  <h4>Pensioner Count Ranges</h4>
                  <div class="legend-items">
                    <div class="legend-item">
                      <div class="legend-color" style="background-color: #7f1d1d;"></div>
                      <span>5,000+ Highest</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-color" style="background-color: #dc2626;"></div>
                      <span>2,000 - 5,000</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-color" style="background-color: #ef4444;"></div>
                      <span>1,000 - 2,000</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-color" style="background-color: #f87171;"></div>
                      <span>500 - 1,000</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-color" style="background-color: #fca5a5;"></div>
                      <span>1 - 500 Lowest</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-color" style="background-color: #e5e7eb;"></div>
                      <span>0 No Data</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </VaCardContent>
  </VaCard>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { pensionersApi, excelPensionerApi, type ExcelPensionerData } from '@/services/pensionersApi'
import { useGlobalStore } from '@/stores/global-store'
// Remove problematic import and define interface locally
interface Pensioner {
  pensioner_state: string
  pensioner_district: string
  disbursing_agency: string
  [key: string]: any
}
import * as L from 'leaflet'

// Type definitions
interface VerificationData {
  state: string
  district: string
  total: number
  completed: number
  pending: number
  coordinates?: { latitude: number, longitude: number }
  pensioners?: any[]
}

interface LocationData {
  locations: Array<{
    state: string
    district: string
    count: number
    coordinates?: { lat: number, lng: number }
    pensioners: Array<{ pin: string }>
  }>
}

// Reactive variables
const useCustomGeoJSON = ref(true) // Set to true for choropleth as default
const showLegendPanel = ref(false)
const showChatbot = ref(false)
const showStateModal = ref(false)
const isLoading = ref(true)
const apiError = ref<string | null>(null)
const pensionersData = ref<any[]>([])
const stateWiseData = ref<Record<string, any>>({})
const excelPensionerData = ref<ExcelPensionerData | null>(null)
const currentViewLevel = ref<'state' | 'district' | 'pincode'>('state')
const selectedState = ref<string>('')
const selectedDistrict = ref<string>('')
const selectedStateData = ref<any>(null)

// Global store
const globalStore = useGlobalStore()

// Map variables
let map: L.Map | null = null
let choroplethLayer: L.GeoJSON | null = null
let pincodeLayer: L.GeoJSON | null = null
let districtMarkersLayer: L.LayerGroup | null = null
let currentDistrictData: any[] = []
let markers: L.Marker[] = []
let markersLayer: L.LayerGroup | null = null
let tooltipDiv: HTMLElement | null = null

// Hierarchical map data
let indiaStateData: any = null
let pincodeData: any = null
let currentZoom = 5

// Additional data variables
const verificationData = ref<VerificationData[]>([])
const rawData = ref<any>(null)

// Helper functions
const generateVerificationData = () => {
  // Generate sample verification data
  return {
    locations: [
      { state: 'Uttar Pradesh', district: 'Lucknow', total: 1500, completed: 1200, pending: 300 },
      { state: 'Maharashtra', district: 'Mumbai', total: 2000, completed: 1800, pending: 200 },
      { state: 'Karnataka', district: 'Bangalore', total: 1200, completed: 1000, pending: 200 },
      { state: 'Tamil Nadu', district: 'Chennai', total: 800, completed: 700, pending: 100 },
      { state: 'West Bengal', district: 'Kolkata', total: 900, completed: 750, pending: 150 }
    ]
  }
}

const getMapVisualizationData = (data: any): VerificationData[] => {
  return data.locations.map((location: any) => ({
    state: location.state,
    district: location.district,
    total: location.total,
    completed: location.completed,
    pending: location.pending,
    coordinates: getCoordinatesForLocation(location.state, location.district)
  }))
}

const getCoordinatesForLocation = (state: string, district: string) => {
  const coordinates: Record<string, { latitude: number, longitude: number }> = {
    'Lucknow': { latitude: 26.8467, longitude: 80.9462 },
    'Mumbai': { latitude: 19.0760, longitude: 72.8777 },
    'Bangalore': { latitude: 12.9716, longitude: 77.5946 },
    'Chennai': { latitude: 13.0827, longitude: 80.2707 },
    'Kolkata': { latitude: 22.5726, longitude: 88.3639 }
  }
  return coordinates[district] || coordinates[state]
}

const loadVerificationData = async () => {
  console.log('🔄 Loading real pensioner data from API...')
  
  try {
    // Fetch real data from your API with cache busting
    const timestamp = new Date().getTime()
    const response = await fetch(`http://100.113.47.45:8080/pensioners?t=${timestamp}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      mode: 'cors'
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const apiData = await response.json()
    const pensioners = apiData.DLC_generated_pensioners || []
    
    console.log(`📊 Received ${pensioners.length} pensioners from API`)

    // Create more granular data points by grouping by smaller areas or creating individual points
    const realVerificationData: VerificationData[] = []
    
    // Method 1: Group by state-district but create multiple points per district if there are many pensioners
    const locationGroups: { [key: string]: any[] } = {}
    
    pensioners.forEach((pensioner: any) => {
      const state = pensioner.pensioner_state || 'Unknown'
      const district = pensioner.pensioner_district || 'Unknown'
      const locationKey = `${state}-${district}`
      
      if (!locationGroups[locationKey]) {
        locationGroups[locationKey] = []
      }
      locationGroups[locationKey].push(pensioner)
    })

    // Create multiple data points for districts with many pensioners
    Object.entries(locationGroups).forEach(([locationKey, districtPensioners]) => {
      const [state, district] = locationKey.split('-')
      
      // If a district has more than 10 pensioners, split it into multiple points
      if (districtPensioners.length > 10) {
        const chunks = Math.ceil(districtPensioners.length / 10)
        for (let i = 0; i < chunks; i++) {
          const chunk = districtPensioners.slice(i * 10, (i + 1) * 10)
          const firstPensioner = chunk[0]
          const coordinates = firstPensioner.pensioner_coordinates || 
                            { pensioner_latitude: null, pensioner_longitude: null }
          
          // Add slight offset to prevent overlapping markers
          const baseLat = coordinates.pensioner_latitude || coordinates[0] || 0
          const baseLng = coordinates.pensioner_longitude || coordinates[1] || 0
          const offset = i * 0.01 // Small offset for each chunk
          
          const locationData: VerificationData = {
            state: state,
            district: `${district} (Area ${i + 1})`,
            total: chunk.length,
            completed: Math.floor(chunk.length * 0.8),
            pending: Math.ceil(chunk.length * 0.2),
            coordinates: {
              latitude: baseLat + offset,
              longitude: baseLng + offset
            },
            pensioners: chunk
          }
          
          realVerificationData.push(locationData)
        }
      } else {
        // For districts with 10 or fewer pensioners, create single point
        const firstPensioner = districtPensioners[0]
        const coordinates = firstPensioner.pensioner_coordinates || 
                          { pensioner_latitude: null, pensioner_longitude: null }
        
        const locationData: VerificationData = {
          state: state,
          district: district,
          total: districtPensioners.length,
          completed: Math.floor(districtPensioners.length * 0.8),
          pending: Math.ceil(districtPensioners.length * 0.2),
          coordinates: {
            latitude: coordinates.pensioner_latitude || coordinates[0],
            longitude: coordinates.pensioner_longitude || coordinates[1]
          },
          pensioners: districtPensioners
        }
        
        realVerificationData.push(locationData)
      }
    })

    // Use only real API data - no sample data
    const combinedData = [...realVerificationData]
    
    verificationData.value = combinedData
    rawData.value = { pensioners: pensioners, locations: combinedData }
    
    // Force a visual update to show real data is loaded
    console.log('🎯 REAL DATA LOADED - Check map for actual API data!')
    console.log('📊 Sample of real data:')
    combinedData.slice(0, 5).forEach((loc, index) => {
      console.log(`  ${index + 1}. ${loc.district}, ${loc.state}: ${loc.total} pensioners`)
    })
    
    console.log(`✅ Loaded ${realVerificationData.length} real locations from API`)
    console.log(`🎯 Total data points: ${combinedData.length} (real API data only)`)
    console.log(`📋 Real API locations:`, realVerificationData.map(loc => `${loc.district}, ${loc.state}`).slice(0, 10))
    
    // Debug: Check specific locations
    const puneData = realVerificationData.filter(loc => loc.district.toLowerCase().includes('pune'))
    console.log(`🔍 Pune data found:`, puneData.length, puneData.map(loc => `${loc.district}: ${loc.total} pensioners`))
    
    const maharashtraData = realVerificationData.filter(loc => loc.state.toLowerCase().includes('maharashtra'))
    console.log(`🔍 Maharashtra data found:`, maharashtraData.length, maharashtraData.map(loc => `${loc.district}: ${loc.total} pensioners`))
    
  } catch (error) {
    console.error('❌ Error loading real data:', error)
    // Fallback to static data
    const generatedData = generateVerificationData()
    rawData.value = generatedData
    verificationData.value = getMapVisualizationData(generatedData)
    console.log('⚠️ Using fallback static data')
  }
}

// Additional data variables
const stateWisePensionerData = ref<Record<string, any>>({})
const districtData = ref<any[]>([])
const pincodeDataByDistrict = ref<Record<string, any[]>>({})

// State-wise data for choropleth coloring (based on API data)
const stateData = ref<Record<string, number>>({})

// Additional analytics data from API
const departmentData = ref<Record<string, number>>({})
const dlcTypeData = ref<Record<string, number>>({})
const disbursingAuthorityData = ref<Record<string, number>>({})
const ageDistributionData = ref<Record<string, number>>({})

// Process state-wise data for enhanced map features with pincode counting
const processStateWiseData = (pensioners: any[]) => {
  const stateGroups: any = {}
  
  pensioners.forEach(pensioner => {
    const state = pensioner.pensioner_state || 'Unknown'
    const district = pensioner.pensioner_district || 'Unknown'
    const bank = pensioner.disbursing_agency || 'Unknown Bank'
    const pincode = pensioner.pensioner_pincode || 'Unknown'
    
    if (!stateGroups[state]) {
      stateGroups[state] = {
        totalPensioners: 0,
        districts: {},
        banks: {},
        pincodes: new Set(),
        pensioners: []
      }
    }
    
    stateGroups[state].totalPensioners++
    stateGroups[state].pensioners.push(pensioner)
    stateGroups[state].pincodes.add(pincode)
    
    if (!stateGroups[state].districts[district]) {
      stateGroups[state].districts[district] = {
        pensioners: 0,
        banks: new Set(),
        pincodes: new Set()
      }
    }
    stateGroups[state].districts[district].pensioners++
    stateGroups[state].districts[district].banks.add(bank)
    stateGroups[state].districts[district].pincodes.add(pincode)
    
    if (!stateGroups[state].banks[bank]) {
      stateGroups[state].banks[bank] = 0
    }
    stateGroups[state].banks[bank]++
  })
  
  const processedData: any = {}
  Object.entries(stateGroups).forEach(([stateName, stateInfo]: [string, any]) => {
    processedData[stateName] = {
      name: stateName,
      totalPensioners: stateInfo.totalPensioners,
      totalBanks: Object.keys(stateInfo.banks).length || stateInfo.banks?.size || 0,
      totalPincodes: stateInfo.pincodes.size,
      districts: Object.entries(stateInfo.districts).map(([districtName, districtInfo]: [string, any]) => ({
        name: districtName,
        pensioners: districtInfo.pensioners,
        banks: districtInfo.banks.size,
        pincodes: districtInfo.pincodes.size
      })).sort((a, b) => b.pensioners - a.pensioners),
      topBanks: Object.entries(stateInfo.banks)
        .map(([bankName, count]) => ({ name: bankName, count }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 10),
      pensioners: stateInfo.pensioners
    }
  })
  
  return processedData
}

// Global function to open state details (called from popup)
const openStateDetails = (stateName: string) => {
  const stateInfo = (stateWisePensionerData.value as any)[stateName]
  if (stateInfo) {
    selectedStateData.value = stateInfo
    showStateModal.value = true
  }
}

// Make function globally available
if (typeof window !== 'undefined') {
  (window as any).openStateDetails = openStateDetails
}

// Fetch DLC Bank Pincode data (actual analysis results)
const fetchExcelPensionerData = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/dlc-bank-pincode-data')
    if (response.ok) {
      const data = await response.json()
      excelPensionerData.value = data
      console.log('📊 DLC Bank Pincode data loaded:', data)
      console.log('🎯 Total DLC Completed:', data.total_records)
      console.log('🏦 Unique Bank Pincodes:', data.total_bank_pincodes)
      console.log('🗺️ Rajasthan data:', data.state_wise_data?.Rajasthan)
      Object.keys(data.state_wise_data).forEach(state => {
        const stateInfo = data.state_wise_data[state]
        stateWisePensionerData.value[state] = {
          totalVerifications: stateInfo.total_pensioners, // Bank verifications in this state
          ageGroups: stateInfo.age_groups,
          pensionerOrigins: stateInfo.bank_locations, // Where pensioners come from
          pincodeCounts: stateInfo.pincode_counts || {} // Exact verification counts per pincode in this bank state
        }
      })
    } else {
      console.error('Failed to fetch DLC bank pincode data:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Error response:', errorText)
    }
  } catch (error) {
    console.error('Error fetching DLC bank pincode data:', error)
    console.error('Make sure backend is running on http://localhost:5000')
  }
}

// Fetch pensioners data from API
const fetchPensionersData = async () => {
  try {
    isLoading.value = true
    apiError.value = null
    
    console.log('🔄 Fetching pensioners data...')
    
    // Fetch both regular pensioner data and Excel data
    const [response] = await Promise.all([
      pensionersApi.getPensioners(),
      fetchExcelPensionerData()
    ])
    
    pensionersData.value = response.DLC_generated_pensioners || []
    
    // Process data for analytics
    stateData.value = pensionersApi.getStateWiseData(pensionersData.value)
    departmentData.value = pensionersApi.getDepartmentWiseData(pensionersData.value)
    dlcTypeData.value = pensionersApi.getDLCTypeWiseData(pensionersData.value)
    disbursingAuthorityData.value = pensionersApi.getDisbursingAuthorityData(pensionersData.value)
    ageDistributionData.value = pensionersApi.getAgeDistribution(pensionersData.value)
    
    // Process state-wise data for enhanced map features
    stateWiseData.value = processStateWiseData(pensionersData.value)
    
    console.log('✅ Pensioners data loaded:', {
      total: pensionersData.value.length,
      states: Object.keys(stateData.value).length,
      departments: Object.keys(departmentData.value).length,
      excel_data_available: !!excelPensionerData.value
    })
    

  } catch (error) {
    console.error('Error fetching pensioners data:', error)
    apiError.value = 'Failed to load pensioners data'
  } finally {
    isLoading.value = false
  }
}

// Toggle legend panel function
const toggleLegendPanel = () => {
  showLegendPanel.value = !showLegendPanel.value

  // When opening the stats panel, fit the map to show active markers or current layer bounds
  if (showLegendPanel.value && map) {
    // Ensure Leaflet recalculates container size before fitting bounds
    try { map.invalidateSize(true) } catch (e) {}
    setTimeout(() => {
      try {
        // Determine best bounds source
        let bounds: L.LatLngBounds | null = null
        if (districtMarkersLayer && (districtMarkersLayer as any).getLayers?.().length > 0) {
          bounds = (districtMarkersLayer as any).getBounds?.() ?? null
        } else if (markersLayer && (markersLayer as any).getLayers?.().length > 0) {
          bounds = (markersLayer as any).getBounds?.() ?? null
        } else if (markers.length > 0) {
          bounds = L.featureGroup(markers).getBounds()
        } else if (choroplethLayer) {
          bounds = choroplethLayer.getBounds()
        }
        if (bounds && bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [30, 30],
            maxZoom: 6
          })
          console.log('🗺️ Map fitted to active bounds')
        }
      } catch (error) {
        console.error('Error fitting map bounds:', error)
      }
    }, 100) // Small delay to ensure panel animation completes
  }
}

// Toggle map type function
const toggleMapType = () => {
  if (!map) return

  console.log('🔄 Toggling map type:', useCustomGeoJSON.value ? 'Choropleth' : 'Markers')

  if (useCustomGeoJSON.value) {
    // Switch to choropleth map showing state-wise data
    showChoroplethMap()
  } else {
    // Switch back to marker map
    showMarkerMap()
  }
}

// Load both India state data and pincode data with caching
const loadMapData = async () => {
  try {
    // Check if data is already cached
    if (indiaStateData && pincodeData) {
      console.log('🚀 Using cached map data for faster loading')
      return
    }

    // Load India state boundaries with cache headers
    const indiaResponse = await fetch('/india.json', {
      cache: 'force-cache',
      headers: {
        'Cache-Control': 'max-age=86400' // Cache for 24 hours
      }
    })
    if (!indiaResponse.ok) {
      throw new Error(`India JSON error: ${indiaResponse.status}`)
    }
    indiaStateData = await indiaResponse.json()
    console.log('🗺️ India state data loaded:', indiaStateData.features?.length, 'states')

    // Load pincode boundaries with cache headers
    const pincodeResponse = await fetch('/All_India_pincode_Boundary.geojson', {
      cache: 'force-cache',
      headers: {
        'Cache-Control': 'max-age=86400' // Cache for 24 hours
      }
    })
    if (!pincodeResponse.ok) {
      throw new Error(`Pincode GeoJSON error: ${pincodeResponse.status}`)
    }
    const rawPincodeData = await pincodeResponse.json()
    
    // Filter out Pakistan territories
    const indianPincodes = rawPincodeData.features.filter((feature: any) => {
      const circle = feature.properties.Circle?.toLowerCase() || ''
      const region = feature.properties.Region?.toLowerCase() || ''
      const officeName = feature.properties.Office_Name?.toLowerCase() || ''
      
      return !circle.includes('pakistan') && 
             !circle.includes('pak') && 
             !region.includes('pakistan') && 
             !region.includes('pak') && 
             !officeName.includes('pakistan') && 
             !officeName.includes('pak') &&
             !circle.includes('pok') &&
             !region.includes('pok')
    })
    
    pincodeData = {
      ...rawPincodeData,
      features: indianPincodes
    }
    
    console.log('📍 Pincode data loaded:', pincodeData.features?.length, 'pincodes (Pakistan excluded)')
    
  } catch (error) {
    console.error('❌ Error loading map data:', error)
  }
}

// Show hierarchical choropleth map
const showChoroplethMap = () => {
  if (!map) return
  
  console.log('🗺️ Showing hierarchical choropleth map...')
  
  // Clear existing layers
  clearMarkers()
  if (choroplethLayer) {
    map.removeLayer(choroplethLayer)
    choroplethLayer = null
  }
  if (pincodeLayer) {
    map.removeLayer(pincodeLayer)
    pincodeLayer = null
  }
  
  // Load map data if not already loaded
  if (!indiaStateData || !pincodeData) {
    loadMapData().then(() => {
      showChoroplethMap()
    })
    return
  }
  
  // Show state-level map initially
  showStateLevelMap()
}

// Show district-level view when state is clicked
const showDistrictView = (stateName: string, bounds: any) => {
  if (!map || !pincodeData) return
  
  console.log(`🏛️ Showing district view for ${stateName}...`)
  
  // Hide any existing hover card immediately
  hideHoverCard()
  
  // Close any Leaflet popups that might be open
  map?.closePopup()
  
  // Clear the selected state info popup card
  globalStore.clearSelectedStateInfo()
  
  // Remove existing layers before switching views
  if (choroplethLayer) {
    map.removeLayer(choroplethLayer)
    choroplethLayer = null
  }
  if (pincodeLayer) {
    map.removeLayer(pincodeLayer)
    pincodeLayer = null
  }
  
  currentViewLevel.value = 'district'
  selectedState.value = stateName
  
  // Filter pincode data for the selected state with more comprehensive matching
  const statePincodes = pincodeData.features.filter((feature: any) => {
    const circle = feature.properties.Circle?.trim() || ''
    const state = feature.properties.State?.trim() || ''
    const stNm = feature.properties.st_nm?.trim() || ''
    
    // Normalize state names for better matching
    const normalizeStateName = (name: string) => name.toLowerCase().replace(/\s+/g, ' ').trim()
    const targetState = normalizeStateName(stateName)
    
    // Try multiple property matches for state filtering with normalized names
    return normalizeStateName(circle) === targetState ||
           normalizeStateName(state) === targetState ||
           normalizeStateName(stNm) === targetState ||
           // Also try exact matches without normalization
           circle.toLowerCase() === stateName.toLowerCase() ||
           state.toLowerCase() === stateName.toLowerCase() ||
           stNm.toLowerCase() === stateName.toLowerCase()
  })
  
  console.log(`🔍 Found ${statePincodes.length} pincodes for ${stateName}`)
  console.log(`📋 Sample pincode properties:`, statePincodes[0]?.properties)
  
  if (statePincodes.length === 0) {
    console.log(`⚠️ No pincode data found for ${stateName}`)
    return
  }
  
  // Group pincodes by Division (District)
  const districtGroups: any = {}
  statePincodes.forEach((feature: any) => {
    const division = feature.properties.Division?.trim() || 'Unknown'
    if (!districtGroups[division]) {
      districtGroups[division] = []
    }
    districtGroups[division].push(feature)
  })
  
  // Create proper district boundaries by merging all pincodes in each district
  const districtFeatures = Object.keys(districtGroups).map(division => {
    const pincodes = districtGroups[division]
    
    // Create a MultiPolygon geometry that includes all pincodes in the district
    const allCoordinates: any[] = []
    pincodes.forEach((pincode: any) => {
      if (pincode.geometry && pincode.geometry.coordinates) {
        if (pincode.geometry.type === 'Polygon') {
          allCoordinates.push(pincode.geometry.coordinates)
        } else if (pincode.geometry.type === 'MultiPolygon') {
          pincode.geometry.coordinates.forEach((polyCoords: any) => {
            allCoordinates.push(polyCoords)
          })
        }
      }
    })
    
    // Calculate district center from all pincodes
    let totalLat = 0, totalLng = 0, count = 0
    pincodes.forEach((pincode: any) => {
      if (pincode.geometry && pincode.geometry.coordinates) {
        const coords = pincode.geometry.coordinates[0]
        coords.forEach((coord: any) => {
          totalLng += coord[0]
          totalLat += coord[1]
          count++
        })
      }
    })
    
    const centerLat = totalLat / count
    const centerLng = totalLng / count
    
    return {
      type: 'Feature',
      properties: {
        division: division,
        pincodeCount: pincodes.length,
        state: stateName,
        center: [centerLng, centerLat]
      },
      geometry: {
        type: 'MultiPolygon',
        coordinates: allCoordinates
      }
    }
  })
  
  // Store district data for later use
  districtData.value = districtFeatures
  pincodeDataByDistrict.value = districtGroups
  
  // Keep state boundaries visible but dimmed and remove hover events
  // Don't remove choroplethLayer completely, just modify its style
  if (choroplethLayer) {
    choroplethLayer.eachLayer((layer: any) => {
      const layerStateName = layer.feature?.properties?.st_nm
      if (layerStateName === stateName) {
        // Hide the selected state to avoid overlap
        layer.setStyle({ fillOpacity: 0, opacity: 0 })
      } else {
        // Dim surrounding states but keep them visible
        layer.setStyle({
          fillColor: '#f8fafc',
          fillOpacity: 0.3,
          color: '#cbd5e1',
          weight: 1,
          opacity: 0.6
        })
      }
      // Remove original events but add new ones for surrounding states
      layer.off('mouseover')
      layer.off('mouseout')
      layer.off('mousemove')
      layer.off('click')
      
      // Add hover and click events for surrounding states
      if (layerStateName !== stateName) {
        const surroundingStateData = (stateWisePensionerData.value as any)[layerStateName] || {}
        // Calculate total banks from districts if available
        const districtBankCount = surroundingStateData.districts ? 
          surroundingStateData.districts.reduce((total: number, district: any) => total + (district.banks || 0), 0) : 0
        const surroundingHoverData = {
          name: layerStateName,
          totalPensioners: surroundingStateData.totalPensioners || 0,
          districts: surroundingStateData.districts || [],
          totalBanks: Math.max(surroundingStateData.totalBanks || 0, districtBankCount)
        }
        
        layer.on({
          mouseover: (e: any) => {
            showHoverCard(e, surroundingHoverData, 'state')
            e.target.setStyle({
              fillColor: '#e2e8f0',
              fillOpacity: 0.6,
              color: '#64748b',
              weight: 2
            })
          },
          mouseout: (e: any) => {
            hideHoverCard()
            // Restore dimmed style
            e.target.setStyle({
              fillColor: '#f8fafc',
              fillOpacity: 0.3,
              color: '#cbd5e1',
              weight: 1,
              opacity: 0.6
            })
          },
          mousemove: (e: any) => {
            if (tooltipDiv && tooltipDiv.style.opacity === '1') {
              const rect = tooltipDiv.getBoundingClientRect()
              const x = e.originalEvent.pageX + 15
              const y = e.originalEvent.pageY - rect.height - 10
              tooltipDiv.style.left = x + 'px'
              tooltipDiv.style.top = y + 'px'
            }
          },
          click: (e: any) => {
            hideHoverCard()
            map?.closePopup()
            showDistrictView(layerStateName, e.target.getBounds())
          }
        })
      }
    })
  }
  
  if (pincodeLayer) {
    map.removeLayer(pincodeLayer)
    pincodeLayer = null
  }
  
  // Create district layer
  const districtGeoJSON = {
    type: 'FeatureCollection' as const,
    features: districtFeatures
  }
  
  // Calculate pensioner counts for each district from Excel data and neighboring states
  const districtPensionerCounts: { [key: string]: number } = {}
  const allDistrictData: { [key: string]: { count: number, state: string, bankPincodes: string[] } } = {}
  
  // Process current state districts
  districtFeatures.forEach(feature => {
    const division = feature.properties.division
    let pensionerCount = 0
    const bankPincodes: string[] = []
    
    console.log(`🔍 Processing district: ${division} for state: ${stateName}`)
    
    // Count pensioners who LIVE in this district (not where banks are)
    if (excelPensionerData.value?.bank_pincode_data) {
      const bankData = excelPensionerData.value.bank_pincode_data
      
      // Go through all bank locations and find pensioners from this district
      Object.entries(bankData).forEach(([bankPincode, bankInfo]: [string, any]) => {
        if (bankInfo.pensioner_states && bankInfo.pensioner_states[stateName]) {
          // This bank has pensioners from our state
          const pensionersFromState = bankInfo.pensioner_states[stateName]
          
          // For now, distribute evenly across districts in the state
          // In a real implementation, you'd need pensioner pincode data
          pensionerCount += Math.floor(pensionersFromState / 10) // Rough distribution
          
          console.log(`✅ Bank ${bankPincode} served ${pensionersFromState} pensioners from ${stateName}`)
        }
      })
    }
    
    console.log(`📊 Final count for ${division}: ${pensionerCount} DLC verifications from ${bankPincodes.length} bank locations`)
    districtPensionerCounts[division] = pensionerCount
    allDistrictData[division] = { count: pensionerCount, state: stateName, bankPincodes }
  })
  
  // Add neighboring state districts for context
  const neighboringStates = getNeighboringStates(stateName)
  neighboringStates.forEach(neighborState => {
    if (excelPensionerData.value?.state_wise_data?.[neighborState]) {
      const neighborStateData = excelPensionerData.value.state_wise_data[neighborState]
      
      if (neighborStateData.pincode_counts) {
        const neighborDistrictCounts: { [key: string]: { count: number, pincodes: string[] } } = {}
        
        Object.entries(neighborStateData.pincode_counts).forEach(([pincode, count]) => {
          const district = getDistrictFromPincode(pincode)
          if (!neighborDistrictCounts[district]) {
            neighborDistrictCounts[district] = { count: 0, pincodes: [] }
          }
          neighborDistrictCounts[district].count += Number(count) || 0
          neighborDistrictCounts[district].pincodes.push(pincode)
        })
        
        Object.entries(neighborDistrictCounts).forEach(([district, data]) => {
          if (!allDistrictData[district]) {
            allDistrictData[district] = { 
              count: data.count, 
              state: neighborState, 
              bankPincodes: data.pincodes 
            }
          }
        })
      }
    }
  })

  const districtLayer = L.geoJSON(districtGeoJSON, {
    style: (feature: any) => {
      const division = feature?.properties?.division || ''
      const pensionerCount = districtPensionerCounts[division] || 0
      
      // Debug log to check if pensioner counts are being found
      console.log(`District: ${division}, Pensioner Count: ${pensionerCount}`)
      
      // Use district color function with actual pensioner count
      let fillColor = '#e5e7eb' // Default gray
      
      if (pensionerCount === 0) {
        fillColor = '#e5e7eb' // Light gray for no data
      } else if (pensionerCount >= 1000) {
        fillColor = '#7f1d1d' // Very dark red for highest (1k+)
      } else if (pensionerCount >= 500) {
        fillColor = '#dc2626' // Dark red (500-1k)
      } else if (pensionerCount >= 200) {
        fillColor = '#ef4444' // Medium red (200-500)
      } else if (pensionerCount >= 100) {
        fillColor = '#f87171' // Light red (100-200)
      } else if (pensionerCount > 0) {
        fillColor = '#fca5a5' // Very light red for lowest counts (1-100)
      }
      
      return {
        fillColor: fillColor,
        weight: 2,
        opacity: 1,
        color: '#374151',
        dashArray: '',
        fillOpacity: 0.8,
        smoothFactor: 1.0
      }
    },
    onEachFeature: (feature: any, layer: any) => {
      const division = feature.properties.division
      const pincodeCount = feature.properties.pincodeCount
      
      layer.bindPopup(`
        <div class="district-popup" style="font-family: 'Inter', sans-serif; min-width: 220px;">
          <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; font-weight: 700; border-bottom: 2px solid #0ea5e9; padding-bottom: 8px;">
            ${division}
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px;">
            <div style="text-align: center; padding: 8px; background: #f0f9ff; border-radius: 6px; border: 1px solid #e0f2fe;">
              <div style="font-size: 18px; font-weight: 700; color: #0284c7;">${districtPensionerCounts[division] || 0}</div>
              <div style="font-size: 11px; color: #64748b; font-weight: 500;">DLC Completed</div>
            </div>
            <div style="text-align: center; padding: 8px; background: #fef3c7; border-radius: 6px; border: 1px solid #fde68a;">
              <div style="font-size: 16px; font-weight: 600; color: #d97706;">${allDistrictData[division]?.bankPincodes?.length || 0}</div>
              <div style="font-size: 11px; color: #64748b; font-weight: 500;">Bank Locations</div>
            </div>
            <div style="text-align: center; padding: 8px; background: #f0f9ff; border-radius: 6px; border: 1px solid #e0f2fe;">
              <div style="font-size: 14px; font-weight: 600; color: #0369a1;">${allDistrictData[division]?.state || stateName}</div>
              <div style="font-size: 11px; color: #64748b; font-weight: 500;">State</div>
            </div>
          </div>
          <button style="
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); 
            color: white; 
            border: none; 
            padding: 10px 16px; 
            border-radius: 6px; 
            cursor: pointer; 
            font-size: 14px; 
            font-weight: 600;
            width: 100%;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(14, 165, 233, 0.3);
          " onclick="window.showPincodeView && window.showPincodeView('${division}')">
            View Pincodes →
          </button>
        </div>
      `)
      
      layer.on({
        click: (e: any) => {
          const division = feature?.properties?.division || ''
          console.log(`🖱️ District clicked: ${division}`)
          showBankVerificationPincodes(division)
        },
        mouseover: (e: any) => {
          const division = feature?.properties?.division || ''
          const pensionerCount = districtPensionerCounts[division] || 0
          const hoverData = {
            name: `${division} District`,
            pincodeCount: feature?.properties?.pincodeCount || 0,
            pensionerCount: pensionerCount
          }
          showHoverCard(e, hoverData, 'district')
          e.target.setStyle({
            weight: 2.5,
            color: '#0369a1',
            fillOpacity: 0.8
          })
        },
        mouseout: (e: any) => {
          hideHoverCard()
          // Restore original district style with correct pensioner count color
          const division = e.target.feature?.properties?.division || ''
          const pensionerCount = districtPensionerCounts[division] || 0
          
          // Use same color logic as in style function
          let fillColor = '#e5e7eb' // Default gray
          if (pensionerCount === 0) {
            fillColor = '#e5e7eb' // Light gray for no data
          } else if (pensionerCount >= 1000) {
            fillColor = '#7f1d1d' // Very dark red for highest (1k+)
          } else if (pensionerCount >= 500) {
            fillColor = '#dc2626' // Dark red (500-1k)
          } else if (pensionerCount >= 200) {
            fillColor = '#ef4444' // Medium red (200-500)
          } else if (pensionerCount >= 100) {
            fillColor = '#f87171' // Light red (100-200)
          } else if (pensionerCount > 0) {
            fillColor = '#fca5a5' // Very light red for lowest counts (1-100)
          }
          
          e.target.setStyle({
            fillColor: fillColor,
            weight: 2,
            opacity: 1,
            color: '#374151',
            dashArray: '',
            fillOpacity: 0.8,
            smoothFactor: 1.0
          })
        },
        mousemove: (e: any) => {
          if (tooltipDiv && tooltipDiv.style.opacity === '1') {
            const rect = tooltipDiv.getBoundingClientRect()
            const x = e.originalEvent.pageX + 15
            const y = e.originalEvent.pageY - rect.height - 10
            tooltipDiv.style.left = x + 'px'
            tooltipDiv.style.top = y + 'px'
          }
        },
        click: (e: any) => {
          hideHoverCard()
          // Close any existing popups before transitioning
          map?.closePopup()
          showBankVerificationPincodes(division)
        }
      })
    }
  }).addTo(map)
  
  // Store district layer reference
  pincodeLayer = districtLayer
  
  // Zoom to state bounds with more padding to show surrounding states
  map.fitBounds(bounds, { padding: [50, 50], maxZoom: 7 })
  
  // Set up global function for popup button
  ;(window as any).showPincodeView = (division: string) => {
    showBankVerificationPincodes(division)
  }
}

// Show pincode-level view when district is clicked  
const showBankVerificationPincodes = (division: string) => {
  if (!map || !pincodeData) return
  
  console.log(`📍 Showing pincode view for ${division}...`)
  
  hideHoverCard()
  map?.closePopup()
  
  // Remove existing layers before switching views
  if (choroplethLayer) {
    map.removeLayer(choroplethLayer)
    choroplethLayer = null
  }
  if (pincodeLayer) {
    map.removeLayer(pincodeLayer)
    pincodeLayer = null
  }
  
  currentViewLevel.value = 'pincode'
  selectedDistrict.value = division
  
  const pincodes = pincodeDataByDistrict.value[division]
  
  if (!pincodes || pincodes.length === 0) {
    console.log(`⚠️ No pincode data found for district: ${division}`)
    console.log(`📋 Available districts:`, Object.keys(pincodeDataByDistrict.value))
    return
  }
  
  console.log(`📍 Found ${pincodes.length} pincodes for district: ${division}`)
  
  // Create pincode layer
  const pincodeGeoJSON = {
    type: 'FeatureCollection' as const,
    features: pincodes
  }
  
  pincodeLayer = L.geoJSON(pincodeGeoJSON, {
    style: (feature: any) => {
      const pincode = feature?.properties?.Pincode || ''
      
      // Get bank verification count for this pincode from Excel analysis
      let bankVerificationCount = 0
      if (excelPensionerData.value?.bank_pincode_data?.[pincode]) {
        bankVerificationCount = excelPensionerData.value.bank_pincode_data[pincode].total_dlc_completed || 0
      }
      
      console.log(`🏦 Pincode ${pincode}: ${bankVerificationCount} DLC verifications`)
      
      // Red gradient color mapping - zyada bank verifications = dark red
      let fillColor = '#e5e7eb' // Default gray for no data
      
      if (bankVerificationCount === 0) {
        fillColor = '#e5e7eb' // Light gray for no bank activity
      } else if (bankVerificationCount >= 1000) {
        fillColor = '#7f1d1d' // Very dark red for highest bank activity (1000+)
      } else if (bankVerificationCount >= 500) {
        fillColor = '#dc2626' // Dark red (500-1000)
      } else if (bankVerificationCount >= 200) {
        fillColor = '#ef4444' // Medium red (200-500)
      } else if (bankVerificationCount >= 50) {
        fillColor = '#f87171' // Light red (50-200)
      } else if (bankVerificationCount > 0) {
        fillColor = '#fca5a5' // Very light red for minimal bank activity (1-50)
      }
      
      return {
        fillColor: fillColor,
        weight: 1,
        opacity: 0.8,
        color: '#374151',
        dashArray: '',
        fillOpacity: 0.8
      }
    },
    onEachFeature: (feature: any, layer: any) => {
      const pincode = feature.properties.Pincode
      const officeName = feature.properties.Office_Name
      const division = feature.properties.Division
      
      // Get bank verification data for this pincode
      let bankVerificationCount = 0
      let ageGroupData = {}
      let pensionerStatesData = {}
      
      if (excelPensionerData.value?.bank_pincode_data?.[pincode]) {
        const bankData = excelPensionerData.value.bank_pincode_data[pincode]
        bankVerificationCount = bankData.total_dlc_completed || 0
        ageGroupData = bankData.age_groups || {}
        pensionerStatesData = bankData.pensioner_states || {}
      }
      
      // Add hover tooltip with bank verification data
      layer.on('mouseover', (e: any) => {
        console.log(`🏦 Pincode hover: ${pincode}, Bank Verifications: ${bankVerificationCount}`)
        const hoverData = {
          name: `${officeName} (${pincode})`,
          pensionerCount: bankVerificationCount,
          bankCount: bankVerificationCount > 0 ? 1 : 0,
          division: division,
          ageGroups: ageGroupData,
          pensionerStates: pensionerStatesData
        }
        showHoverCard(e, hoverData, 'pincode')
      })
      
      layer.on('mouseout', () => {
        hideHoverCard()
      })
      
      layer.bindPopup(`
        <div class="pincode-popup">
          <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px; font-weight: 700;">
            ${officeName}
          </h3>
          <div style="font-size: 12px; color: #374151;">
            <div style="margin-bottom: 4px;">
              <strong>Pincode:</strong> ${pincode}
            </div>
            <div style="margin-bottom: 4px;">
              <strong>District:</strong> ${division}
            </div>
            <div style="margin-bottom: 4px;">
              <strong>State:</strong> ${selectedState.value}
            </div>
            <div style="margin-bottom: 4px;">
              <strong>Bank DLC Verifications:</strong> ${bankVerificationCount}
            </div>
            <div style="margin-bottom: 4px;">
              <strong>Age Groups:</strong> ${Object.entries(ageGroupData).map(([age, count]) => `${age}: ${count}`).join(', ') || 'No data'}
            </div>
            <div style="margin-bottom: 8px;">
              <strong>Pensioner States:</strong> ${Object.entries(pensionerStatesData).map(([state, count]) => `${state}: ${count}`).join(', ') || 'No data'}
            </div>
          </div>
          <div style="display: flex; gap: 4px;">
            <button style="
              background: #6b7280; 
              color: white; 
              border: none; 
              padding: 4px 8px; 
              border-radius: 3px; 
              cursor: pointer; 
              font-size: 10px;
              flex: 1;
            " onclick="window.backToDistricts && window.backToDistricts()">
              Districts
            </button>
            <button style="
              background: #ef4444; 
              color: white; 
              border: none; 
              padding: 4px 8px; 
              border-radius: 3px; 
              cursor: pointer; 
              font-size: 10px;
              flex: 1;
            " onclick="window.backToStates && window.backToStates()">
              States
            </button>
          </div>
        </div>
      `)
      
      layer.on({
        mouseover: (e: any) => {
          e.target.setStyle({
            weight: 2,
            color: '#059669',
            fillOpacity: 0.8
          })
        },
        mouseout: (e: any) => {
          pincodeLayer?.resetStyle(e.target)
        }
      })
    }
  }).addTo(map)
  
  // Zoom to district bounds
  const bounds = pincodeLayer.getBounds()
  if (bounds.isValid()) {
    map.fitBounds(bounds, { padding: [20, 20] })
  }
  
  // Set up navigation functions
  ;(window as any).backToDistricts = () => {
    backToDistrictView()
  }
  ;(window as any).backToStates = () => {
    backToStateView()
  }
}

// Navigate back to district view
const backToDistrictView = () => {
  if (!map) return
  
  console.log(`🔙 Going back to district view for ${selectedState.value}...`)
  
  // Hide hover cards and close popups
  hideHoverCard()
  map.closePopup()
  
  if (pincodeLayer) {
    map.removeLayer(pincodeLayer)
    pincodeLayer = null
  }
  
  // Reset view level
  currentViewLevel.value = 'district'
  selectedDistrict.value = ''
  
  // Get the selected state bounds for proper navigation
  const stateName = selectedState.value
  if (!stateName) {
    console.error('❌ No selected state for district view')
    return
  }
  
  // Find state bounds
  let stateBounds: any = null
  if (indiaStateData) {
    const stateFeature = indiaStateData.features.find((f: any) => f.properties.st_nm === stateName)
    if (stateFeature) {
      const tempLayer = L.geoJSON(stateFeature)
      stateBounds = tempLayer.getBounds()
    }
  }
  
  // Call showDistrictView to properly recreate district view
  if (stateBounds) {
    showDistrictView(stateName, stateBounds)
  } else {
    console.error('❌ Could not find bounds for state:', stateName)
  }
}

const backToStateView = () => {
  if (!map) return
  
  console.log('🔙 Going back to state view...')
  
  // Hide hover cards and close popups
  hideHoverCard()
  map.closePopup()
  
  // Remove all non-base layers
  if (choroplethLayer) {
    map.removeLayer(choroplethLayer)
    choroplethLayer = null
  }
  if (pincodeLayer) {
    map.removeLayer(pincodeLayer)
    pincodeLayer = null
  }
  
  // Reset view state
  currentViewLevel.value = 'state'
  selectedState.value = ''
  selectedDistrict.value = ''
  globalStore.clearSelectedStateInfo()
  
  // Immediately recreate state map
  showStateLevelMap()
}

// Create custom hover card for states
const createHoverCard = () => {
  if (tooltipDiv) return
  
  tooltipDiv = document.createElement('div')
  tooltipDiv.className = 'map-hover-card'
  tooltipDiv.style.cssText = `
    position: absolute;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 12px 16px;
    min-width: 200px;
    pointer-events: none;
    z-index: 1000;
    opacity: 0;
    transform: translateY(10px) scale(0.95);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: 'Inter', sans-serif;
  `
  document.body.appendChild(tooltipDiv)
}

// Show hover card with state/district details
const showHoverCard = (e: any, data: any, type: 'state' | 'district' | 'pincode') => {
  if (!tooltipDiv) return
  
  let content = ''
  
  if (type === 'state') {
    const { name, totalPensioners, totalBanks, districts, ageGroups } = data
    
    // Get Excel data for this state
    const excelStateData = (excelPensionerData.value?.state_wise_data?.[name] as any) || {}
    
    // Use ONLY Excel data - this shows DLC completion data by age group
    const actualPensioners = excelStateData.total_pensioners || 0
    
    // Count bank pincodes and districts from raw bank data
    let bankPincodeCount = 0
    let bankDistrictCount = 0
    const bankDistricts = new Set()
    
    if (excelPensionerData.value?.bank_pincode_data) {
      const bankData = excelPensionerData.value.bank_pincode_data
      
      // Count bank pincodes in this state
      Object.entries(bankData).forEach(([pincode, info]: [string, any]) => {
        if (info.state === name) {
          bankPincodeCount++
          const district = getDistrictFromPincode(pincode)
          if (district !== 'Other District' && district !== 'Unknown District') {
            bankDistricts.add(district)
          }
        }
      })
    }
    
    bankDistrictCount = bankDistricts.size
    
    const stateAgeGroups = excelStateData.age_groups || {}
    const topAgeGroup = Object.keys(stateAgeGroups).length > 0 ? 
      Object.entries(stateAgeGroups).sort(([,a], [,b]) => (b as number) - (a as number))[0] : null
    
    // Create age group breakdown display
    const ageGroupEntries = Object.entries(stateAgeGroups || {}).sort(([,a], [,b]) => (b as number) - (a as number))
    
    content = `
      <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 6px; margin-bottom: 8px;">
        <h3 style="margin: 0; font-size: 14px; font-weight: 700; color: #1f2937;">${name}</h3>
        <div style="font-size: 10px; color: #6b7280; margin-top: 2px;">DLC Completed Pensioners by Age Group</div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
        <div style="text-align: center; padding: 4px 6px; background: #f3f4f6; border-radius: 4px;">
          <div style="font-size: 16px; font-weight: 700; color: #3b82f6;">${actualPensioners.toLocaleString()}</div>
          <div style="font-size: 10px; color: #6b7280; font-weight: 500;">Total DLC Completed</div>
        </div>
        <div style="text-align: center; padding: 4px 6px; background: #f3f4f6; border-radius: 4px;">
          <div style="font-size: 16px; font-weight: 700; color: #10b981;">${bankDistrictCount}</div>
          <div style="font-size: 10px; color: #6b7280; font-weight: 500;">Bank Districts</div>
        </div>
      </div>`
    
    if (ageGroupEntries.length > 0) {
      content += `
        <div style="margin-top: 8px; padding: 6px; background: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 3px;">
          <div style="font-size: 11px; font-weight: 600; color: #92400e; margin-bottom: 4px;">Age Group Breakdown:</div>`
      
      ageGroupEntries.slice(0, 4).forEach(([ageGroup, count]) => {
        const percentage = actualPensioners > 0 ? Math.round((count as number / actualPensioners) * 100) : 0
        content += `
          <div style="font-size: 10px; color: #374151; margin-bottom: 2px; display: flex; justify-content: space-between;">
            <span style="font-weight: 600;">${ageGroup}:</span> 
            <span>${count} (${percentage}%)</span>
          </div>`
      })
      
      content += `</div>`
    }
  } else if (type === 'district') {
    const { name, pincodeCount, pensionerCount } = data
    
    // Get the current selected state
    const currentState = selectedState.value
    
    // Get state data from backend
    const backendStateInfo = (stateWiseData.value as any)[currentState] || {}
    
    // Find district data in backend state info
    let districtInfo = null
    if (backendStateInfo.districts && Array.isArray(backendStateInfo.districts)) {
      // Try exact match first
      districtInfo = backendStateInfo.districts.find((d: any) => 
        (d.name || '').toLowerCase() === (name || '').toLowerCase().replace(/ district$/i, '')
      )
      
      // If not found, try fuzzy match
      if (!districtInfo) {
        const normalized = (s: string) => s.replace(/\s+/g, ' ').replace(/ district$/i, '').trim().toLowerCase()
        const target = normalized(name || '')
        districtInfo = backendStateInfo.districts.find((d: any) => normalized(d.name || '') === target)
      }
    }
    
    // Get accurate pensioner count from backend data first, then fallback
    const actualPensionerCount = districtInfo ? districtInfo.pensioners : pensionerCount || 0
    
    // Get accurate pincode count from backend data first, then fallback
    const actualPincodeCount = districtInfo ? districtInfo.pincodes : pincodeCount || 0
    
    // Get bank count from backend data
    const bankCount = districtInfo ? districtInfo.banks : 0
    
    // Get top pincodes with verification counts for this district
    let topPincodes: Array<[string, number]> = []
    if (excelPensionerData.value?.state_wise_data?.[currentState]) {
      const stateExcelData = excelPensionerData.value.state_wise_data[currentState]
      if (stateExcelData.pincode_counts) {
        const districtPincodes = Object.entries(stateExcelData.pincode_counts)
          .filter(([pincode, count]) => {
            const pincodeDistrict = getDistrictFromPincode(pincode)
            return pincodeDistrict.toLowerCase() === (name || '').toLowerCase()
          })
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 3)
        topPincodes = districtPincodes
      }
    }
    
    content = `
      <div style=\"border-bottom: 2px solid #0ea5e9; padding-bottom: 6px; margin-bottom: 8px;\">
        <h3 style=\"margin: 0; font-size: 14px; font-weight: 700; color: #1f2937;\">${name || 'Unknown District'}</h3>
        <div style=\"font-size: 10px; color: #6b7280; margin-top: 2px;\">Bank Verification Data</div>
      </div>
      <div style=\"display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 8px;\">
        <div style=\"text-align: center; padding: 4px 6px; background: #f0f9ff; border-radius: 4px;\">
          <div style=\"font-size: 16px; font-weight: 700; color: #0284c7;\">${actualPensionerCount.toLocaleString()}</div>
          <div style=\"font-size: 10px; color: #64748b; font-weight: 500;\">Verifications</div>
        </div>
        <div style=\"text-align: center; padding: 4px 6px; background: #f0f9ff; border-radius: 4px;\">
          <div style=\"font-size: 16px; font-weight: 700; color: #10b981;\">${topPincodes.length}</div>
          <div style=\"font-size: 10px; color: #64748b; font-weight: 500;\">Bank Pincodes</div>
        </div>
        <div style=\"text-align: center; padding: 4px 6px; background: #f0f9ff; border-radius: 4px;\">
          <div style=\"font-size: 16px; font-weight: 700; color: #8b5cf6;\">${topPincodes.length > 0 ? topPincodes.length : 0}</div>
          <div style=\"font-size: 10px; color: #64748b; font-weight: 500;\">Bank Locations</div>
        </div>
      </div>`
    
    if (topPincodes.length > 0) {
      content += `
        <div style=\"margin-top: 8px; padding: 6px; background: #fef2f2; border-left: 3px solid #dc2626; border-radius: 3px;\">
          <div style=\"font-size: 11px; font-weight: 600; color: #dc2626; margin-bottom: 4px;\">Top Verification Pincodes:</div>`
      
      topPincodes.forEach(([pincode, count]) => {
        content += `
          <div style=\"font-size: 10px; color: #374151; margin-bottom: 2px;\">
            <span style=\"font-weight: 600;\">${pincode}:</span> ${count} verifications
          </div>`
      })
      
      content += `</div>`
    }
  } else if (type === 'pincode') {
    const { name, pensionerCount, bankCount, division } = data
    const validPensionerCount = pensionerCount || 0
    const validBankCount = bankCount || 0
    content = `
      <div style="border-bottom: 2px solid #16a34a; padding-bottom: 6px; margin-bottom: 8px;">
        <h3 style="margin: 0; font-size: 14px; font-weight: 700; color: #1f2937;">${name}</h3>
        <div style="font-size: 10px; color: #6b7280; margin-top: 2px;">${division} District</div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <div style="text-align: center; padding: 4px 6px; background: #f0fdf4; border-radius: 4px;">
          <div style="font-size: 16px; font-weight: 700; color: #16a34a;">${validPensionerCount}</div>
          <div style="font-size: 10px; color: #64748b; font-weight: 500;">Pensioners</div>
        </div>
        <div style="text-align: center; padding: 4px 6px; background: #fef3c7; border-radius: 4px;">
          <div style="font-size: 16px; font-weight: 700; color: #d97706;">${validBankCount}</div>
          <div style="font-size: 10px; color: #64748b; font-weight: 500;">Banks</div>
        </div>
      </div>
    `
  }
  
  tooltipDiv.innerHTML = content
  
  // Position the card
  const rect = tooltipDiv.getBoundingClientRect()
  const x = e.originalEvent.pageX + 15
  const y = e.originalEvent.pageY - rect.height - 10
  
  tooltipDiv.style.left = x + 'px'
  tooltipDiv.style.top = y + 'px'
  tooltipDiv.style.opacity = '1'
  tooltipDiv.style.transform = 'translateY(0) scale(1)'
}

// Hide hover card immediately without timeout
const hideHoverCard = () => {
  if (!tooltipDiv) return
  tooltipDiv.style.opacity = '0'
  tooltipDiv.style.transform = 'translateY(10px) scale(0.95)'
}

// Show the initial state-level map view
const showStateLevelMap = () => {
  if (!map || !indiaStateData) {
    console.error('❌ Map or data not available for state view')
    return
  }
  
  console.log('🗺️ Showing state-level map...')
  console.log('📊 State data available:', !!indiaStateData)
  console.log('🎯 Current view level:', currentViewLevel.value)
  
  // Clear any existing layers first
  if (choroplethLayer) {
    console.log('🧹 Removing existing choropleth layer')
    map.removeLayer(choroplethLayer)
    choroplethLayer = null
  }
  if (pincodeLayer) {
    console.log('🧹 Removing existing pincode layer')
    map.removeLayer(pincodeLayer)
    pincodeLayer = null
  }
  
  // Create hover card if not exists
  createHoverCard()
  
  // Create choropleth layer for states with improved styling
  choroplethLayer = L.geoJSON(indiaStateData, {
    style: (feature: any) => {
      const stateName = feature?.properties?.st_nm || ''
      
      // Use the proper color function for consistent red-green gradient
      const fillColor = getStateColor(stateName)
      
      return {
        fillColor: fillColor,
        weight: 1.2,
        opacity: 1,
        color: '#374151',
        dashArray: '',
        fillOpacity: 0.8,
        smoothFactor: 1.0
      }
    },
    onEachFeature: (feature: any, layer: any) => {
      const stateName = feature.properties.st_nm
      // Use Excel data first, then fallback to regular data
      const excelStateData = (excelPensionerData.value?.state_wise_data?.[stateName] as any) || {}
      const regularStateData = (stateWisePensionerData.value as any)[stateName] || {}
      const totalPensioners = excelStateData.total_pensioners || regularStateData.totalPensioners || 0
      // Count unique banks from Excel data or regular data
      const excelBanks = excelStateData.bank_locations ? Object.keys(excelStateData.bank_locations).length : 0
      const regularBanks = regularStateData.totalBanks || 0
      // If we have district data, count banks from all districts
      const districtBanks = regularStateData.districts ? 
        regularStateData.districts.reduce((total: number, district: any) => total + (district.banks || 0), 0) : 0
      const totalBanks = Math.max(excelBanks, regularBanks, districtBanks)
      const totalDistricts = regularStateData.totalDistricts || 0
      const topBanks = Object.entries(excelStateData.bank_locations || {})
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([bank, count]) => `${bank}: ${count}`) || regularStateData.topBanks || []
      
      const stateInfo = {
        name: stateName,
        totalPensioners,
        totalBanks,
        totalDistricts,
        topBanks: topBanks.slice(0, 3)
      }
      
      layer.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; min-width: 200px;">
          <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; font-weight: 700; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">
            ${stateName}
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div style="text-align: center; padding: 8px; background: #f3f4f6; border-radius: 6px;">
              <div style="font-size: 20px; font-weight: 700; color: #3b82f6;">${totalPensioners.toLocaleString()}</div>
              <div style="font-size: 12px; color: #6b7280; font-weight: 500;">${(excelStateData as any).total_pensioners ? 'Bank Verifications' : 'Pensioners'}</div>
            </div>
            <div style="text-align: center; padding: 8px; background: #f3f4f6; border-radius: 6px;">
              <div style="font-size: 20px; font-weight: 700; color: #10b981;">${totalBanks}</div>
              <div style="font-size: 12px; color: #6b7280; font-weight: 500;">${(excelStateData as any).total_pensioners ? 'Origin States' : 'Banks'}</div>
            </div>
          </div>
          <button style="
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
            color: white; 
            border: none; 
            padding: 10px 16px; 
            border-radius: 6px; 
            cursor: pointer; 
            font-size: 14px; 
            font-weight: 600;
            width: 100%;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
          " onclick="window.showDistrictView && window.showDistrictView('${stateName}')">
            View Districts →
          </button>
        </div>
      `)
      
      layer.on({
        mouseover: (e: any) => {
          // Get age group data from Excel
          const ageGroups = excelStateData.age_groups || {}
          
          const hoverData = {
            name: stateName,
            totalPensioners,
            districts: (regularStateData as any).districts || [],
            totalBanks,
            ageGroups
          }
          showHoverCard(e, hoverData, 'state')
          e.target.setStyle({
            weight: 2.5,
            color: '#1e40af',
            fillOpacity: 0.9,
            dashArray: '3, 3'
          })
        },
        mouseout: (e: any) => {
          hideHoverCard()
          choroplethLayer?.resetStyle(e.target)
        },
        mousemove: (e: any) => {
          if (tooltipDiv && tooltipDiv.style.opacity === '1') {
            const rect = tooltipDiv.getBoundingClientRect()
            const x = e.originalEvent.pageX + 15
            const y = e.originalEvent.pageY - rect.height - 10
            tooltipDiv.style.left = x + 'px'
            tooltipDiv.style.top = y + 'px'
          }
        },
        click: (e: any) => {
          console.log(`🖱️ State clicked: ${stateName}`)
          hideHoverCard()
          // Close any existing popups before transitioning
          map?.closePopup()
          
          // Force clear any existing state before switching
          if (currentViewLevel.value !== 'state') {
            console.log(`🔄 Switching from ${currentViewLevel.value} view to district view for ${stateName}`)
          }
          
          // Show district-level view for the clicked state
          showDistrictView(stateName, e.target.getBounds())
        }
      })
    }
  }).addTo(map)
  
  // Fit map to India bounds with better padding for card view
  const bounds = choroplethLayer.getBounds()
  if (bounds.isValid()) {
    map.fitBounds(bounds, { 
      padding: [20, 20],
      maxZoom: 6
    })
  }
  
  // Set up global function for popup button
  ;(window as any).showDistrictView = (stateName: string) => {
    console.log(`🌍 Global showDistrictView called for: ${stateName}`)
    const stateLayer = findStateLayer(stateName)
    if (stateLayer) {
      showDistrictView(stateName, stateLayer.getBounds())
    } else {
      console.error(`❌ State layer not found for: ${stateName}`)
    }
  }
  
  console.log(`✅ State map created with ${choroplethLayer.getLayers().length} states`)
  
  // Verify click handlers are attached
  let clickableStates = 0
  choroplethLayer.eachLayer((layer: any) => {
    if (layer.listens && layer.listens('click')) {
      clickableStates++
    }
  })
  console.log(`🖱️ ${clickableStates} states have click handlers attached`)
}

// Helper function to find a state layer by name
const findStateLayer = (stateName: string): any => {
  if (!choroplethLayer) return null
  
  let foundLayer: any = null
  choroplethLayer.eachLayer((layer: any) => {
    if (layer.feature && layer.feature.properties.st_nm === stateName) {
      foundLayer = layer
    }
  })
  return foundLayer
}


// Show marker map
const showMarkerMap = () => {
  if (!map) return
  
  console.log(' Showing marker map...')
  
  // Remove choropleth layer
  if (choroplethLayer) {
    map.removeLayer(choroplethLayer)
    choroplethLayer = null
  }
  
  // Add markers back
  addPensionerLocationMarkers()
}

// Show district-level markers when zoomed in
const showDistrictMarkers = async () => {
  if (!map || !currentDistrictData.length) {
    console.log(' Loading district data for markers...')
    await loadDistrictData()
  }
  
  if (!currentDistrictData.length) {
    console.log(' No district data available for markers')
    return
  }
  
  console.log(' Showing district markers...')
  
  // Create district markers layer if it doesn't exist
  if (!districtMarkersLayer) {
    districtMarkersLayer = L.layerGroup()
  }
  
  // Clear existing markers
  districtMarkersLayer.clearLayers()
  
  // Get current map bounds to show only visible districts
  const bounds = map.getBounds()
  
  // Add district markers
  currentDistrictData.forEach((districtInfo: any) => {
    if (districtInfo.coordinates && 
        bounds.contains([districtInfo.coordinates.lat, districtInfo.coordinates.lng])) {
      
      const marker = createDistrictMarker(districtInfo)
      if (marker) {
        districtMarkersLayer!.addLayer(marker)
      }
    }
  })
  
  // Add to map if not already added
  if (!map.hasLayer(districtMarkersLayer)) {
    map.addLayer(districtMarkersLayer)
  }
}

// Hide district markers
const hideDistrictMarkers = () => {
  if (districtMarkersLayer && map) {
    map.removeLayer(districtMarkersLayer)
    console.log(' District markers hidden')
  }
}

// Load district data from API
const loadDistrictData = async () => {
  try {
    console.log(' Loading district data...')
    const response = await pensionersApi.getPensioners()
    const pensioners = response.DLC_generated_pensioners || []
    
    // Group by state and district
    const districtGroups: { [key: string]: any[] } = {}
    
    pensioners.forEach((pensioner: any) => {
      const state = pensioner.pensioner_state || 'Unknown'
      const district = pensioner.pensioner_district || 'Unknown'
      const key = `${state}-${district}`
      
      if (!districtGroups[key]) {
        districtGroups[key] = []
      }
      districtGroups[key].push(pensioner)
    })
    
    // Convert to district data with coordinates
    currentDistrictData = Object.entries(districtGroups).map(([key, pensioners]) => {
      const [state, district] = key.split('-')
      const coordinates = getDistrictCoordinates(state, district)
      
      return {
        state,
        district,
        pensioners: pensioners.length,
        coordinates,
        banks: [...new Set(pensioners.map((p: any) => p.disbursing_agency))].length,
        topBank: getTopBank(pensioners),
        data: pensioners
      }
    }).filter(d => d.coordinates) // Only include districts with known coordinates
    
    console.log(' District data loaded:', currentDistrictData.length, 'districts')
  } catch (error) {
    console.error(' Error loading district data:', error)
  }
}

// Create district marker
const createDistrictMarker = (districtInfo: any) => {
  if (!districtInfo.coordinates) return null
  
  const { lat, lng } = districtInfo.coordinates
  
  // Create pin-style marker for district (smaller than state markers)
  const markerHtml = `
    <svg width="20" height="28" viewBox="0 0 20 28" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="district-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      <!-- Pin background -->
      <path d="M10 0C4.48 0 0 4.48 0 10c0 7.5 10 18 10 18s10-10.5 10-18c0-5.52-4.48-10-10-10z" 
            fill="#10b981" stroke="#ffffff" stroke-width="2" filter="url(#district-shadow)"/>
      <!-- Inner circle -->
      <circle cx="10" cy="10" r="4" fill="#ffffff"/>
      <!-- Center dot -->
      <circle cx="10" cy="10" r="2" fill="#10b981"/>
    </svg>
  `
  
  const marker = L.marker([lat, lng], {
    icon: L.divIcon({
      html: markerHtml,
      className: 'district-pin-marker',
      iconSize: [20, 28],
      iconAnchor: [10, 28]
    })
  })
  
  // Add popup with district details
  const popupContent = `
    <div class="district-popup">
      <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
        ${districtInfo.district}, ${districtInfo.state}
      </h4>
      <div style="font-size: 12px; color: #374151;">
        <div style="margin-bottom: 4px;">
          <strong>Pensioners:</strong> ${districtInfo.pensioners}
        </div>
        <div style="margin-bottom: 4px;">
          <strong>Banks:</strong> ${districtInfo.banks}
        </div>
        <div>
          <strong>Top Bank:</strong> ${districtInfo.topBank}
        </div>
      </div>
    </div>
  `
  
  marker.bindPopup(popupContent)
  return marker
}

// Get district coordinates (simplified mapping)
const getDistrictCoordinates = (state: string, district: string) => {
  // District coordinates mapping for major districts
  const districtCoords: { [key: string]: { lat: number, lng: number } } = {
    // Gujarat districts
    'Gujarat-Surat': { lat: 21.1702, lng: 72.8311 },
    'Gujarat-Vadodara': { lat: 22.3072, lng: 73.1812 },
    'Gujarat-Rajkot': { lat: 22.3039, lng: 70.8022 },
    'Gujarat-Bhavnagar': { lat: 21.7645, lng: 72.1519 },
    'Gujarat-Ahmedabad': { lat: 23.0225, lng: 72.5714 },
    
    // Rajasthan districts
    'Rajasthan-Kota': { lat: 25.2138, lng: 75.8648 },
    'Rajasthan-Jaipur': { lat: 26.9124, lng: 75.7873 },
    'Rajasthan-Bikaner': { lat: 28.0229, lng: 73.3119 },
    'Rajasthan-Ajmer': { lat: 26.4499, lng: 74.6399 },
    'Rajasthan-Jodhpur': { lat: 26.2389, lng: 73.0243 },
    
    // Add more districts as needed
  }
  
  const key = `${state}-${district}`
  return districtCoords[key] || null
}

// Get top bank for district
const getTopBank = (pensioners: any[]) => {
  const bankCounts: { [key: string]: number } = {}
  
  pensioners.forEach((p: any) => {
    const bank = p.disbursing_agency || 'Unknown'
    bankCounts[bank] = (bankCounts[bank] || 0) + 1
  })
  
  const topBank = Object.entries(bankCounts)
    .sort(([,a], [,b]) => b - a)[0]
  
  return topBank ? topBank[0] : 'Unknown'
}

// Verification data - will be populated dynamically

// Validation function to check if coordinates are within India
const isWithinIndia = (lat: number, lng: number): boolean => {
  // Conservative boundaries for India's political territory
  return lat >= 8.0 && lat <= 35.5 && lng >= 68.7 && lng <= 97.25;
}

// Initialize map
const initializeMap = () => {
  if (map) return

  console.log(' Initializing map...')
  
  map = L.map('leaflet-map', {
    center: [20.5937, 78.9629], // Center of India
    zoom: 5,
    minZoom: 4,
    maxZoom: 12,
    zoomSnap: 0.25,
    zoomDelta: 0.5,
    zoomControl: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    boxZoom: true,
    keyboard: true,
    dragging: true,
    touchZoom: true,
    preferCanvas: true,
    attributionControl: false,
  })

  // NO tile layer - we'll use only india.json as the base map
  console.log(' Map initialized without background tiles')
  
  // Always load india.json based map by default
  loadMapData().then(() => {
    if (useCustomGeoJSON.value) {
      showChoroplethMap()
    } else {
      showMarkerMap()
    }
  })

  console.log(' Map initialized successfully')

  // Auto-hierarchical behavior: if user zooms out while on pincode view, return to states
  map.on('zoomend', () => {
    if (!map) return
    const z = map.getZoom()
    if (pincodeLayer && z <= 6) {
      ;(window as any).backToStates && (window as any).backToStates()
    }
  })
}

// Custom GeoJSON map functions
const showCustomGeoJSONMap = () => {
  if (!map) return

  // Remove existing layers
  removeChoroplethLayer()
  clearMarkers()

  // Add custom GeoJSON layer
  if (customGeoJSON && customGeoJSON.features) {
    customGeoJSONLayer = L.geoJSON(customGeoJSON as any, {
      style: (feature) => {
        const stateName = feature?.properties?.st_nm || 'Unknown'
        const stateVerifications = stateData.value[stateName] || 0

        // Color based on verification count
        let fillColor = '#e5e7eb' // Default gray for no data
        if (stateVerifications > 80000) {
          fillColor = '#dc2626' // Dark red for highest
        } else if (stateVerifications > 60000) {
          fillColor = '#ea580c' // Orange-red
        } else if (stateVerifications > 40000) {
          fillColor = '#f59e0b' // Orange
        } else if (stateVerifications > 20000) {
          fillColor = '#eab308' // Yellow
        } else if (stateVerifications > 10000) {
          fillColor = '#84cc16' // Light green
        } else if (stateVerifications > 0) {
          fillColor = '#22c55e' // Green
        }

        return {
          fillColor: fillColor,
          weight: 2,
          opacity: 1,
          color: '#1e40af',
          dashArray: '',
          fillOpacity: 0.7
        }
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties?.st_nm || feature.properties?.name || 'Unknown'
        const stateName = name
        const stateVerifications = stateData.value[stateName] || 0

        layer.bindPopup(`
          <div class="custom-geo-popup">
            <h3>${stateName}</h3>
            <p><strong>Verifications:</strong> ${stateVerifications.toLocaleString()}</p>
            <p><strong>State:</strong> ${stateName}</p>
          </div>
        `)

        layer.on({
          mouseover: (e) => {
            const targetLayer = e.target
            targetLayer.setStyle({
              weight: 3,
              color: '#1f2937',
              fillOpacity: 0.8
            })
          },
          mouseout: (e) => {
            customGeoJSONLayer?.resetStyle(e.target)
          }
        })
      }
    }).addTo(map)

    // Fit map to GeoJSON bounds
    if (customGeoJSONLayer.getBounds().isValid()) {
      map.fitBounds(customGeoJSONLayer.getBounds())
    }
  }
}

const showOriginalMap = () => {
  if (!map) return

  console.log('🔄 Showing original map - removing all custom layers')

  // Remove custom GeoJSON layer
  if (customGeoJSONLayer) {
    map.removeLayer(customGeoJSONLayer)
    customGeoJSONLayer = null
    console.log('✅ Removed custom GeoJSON layer')
  }

  // Remove choropleth layer completely
  removeChoroplethLayer()

  // Remove any remaining custom layers that might be causing green highlighting
  map.eachLayer((layer: any) => {
    // Keep only the base tile layer (OpenStreetMap)
    if (layer._url && (layer._url.includes('openstreetmap') || layer._url.includes('tile'))) {
      // This is the base map tile layer, keep it
      return
    }

    // Remove any GeoJSON layers, choropleth layers, or other custom layers
    if (layer.feature || layer.options?.style || layer.getBounds) {
      try {
        map.removeLayer(layer)
        console.log('🗑️ Removed custom layer:', layer.constructor.name)
      } catch (e) {
        console.warn('Could not remove layer:', e)
      }
    }
  })

  // Clear all markers
  clearMarkers()

  // Reset to original view
  map.setView([20.5937, 78.9629], 5)

  console.log('✅ Original map restored - only base tiles should be visible')

  // Add simple location markers for pensioners on clean map
  addPensionerLocationMarkers()
}

// Function to generate gradient definitions for different pin colors
const getPinGradientDefs = (colorScheme: string) => {
  const gradients = {
    default: {
      premium: ['#4f46e5', '#7c3aed', '#2563eb'],
      stroke: ['#6366f1', '#3730a3'],
      inner: ['#5b21b6', '#1e40af'],
      center: ['#fbbf24', '#f59e0b']
    },
    low: {
      premium: ['#10b981', '#059669', '#047857'],
      stroke: ['#34d399', '#065f46'],
      inner: ['#047857', '#064e3b'],
      center: ['#fbbf24', '#f59e0b']
    },
    medium: {
      premium: ['#f59e0b', '#d97706', '#b45309'],
      stroke: ['#fbbf24', '#92400e'],
      inner: ['#b45309', '#78350f'],
      center: ['#fef3c7', '#fcd34d']
    },
    high: {
      premium: ['#dc2626', '#b91c1c', '#991b1b'],
      stroke: ['#ef4444', '#7f1d1d'],
      inner: ['#991b1b', '#7f1d1d'],
      center: ['#fef2f2', '#fecaca']
    }
  }

  const colors = gradients[colorScheme as keyof typeof gradients] || gradients.default

  return `
    <defs>
      <!-- Premium gradient -->
      <linearGradient id="premiumGradient-${colorScheme}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colors.premium[0]};stop-opacity:1" />
        <stop offset="50%" style="stop-color:${colors.premium[1]};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${colors.premium[2]};stop-opacity:1" />
      </linearGradient>

      <!-- Stroke gradient -->
      <linearGradient id="strokeGradient-${colorScheme}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colors.stroke[0]};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${colors.stroke[1]};stop-opacity:1" />
      </linearGradient>

      <!-- Inner gradient -->
      <linearGradient id="innerGradient-${colorScheme}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colors.inner[0]};stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:${colors.inner[1]};stop-opacity:0.9" />
      </linearGradient>

      <!-- Center dot gradient -->
      <radialGradient id="centerGradient-${colorScheme}" cx="50%" cy="30%" r="70%">
        <stop offset="0%" style="stop-color:${colors.center[0]};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${colors.center[1]};stop-opacity:1" />
      </radialGradient>
    </defs>
  `
}

// Add location markers for pensioners using direct API
const addPensionerLocationMarkers = async () => {
  console.log('🔄 addPensionerLocationMarkers called, map exists:', !!map)
  if (!map) return

  // Clear existing markers
  clearMarkers()
  
  // Initialize markers layer if not exists
  if (!markersLayer) {
    markersLayer = L.layerGroup().addTo(map)
  }

  try {
    console.log('🔄 Fetching pensioner data from external API...')
    console.log('🌐 API URL: http://100.113.47.45:8080/pensioners')

    // Get pensioner data from external API with cache busting
    const timestamp = new Date().getTime()
    const response = await fetch(`http://100.113.47.45:8080/pensioners?t=${timestamp}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      mode: 'cors'
    })

    console.log('📡 API Response status:', response.status)
    console.log('📡 API Response headers:', response.headers)

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const apiResponse = await response.json()
    const pensionersData = apiResponse.DLC_generated_pensioners || apiResponse
    console.log('📊 Received pensioners data:', pensionersData.length, 'pensioners')

    if (!pensionersData || pensionersData.length === 0) {
      console.warn('❌ No pensioner data received from API')
      return
    }

    // Process location data and add markers
    console.log(`📍 Processing ${pensionersData.length} pensioners for markers...`)

    // Use only real API pensioner data - no sample data
    console.log(`📍 Processing ${pensionersData.length} real pensioners for markers...`)

    let markersAdded = 0
    const stateGroups: { [key: string]: any[] } = {}

    // Group pensioners by state to create state-level markers
    pensionersData.forEach((pensioner: any) => {
      const state = pensioner.pensioner_state || pensioner.state || pensioner.State || 'Unknown'
      if (!stateGroups[state]) {
        stateGroups[state] = []
      }
      stateGroups[state].push(pensioner)
    })

    console.log(`📍 Found ${Object.keys(stateGroups).length} states with real pensioner data`)

    // State coordinates mapping
    const stateCoordinates: { [key: string]: { latitude: number, longitude: number } } = {
      'Andhra Pradesh': { latitude: 15.9129, longitude: 79.7400 },
      'Arunachal Pradesh': { latitude: 28.2180, longitude: 94.7278 },
      'Assam': { latitude: 26.2006, longitude: 92.9376 },
      'Bihar': { latitude: 25.0961, longitude: 85.3131 },
      'Chhattisgarh': { latitude: 21.2787, longitude: 81.8661 },
      'Goa': { latitude: 15.2993, longitude: 74.1240 },
      'Gujarat': { latitude: 23.0225, longitude: 72.5714 },
      'Haryana': { latitude: 29.0588, longitude: 76.0856 },
      'Himachal Pradesh': { latitude: 31.1048, longitude: 77.1734 },
      'Jharkhand': { latitude: 23.6102, longitude: 85.2799 },
      'Karnataka': { latitude: 15.3173, longitude: 75.7139 },
      'Kerala': { latitude: 10.8505, longitude: 76.2711 },
      'Madhya Pradesh': { latitude: 22.9734, longitude: 78.6569 },
      'Maharashtra': { latitude: 19.7515, longitude: 75.7139 },
      'Manipur': { latitude: 24.6637, longitude: 93.9063 },
      'Meghalaya': { latitude: 25.4670, longitude: 91.3662 },
      'Mizoram': { latitude: 23.1645, longitude: 92.9376 },
      'Nagaland': { latitude: 26.1584, longitude: 94.5624 },
      'Odisha': { latitude: 20.9517, longitude: 85.0985 },
      'Punjab': { latitude: 31.1471, longitude: 75.3412 },
      'Rajasthan': { latitude: 27.0238, longitude: 74.2179 },
      'Sikkim': { latitude: 27.5330, longitude: 88.5122 },
      'Tamil Nadu': { latitude: 11.1271, longitude: 78.6569 },
      'Telangana': { latitude: 18.1124, longitude: 79.0193 },
      'Tripura': { latitude: 23.9408, longitude: 91.9882 },
      'Uttar Pradesh': { latitude: 26.8467, longitude: 80.9462 },
      'Uttarakhand': { latitude: 30.0668, longitude: 79.0193 },
      'West Bengal': { latitude: 22.9868, longitude: 87.8550 },
      'Delhi': { latitude: 28.7041, longitude: 77.1025 },
      'Jammu and Kashmir': { latitude: 34.0837, longitude: 74.7973 },
      'Ladakh': { latitude: 34.1526, longitude: 77.5771 }
    }

    // Create markers for each state using real API data only
    for (const [stateName, statePensioners] of Object.entries(stateGroups)) {
      try {
        console.log(`📍 Processing state: ${stateName} with ${statePensioners.length} pensioners`)
        
        // Get coordinates for this state
        const coordinates = stateCoordinates[stateName]
        
        if (!coordinates) {
          console.warn(`❌ No coordinates found for state: ${stateName}`)
          continue
        }

        // Validate coordinates are within India
        if (!isWithinIndia(coordinates.latitude, coordinates.longitude)) {
          console.warn(`❌ Coordinates for ${stateName} are outside India bounds:`, coordinates)
          continue
        }

        const pensionerCount = statePensioners.length
        const colorScheme = pensionerCount > 100 ? 'high' : pensionerCount > 50 ? 'medium' : pensionerCount > 10 ? 'low' : 'default'

        console.log(`🎨 Creating marker for ${stateName} with ${pensionerCount} pensioners (${colorScheme} scheme)`)

        // Create pin-style location marker
        const getMarkerColor = (count: number) => {
          if (count > 100) return '#dc2626' // red for high
          if (count > 50) return '#f59e0b'  // amber for medium
          if (count > 10) return '#10b981'  // green for low
          return '#6b7280' // gray for default
        }

        const markerColor = getMarkerColor(pensionerCount)
        const customIcon = L.icon({
          iconUrl: `data:image/svg+xml;base64,${btoa(`
            <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="${markerColor}"/>
              <circle cx="12.5" cy="12.5" r="6" fill="white"/>
            </svg>
          `)}`,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34]
        })

        // Create popup content with detailed state information like choropleth
        const stateInfo = (stateWisePensionerData.value as any)[stateName]
        const popupContent = stateInfo ? `
          <div class="choropleth-popup">
            <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px; font-weight: 700;">${stateName}</h3>
            <div class="stats" style="font-size: 14px; color: #374151;">
              <div style="margin-bottom: 8px; padding: 4px 0; border-bottom: 1px solid #e5e7eb;">
                <strong style="color: #111827;">Total Pensioners:</strong> ${stateInfo.totalPensioners.toLocaleString()}
              </div>
              <div style="margin-bottom: 8px; padding: 4px 0; border-bottom: 1px solid #e5e7eb;">
                <strong style="color: #111827;">Banks:</strong> ${stateInfo.totalBanks}
              </div>
              <div style="margin-bottom: 8px; padding: 4px 0; border-bottom: 1px solid #e5e7eb;">
                <strong style="color: #111827;">Districts:</strong> ${stateInfo.districts.length}
              </div>
              <div style="margin-bottom: 8px; padding: 4px 0;">
                <strong style="color: #111827;">Top Bank:</strong> ${stateInfo.topBanks[0]?.name || 'N/A'}
              </div>
            </div>
            <button style="
              background: #3b82f6; 
              color: white; 
              border: none; 
              padding: 8px 16px; 
              border-radius: 6px; 
              cursor: pointer; 
              font-size: 12px; 
              margin-top: 10px;
              width: 100%;
            " onclick="window.openStateDetails && window.openStateDetails('${stateName}')">
              View Details
            </button>
          </div>
        ` : `
          <div class="choropleth-popup">
            <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px; font-weight: 700;">${stateName}</h3>
            <div class="stats" style="font-size: 14px; color: #374151;">
              <div style="margin-bottom: 8px; padding: 4px 0; border-bottom: 1px solid #e5e7eb;">
                <strong style="color: #111827;">Total Pensioners:</strong> ${pensionerCount.toLocaleString()}
              </div>
              <div style="margin-bottom: 5px;"><strong style="color: #111827;">Status:</strong> Limited data available</div>
              <div style="font-style: italic; color: #6b7280;">Showing marker-level data only</div>
            </div>
          </div>
        `

        const marker = L.marker([coordinates.latitude, coordinates.longitude], {
          icon: customIcon
        })
          .bindPopup(popupContent, {
            className: 'custom-leaflet-popup',
            closeButton: true,
            minWidth: 200,
            maxWidth: 250
          })
          .addTo(map)

        markersLayer.addLayer(marker)
        markersAdded++
        console.log(`✅ Marker ${markersAdded} added successfully for ${stateName} with ${pensionerCount} pensioners`)
        
      } catch (error) {
        console.error(`Error adding marker for ${stateName}:`, error)
      }
    }

    // Add custom popup CSS to document head if not already present
    if (!document.getElementById('custom-leaflet-popup-style')) {
      const style = document.createElement('style')
      style.id = 'custom-leaflet-popup-style'
      style.innerHTML = `
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          background: #f8fafc;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(99,102,241,0.10);
          border: 1.5px solid #e0e7ff;
          padding: 0;
        }
        .custom-popup-card {
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
          padding: 14px 18px 10px 18px;
          min-width: 180px;
        }
        .popup-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
        }
        .popup-title {
          font-size: 16px;
          font-weight: 700;
          color: #3730a3;
        }
        .popup-close {
          font-size: 18px;
          color: #64748b;
          cursor: pointer;
          margin-left: 8px;
          transition: color 0.2s;
        }
        .popup-close:hover {
          color: #ef4444;
        }
        .popup-state {
          font-size: 13px;
          color: #6366f1;
          margin-bottom: 2px;
          margin-top: 2px;
        }
        .popup-data-source {
          font-size: 11px;
          color: #10b981;
          font-weight: 600;
          margin-top: 2px;
          margin-bottom: 4px;
          padding: 2px 6px;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 4px;
          display: inline-block;
        }
        .popup-divider {
          border-bottom: 1px solid #e0e7ff;
          margin: 8px 0 8px 0;
        }
        .popup-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          margin-bottom: 6px;
        }
        .popup-label {
          color: #0f172a;
          font-weight: 600;
        }
        .popup-coords {
          display: flex;
          align-items: center;
          font-size: 13px;
          color: #64748b;
          margin-top: 4px;
        }
        .popup-pin {
          margin-right: 4px;
        }
        .popup-pensioners {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #e0e7ff;
        }
        .popup-subtitle {
          font-size: 12px;
          font-weight: 600;
          color: #6366f1;
          margin-bottom: 4px;
        }
        .popup-pensioner-list {
          font-size: 12px;
          color: #475569;
          line-height: 1.4;
        }
        
        .choropleth-popup {
          font-family: 'Inter', sans-serif;
          min-width: 250px;
          padding: 10px;
          
          h3 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 16px;
            font-weight: bold;
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 5px;
          }
          
          .stats {
            div {
              margin: 5px 0;
              padding: 3px 0;
              border-bottom: 1px solid #eee;
              
              &:last-child {
                border-bottom: none;
              }
              
              strong {
                color: #666;
                font-weight: 600;
              }
            }
          }
        }
        
        .choropleth-popup h3 {
          margin: 0 0 10px 0;
          color: #1f2937;
          font-size: 16px;
          font-weight: 700;
        }
        
        .choropleth-popup .stats {
          font-size: 14px;
          color: #374151;
        }
        
        .choropleth-popup .stats div {
          margin-bottom: 5px;
        }

      `
      document.head.appendChild(style)
    }

    console.log(`✅ Added ${markersAdded} state-level markers to map from real API data`)
    console.log(`📊 Total states processed: ${Object.keys(stateGroups).length}`)
    console.log(`📍 Successful markers: ${markersAdded}`)

    // Fit map bounds to show all markers if we have any
    if (markersAdded > 0 && map) {
      console.log('🔄 Fitting map to India bounds...')
      try {
        // Set view to India with appropriate zoom
        map.setView([20.5937, 78.9629], 5)
        console.log('✅ Map view set to show India with markers')
      } catch (boundsError) {
        console.warn('⚠️ Could not set map view:', boundsError)
      }
    }
  } catch (error) {
    console.error('❌ Error in addPensionerLocationMarkers:', error)
  }
}





// Intelligent coordinate mapping using AI-like logic
const getIntelligentCoordinates = async (state: string, district: string, pin?: string): Promise<[number, number] | null> => {
  // Comprehensive Indian location database with AI-enhanced mapping
  const locationDatabase: Record<string, Record<string, [number, number]>> = {
    'Uttar Pradesh': {
      'Kanpur Nagar': [26.4499, 80.3319],
      'Kanpur': [26.4499, 80.3319],
      'Lucknow': [26.8467, 80.9462],
      'Agra': [27.1767, 78.0081],
      'Varanasi': [25.3176, 82.9739],
      'Meerut': [28.9845, 77.7064],
      'Allahabad': [25.4358, 81.8463],
      'Prayagraj': [25.4358, 81.8463],
      'Bareilly': [28.3670, 79.4304],
      'Aligarh': [27.8974, 78.0880],
      'Moradabad': [28.8386, 78.7733],
      'Saharanpur': [29.9680, 77.5552],
      'Gorakhpur': [26.7606, 83.3732],
      'Noida': [28.5355, 77.3910],
      'Ghaziabad': [28.6692, 77.4538]
    },
    'Maharashtra': {
      'Mumbai': [19.0760, 72.8777],
      'Pune': [18.5204, 73.8567],
      'Nagpur': [21.1458, 79.0882],
      'Thane': [19.2183, 72.9781],
      'Nashik': [19.9975, 73.7898],
      'Aurangabad': [19.8762, 75.3433],
      'Solapur': [17.6599, 75.9064],
      'Kolhapur': [16.7050, 74.2433],
      'Sangli': [16.8524, 74.5815],
      'Ahmednagar': [19.0948, 74.7480]
    },
    'Delhi': {
      'New Delhi': [28.6139, 77.2090],
      'Central Delhi': [28.6508, 77.2311],
      'North Delhi': [28.7041, 77.1025],
      'South Delhi': [28.5244, 77.1855],
      'East Delhi': [28.6508, 77.3152],
      'West Delhi': [28.6692, 77.1031],
      'North West Delhi': [28.7233, 77.1722],
      'North East Delhi': [28.6744, 77.2847],
      'South West Delhi': [28.6061, 77.0610],
      'South East Delhi': [28.5562, 77.2759]
    },
    'Tamil Nadu': {
      'Chennai': [13.0827, 80.2707],
      'Coimbatore': [11.0168, 76.9558],
      'Madurai': [9.9252, 78.1198],
      'Tiruchirappalli': [10.7905, 78.7047],
      'Salem': [11.6643, 78.1460],
      'Tirunelveli': [8.7139, 77.7567],
      'Erode': [11.3410, 77.7172],
      'Vellore': [12.9165, 79.1325],
      'Thoothukudi': [8.7642, 78.1348],
      'Dindigul': [10.3673, 77.9803]
    },
    'Karnataka': {
      'Bangalore': [12.9716, 77.5946],
      'Bengaluru': [12.9716, 77.5946],
      'Bangalore Urban': [12.9716, 77.5946], // For your sample data
      'Mysore': [12.2958, 76.6394],
      'Hubli': [15.3647, 75.1240],
      'Mangalore': [12.9141, 74.8560],
      'Belgaum': [15.8497, 74.4977],
      'Gulbarga': [17.3297, 76.8343],
      'Davanagere': [14.4644, 75.9218],
      'Bellary': [15.1394, 76.9214],
      'Bijapur': [16.8302, 75.7100]
    },
    'West Bengal': {
      'Kolkata': [22.5726, 88.3639],
      'Howrah': [22.5958, 88.2636],
      'Durgapur': [23.4800, 87.3119],
      'Asansol': [23.6739, 86.9524],
      'Siliguri': [26.7271, 88.3953],
      'Malda': [25.0961, 88.1408],
      'Bardhaman': [23.2324, 87.8615],
      'Barasat': [22.7211, 88.4810],
      'Kharagpur': [22.3460, 87.2320],
      'Haldia': [22.0583, 88.0597]
    },
    'Gujarat': {
      'Ahmedabad': [23.0225, 72.5714],
      'Surat': [21.1702, 72.8311],
      'Vadodara': [22.3072, 73.1812],
      'Rajkot': [22.3039, 70.8022],
      'Bhavnagar': [21.7645, 72.1519],
      'Jamnagar': [22.4707, 70.0577],
      'Junagadh': [21.5222, 70.4579],
      'Gandhinagar': [23.2156, 72.6369],
      'Anand': [22.5645, 72.9289],
      'Morbi': [22.8173, 70.8372]
    },
    'Rajasthan': {
      'Jaipur': [26.9124, 75.7873],
      'Jodhpur': [26.2389, 73.0243],
      'Udaipur': [24.5854, 73.7125],
      'Kota': [25.2138, 75.8648],
      'Bikaner': [28.0229, 73.3119],
      'Ajmer': [26.4499, 74.6399],
      'Bhilwara': [25.3407, 74.6269],
      'Alwar': [27.5530, 76.6346],
      'Bharatpur': [27.2152, 77.5030],
      'Sikar': [27.6094, 75.1399]
    },
    'Kerala': {
      'Thiruvananthapuram': [8.5241, 76.9366],
      'Kochi': [9.9312, 76.2673],
      'Kozhikode': [11.2588, 75.7804],
      'Thrissur': [10.5276, 76.2144], // For your sample data
      'Kollam': [8.8932, 76.6141],
      'Palakkad': [10.7867, 76.6548],
      'Alappuzha': [9.4981, 76.3388],
      'Malappuram': [11.0410, 76.0873],
      'Kannur': [11.8745, 75.3704],
      'Kasaragod': [12.4996, 74.9869]
    },
    'Telangana': {
      'Hyderabad': [17.3850, 78.4867],
      'Nizamabad': [18.6725, 78.0941], // For your sample data
      'Warangal': [17.9689, 79.5941],
      'Khammam': [17.2473, 80.1514],
      'Karimnagar': [18.4386, 79.1288],
      'Mahbubnagar': [16.7460, 77.9953],
      'Nalgonda': [17.0542, 79.2673],
      'Adilabad': [19.6718, 78.5311],
      'Rangareddy': [17.4065, 78.4772],
      'Medak': [18.0480, 78.2747]
    }
  }

  // First try exact state and district match
  console.log(`🔍 Trying exact match for: "${state}" -> "${district}"`)
  if (locationDatabase[state] && locationDatabase[state][district]) {
    console.log(`✅ EXACT MATCH found: [${locationDatabase[state][district][0]}, ${locationDatabase[state][district][1]}]`)
    return locationDatabase[state][district]
  }
  console.log(`❌ No exact match for: "${state}" -> "${district}"`)

  // Try case-insensitive matching
  const stateKey = Object.keys(locationDatabase).find(s =>
    s.toLowerCase() === state.toLowerCase()
  )

  if (stateKey) {
    const districtKey = Object.keys(locationDatabase[stateKey]).find(d =>
      d.toLowerCase() === district.toLowerCase()
    )

    if (districtKey) {
      return locationDatabase[stateKey][districtKey]
    }
  }

  // If no exact match, try to find similar district names
  for (const [stateName, districts] of Object.entries(locationDatabase)) {
    for (const [districtName, coords] of Object.entries(districts)) {
      if (districtName.toLowerCase().includes(district.toLowerCase()) ||
          district.toLowerCase().includes(districtName.toLowerCase())) {
        console.log(`🤖 AI: Found similar match: ${districtName} for ${district}`)
        return coords
      }
    }
  }

  // Fallback to state capital if available
  const stateCapitals: Record<string, [number, number]> = {
    'Uttar Pradesh': [26.8467, 80.9462], // Lucknow
    'Maharashtra': [19.0760, 72.8777], // Mumbai
    'Delhi': [28.6139, 77.2090],
    'Tamil Nadu': [13.0827, 80.2707], // Chennai
    'Karnataka': [12.9716, 77.5946], // Bangalore
    'West Bengal': [22.5726, 88.3639], // Kolkata
    'Gujarat': [23.0225, 72.5714], // Ahmedabad
    'Rajasthan': [26.9124, 75.7873], // Jaipur
    'Bihar': [25.5941, 85.1376], // Patna
    'Madhya Pradesh': [23.2599, 77.4126], // Bhopal
    'Andhra Pradesh': [17.3850, 78.4867], // Hyderabad
    'Telangana': [17.3850, 78.4867], // Hyderabad
    'Kerala': [9.9312, 76.2673], // Kochi
    'Punjab': [30.7333, 76.7794], // Chandigarh
    'Haryana': [30.7333, 76.7794], // Chandigarh
    'Odisha': [20.2961, 85.8245], // Bhubaneswar
    'Jharkhand': [23.6102, 85.2799], // Ranchi
    'Assam': [26.2006, 92.9376], // Dispur
    'Chhattisgarh': [21.2787, 81.8661], // Raipur
    'Uttarakhand': [30.0668, 79.0193], // Dehradun
    'Himachal Pradesh': [31.1048, 77.1734], // Shimla
    'Jammu and Kashmir': [34.0837, 74.7973], // Srinagar
    'Goa': [15.2993, 74.1240] // Panaji
  }

  if (stateCapitals[state]) {
    console.log(`🤖 AI: Using state capital for ${state}`)
    return stateCapitals[state]
  }

  return null
}

// PIN code to coordinates mapping for major Indian PIN codes
const getPinCodeCoordinates = (pin: string): { lat: number, lng: number } | null => {
  const pinCoords: Record<string, { lat: number, lng: number }> = {
    // Delhi
    '110001': { lat: 28.6139, lng: 77.2090 }, // New Delhi
    '110002': { lat: 28.6139, lng: 77.2090 }, // New Delhi
    '110003': { lat: 28.6139, lng: 77.2090 }, // New Delhi

    // Mumbai
    '400001': { lat: 19.0760, lng: 72.8777 }, // Mumbai
    '400002': { lat: 19.0760, lng: 72.8777 }, // Mumbai
    '400003': { lat: 19.0760, lng: 72.8777 }, // Mumbai

    // Bangalore
    '560001': { lat: 12.9716, lng: 77.5946 }, // Bangalore
    '560002': { lat: 12.9716, lng: 77.5946 }, // Bangalore

    // Chennai
    '600001': { lat: 13.0827, lng: 80.2707 }, // Chennai
    '600002': { lat: 13.0827, lng: 80.2707 }, // Chennai

    // Kolkata
    '700001': { lat: 22.5726, lng: 88.3639 }, // Kolkata
    '700002': { lat: 22.5726, lng: 88.3639 }, // Kolkata

    // Hyderabad
    '500001': { lat: 17.3850, lng: 78.4867 }, // Hyderabad
    '500002': { lat: 17.3850, lng: 78.4867 }, // Hyderabad

    // Pune
    '411001': { lat: 18.5204, lng: 73.8567 }, // Pune
    '411002': { lat: 18.5204, lng: 73.8567 }, // Pune
  }

  return pinCoords[pin] || null
}

// State capital coordinates as fallback
const getStateCapitalCoordinates = (state: string): { lat: number, lng: number } | null => {
  const stateCapitals: Record<string, { lat: number, lng: number }> = {
    'Delhi': { lat: 28.6139, lng: 77.2090 },
    'Maharashtra': { lat: 19.0760, lng: 72.8777 }, // Mumbai
    'Karnataka': { lat: 12.9716, lng: 77.5946 }, // Bangalore
    'Tamil Nadu': { lat: 13.0827, lng: 80.2707 }, // Chennai
    'West Bengal': { lat: 22.5726, lng: 88.3639 }, // Kolkata
    'Uttar Pradesh': { lat: 26.8467, lng: 80.9462 }, // Lucknow
    'Gujarat': { lat: 23.0225, lng: 72.5714 }, // Ahmedabad
    'Rajasthan': { lat: 26.9124, lng: 75.7873 }, // Jaipur
    'Punjab': { lat: 30.7333, lng: 76.7794 }, // Chandigarh
    'Haryana': { lat: 28.4595, lng: 77.0266 }, // Gurgaon
    'Andhra Pradesh': { lat: 17.3850, lng: 78.4867 }, // Hyderabad
    'Telangana': { lat: 17.3850, lng: 78.4867 }, // Hyderabad
    'Kerala': { lat: 8.5241, lng: 76.9366 }, // Thiruvananthapuram
    'Odisha': { lat: 20.2961, lng: 85.8245 }, // Bhubaneswar
    'Madhya Pradesh': { lat: 23.2599, lng: 77.4126 }, // Bhopal
    'Bihar': { lat: 25.0961, lng: 85.3131 }, // Patna
    'Jharkhand': { lat: 23.6102, lng: 85.2799 }, // Ranchi
    'Assam': { lat: 26.1445, lng: 91.7362 }, // Guwahati
    'Chhattisgarh': { lat: 21.2787, lng: 81.8661 }, // Raipur
    'Uttarakhand': { lat: 30.0668, lng: 79.0193 }, // Dehradun
    'Himachal Pradesh': { lat: 31.1048, lng: 77.1734 }, // Shimla
    'Jammu and Kashmir': { lat: 34.0837, lng: 74.7973 }, // Srinagar
  }

  return stateCapitals[state] || null
}

// Clear all markers helper function
const clearMarkers = () => {
  markers.forEach(marker => {
    if (map) {
      map.removeLayer(marker)
    }
  })
  markers.length = 0
}

// Choropleth color functions

// Get pensioner count for a state (prioritize Excel data)
const getPensionerCountForState = (stateName: string): number => {
  // Enhanced state name normalization for better consistency
  const normalizeStateName = (name: string): string => {
    return name.trim().replace(/\s+/g, ' ').toLowerCase()
  }
  
  const normalizedStateName = normalizeStateName(stateName)
  
  // Try multiple variations of state name for better matching
  const stateVariations = [
    stateName, // Original
    stateName.toUpperCase(), // Uppercase
    stateName.toLowerCase(), // Lowercase
    stateName.replace(/\s+/g, ''), // No spaces
    stateName.toUpperCase().replace(/\s+/g, ''), // Uppercase no spaces
  ]
  
  // Check Excel data with all variations
  if (excelPensionerData.value?.state_wise_data) {
    for (const variation of stateVariations) {
      if (excelPensionerData.value.state_wise_data[variation]) {
        return excelPensionerData.value.state_wise_data[variation].total_pensioners || 0
      }
    }
    
    // Try normalized matching (case-insensitive, space-insensitive)
    const excelStates = Object.keys(excelPensionerData.value.state_wise_data)
    const matchedState = excelStates.find(state => 
      normalizeStateName(state) === normalizedStateName
    )
    
    if (matchedState) {
      return excelPensionerData.value.state_wise_data[matchedState].total_pensioners || 0
    }
  }
  
  // Fallback to regular API data with same variation matching
  for (const variation of stateVariations) {
    if (stateData.value[variation]) {
      return stateData.value[variation]
    }
  }
  
  // Try normalized matching for regular data
  const regularStates = Object.keys(stateData.value)
  const matchedRegularState = regularStates.find(state => 
    normalizeStateName(state) === normalizedStateName
  )
  
  if (matchedRegularState) {
    return stateData.value[matchedRegularState]
  }
  
  // Final fallback to stateWisePensionerData
  if (stateWisePensionerData.value) {
    const stateInfo = (stateWisePensionerData.value as any)[stateName]
    if (stateInfo?.totalPensioners) {
      return stateInfo.totalPensioners
    }
  }
  
  return 0
}

// Get state color based on actual pensioner data - red shades only (5 ranges)
const getStateColor = (stateName: string): string => {
  const pensionerCount = getPensionerCountForState(stateName)
  
  // Return light gray for states with no data (0 pensioners)
  if (pensionerCount === 0) {
    return '#e5e7eb' // Light gray for no data
  }
  
  // Red gradient - zyada pensioners = dark red, kam pensioners = light red (5 ranges only)
  if (pensionerCount >= 5000) {
    return '#7f1d1d' // Very dark red for highest (5k+)
  } else if (pensionerCount >= 2000) {
    return '#dc2626' // Dark red (2k-5k)
  } else if (pensionerCount >= 1000) {
    return '#ef4444' // Medium red (1k-2k)
  } else if (pensionerCount >= 500) {
    return '#f87171' // Light red (500-1k)
  } else if (pensionerCount > 0) {
    return '#fca5a5' // Very light red for lowest counts (1-500)
  }
  
  return '#e5e7eb' // Default gray for no data
}

// Helper function to get neighboring states for district view context
const getNeighboringStates = (stateName: string): string[] => {
  const neighbors: { [key: string]: string[] } = {
    'Rajasthan': ['Gujarat', 'Madhya Pradesh', 'Uttar Pradesh', 'Haryana', 'Punjab'],
    'Gujarat': ['Rajasthan', 'Madhya Pradesh', 'Maharashtra'],
    'Maharashtra': ['Gujarat', 'Madhya Pradesh', 'Karnataka', 'Telangana', 'Goa'],
    'Karnataka': ['Maharashtra', 'Telangana', 'Andhra Pradesh', 'Tamil Nadu', 'Kerala', 'Goa'],
    'Tamil Nadu': ['Karnataka', 'Andhra Pradesh', 'Kerala'],
    'Uttar Pradesh': ['Rajasthan', 'Madhya Pradesh', 'Bihar', 'Jharkhand', 'Uttarakhand', 'Haryana', 'Delhi'],
    'Bihar': ['Uttar Pradesh', 'Jharkhand', 'West Bengal'],
    'West Bengal': ['Bihar', 'Jharkhand', 'Odisha', 'Assam'],
    'Assam': ['West Bengal', 'Meghalaya', 'Arunachal Pradesh', 'Nagaland'],
    'Delhi': ['Uttar Pradesh', 'Haryana'],
    'Haryana': ['Punjab', 'Uttar Pradesh', 'Rajasthan', 'Delhi'],
    'Punjab': ['Haryana', 'Rajasthan', 'Himachal Pradesh'],
    'Madhya Pradesh': ['Rajasthan', 'Gujarat', 'Maharashtra', 'Uttar Pradesh', 'Bihar', 'Jharkhand', 'Odisha'],
    'Odisha': ['Madhya Pradesh', 'Jharkhand', 'West Bengal', 'Andhra Pradesh'],
    'Telangana': ['Maharashtra', 'Karnataka', 'Andhra Pradesh'],
    'Andhra Pradesh': ['Telangana', 'Karnataka', 'Tamil Nadu', 'Odisha'],
    'Kerala': ['Karnataka', 'Tamil Nadu'],
    'Goa': ['Maharashtra', 'Karnataka']
  }
  return neighbors[stateName] || []
}

// Helper function to get district from pincode (matching backend logic)
const getDistrictFromPincode = (pincode: string): string => {
  try {
    const pin_num = parseInt(pincode.substring(0, 3))
    
    // Gujarat districts (comprehensive mapping)
    if (pin_num >= 360 && pin_num <= 370) return 'Rajkot'
    if (pin_num >= 380 && pin_num <= 382) return 'Ahmedabad'
    if (pin_num >= 390 && pin_num <= 396) return 'Vadodara'
    if (pin_num >= 370 && pin_num <= 375) return 'Jamnagar'
    if (pin_num >= 383 && pin_num <= 389) return 'Gandhinagar'
    if (pin_num >= 362 && pin_num <= 365) return 'Bhavnagar'
    if (pin_num >= 385 && pin_num <= 388) return 'Mehsana'
    if (pin_num >= 394 && pin_num <= 396) return 'Bharuch'
    if (pin_num >= 364 && pin_num <= 365) return 'Amreli'
    if (pin_num >= 396 && pin_num <= 399) return 'Surat'
    
    // Rajasthan districts (comprehensive mapping)
    if (pin_num >= 302 && pin_num <= 303) return 'Jaipur'
    if (pin_num >= 342 && pin_num <= 344) return 'Jodhpur'
    if (pin_num >= 313 && pin_num <= 314) return 'Udaipur'
    if (pin_num >= 334 && pin_num <= 335) return 'Bikaner'
    if (pin_num >= 301 && pin_num <= 302) return 'Alwar'
    if (pin_num >= 321 && pin_num <= 322) return 'Bharatpur'
    if (pin_num >= 324 && pin_num <= 325) return 'Kota'
    if (pin_num >= 331 && pin_num <= 332) return 'Churu'
    if (pin_num >= 341 && pin_num <= 342) return 'Barmer'
    if (pin_num >= 345 && pin_num <= 346) return 'Jaisalmer'
    
    // Maharashtra districts (comprehensive mapping)
    if (pin_num >= 400 && pin_num <= 421) return 'Mumbai'
    if (pin_num >= 411 && pin_num <= 414) return 'Pune'
    if (pin_num >= 440 && pin_num <= 445) return 'Nagpur'
    if (pin_num >= 422 && pin_num <= 425) return 'Nashik'
    if (pin_num >= 431 && pin_num <= 432) return 'Aurangabad'
    if (pin_num >= 416 && pin_num <= 418) return 'Kolhapur'
    if (pin_num >= 425 && pin_num <= 428) return 'Dhule'
    if (pin_num >= 445 && pin_num <= 448) return 'Amravati'
    if (pin_num >= 413 && pin_num <= 415) return 'Solapur'
    
    // Karnataka districts (comprehensive mapping)
    if (pin_num >= 560 && pin_num <= 562) return 'Bangalore'
    if (pin_num >= 570 && pin_num <= 571) return 'Mysore'
    if (pin_num >= 580 && pin_num <= 582) return 'Hubli'
    if (pin_num >= 575 && pin_num <= 576) return 'Mangalore'
    if (pin_num >= 563 && pin_num <= 564) return 'Kolar'
    if (pin_num >= 573 && pin_num <= 574) return 'Hassan'
    if (pin_num >= 577 && pin_num <= 578) return 'Shimoga'
    if (pin_num >= 585 && pin_num <= 586) return 'Bijapur'
    if (pin_num >= 590 && pin_num <= 591) return 'Gulbarga'
    
    return 'Other District'
  } catch {
    return 'Unknown District'
  }
}

// Get district color based on actual pensioner data - red shades only (5 ranges)
const getDistrictColor = (districtName: string, stateName: string): string => {
  // Use same Excel data source as state view for consistency
  let pensionerCount = 0
  
  if (excelPensionerData.value?.state_wise_data?.[stateName]) {
    const stateExcelData = excelPensionerData.value.state_wise_data[stateName]
    
    // Count pensioners in this district by checking pincode_counts
    if (stateExcelData.pincode_counts) {
      Object.entries(stateExcelData.pincode_counts).forEach(([pincode, count]) => {
        const pincodeDistrict = getDistrictFromPincode(pincode)
        if (pincodeDistrict.toLowerCase() === districtName.toLowerCase()) {
          pensionerCount += Number(count) || 0
        }
      })
    }
  }
  
  // Return light gray for districts with no data (0 pensioners)
  if (pensionerCount === 0) {
    return '#e5e7eb' // Light gray for no data
  }
  
  // Red gradient - zyada pensioners = dark red, kam pensioners = light red (5 ranges only)
  if (pensionerCount >= 1000) {
    return '#7f1d1d' // Very dark red for highest (1k+)
  } else if (pensionerCount >= 500) {
    return '#dc2626' // Dark red (500-1k)
  } else if (pensionerCount >= 200) {
    return '#ef4444' // Medium red (200-500)
  } else if (pensionerCount >= 100) {
    return '#f87171' // Light red (100-200)
  } else if (pensionerCount > 0) {
    return '#fca5a5' // Very light red for lowest counts (1-100)
  }
  
  return '#e5e7eb' // Default gray for no data
}

// Add proper choropleth layer using customGeoJSON (not simple squares)
const addProperChoroplethLayer = () => {
  if (!map || choroplethLayer) return

  choroplethLayer = L.geoJSON(customGeoJSON as any, {
    style: (feature) => {
      const stateName = feature?.properties?.st_nm || feature?.properties?.name || ''
      return {
        fillColor: getStateColor(stateName),
        weight: 2,
        opacity: 1,
        color: '#374151',
        dashArray: '',
        fillOpacity: 0.8
      }
    },
    onEachFeature: (feature, layer) => {
      const stateName = feature.properties?.st_nm || feature.properties?.name || ''
      const value = getPensionerCountForState(stateName)

      layer.bindPopup(`
        <div class="state-popup">
          <h3>${stateName}</h3>
          <p><strong>Pensioners:</strong> ${value.toLocaleString()}</p>
        </div>
      `)

      layer.on({
        mouseover: (e) => {
          const layer = e.target
          layer.setStyle({
            weight: 3,
            color: '#1f2937',
            fillOpacity: 0.8
          })
        },
        mouseout: (e) => {
          choroplethLayer?.resetStyle(e.target)
        }
      })
    }
  }).addTo(map)
}

// Remove choropleth layer
const removeChoroplethLayer = () => {
  console.log('🔄 Removing choropleth layer...')

  if (choroplethLayer && map) {
    try {
      map.removeLayer(choroplethLayer)
      choroplethLayer = null
      console.log('✅ Choropleth layer removed successfully')
    } catch (error) {
      console.error('❌ Error removing choropleth layer:', error)
      choroplethLayer = null
    }
  }

  // Also remove any other GeoJSON layers that might be causing green highlighting
  if (map) {
    map.eachLayer((layer: any) => {
      // Check if this is a GeoJSON layer with state features
      if (layer.feature && layer.feature.properties && layer.feature.properties.st_nm) {
        try {
          map.removeLayer(layer)
          console.log('🗑️ Removed state GeoJSON layer:', layer.feature.properties.st_nm)
        } catch (error) {
          console.warn('Could not remove GeoJSON layer:', error)
        }
      }

      // Check if this is a choropleth-style layer
      if (layer.options && layer.options.style && typeof layer.options.style === 'function') {
        try {
          map.removeLayer(layer)
          console.log('🗑️ Removed styled layer')
        } catch (error) {
          console.warn('Could not remove styled layer:', error)
        }
      }
    })
  }
}



// Watch for changes in useCustomGeoJSON checkbox
watch(useCustomGeoJSON, (newValue) => {
  if (!map) return

  if (newValue) {
    // Switch to custom GeoJSON map
    showCustomGeoJSONMap()
  } else {
    // Switch back to original map
    showOriginalMap()
  }
})

// Lifecycle hooks
onMounted(async () => {
  console.log('🔄 Component mounted, loading pensioners data and initializing map...')

  // Direct API integration - no backend needed
  console.log('🔗 Using direct API integration with your pensioner API')

  // Load pensioners data from API
  await fetchPensionersData()

  // Load verification data and integrate with Ollama
  await loadVerificationData()
  


  // Wait for DOM to be ready
  setTimeout(() => {
    initializeMap()
    // After map init, force a size recalculation for correct rendering inside the card
    try { map?.invalidateSize(true) } catch (e) {}
  }, 500)

  // Listen to window resize to keep map fitting its container
  const handleResize = () => {
    try { map?.invalidateSize(true) } catch (e) {}
  }
  ;(window as any).__rbmHandleResize = handleResize
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // Cleanup resize listener
  if ((window as any).__rbmHandleResize) {
    window.removeEventListener('resize', (window as any).__rbmHandleResize)
    delete (window as any).__rbmHandleResize
  }
  if (map) {
    map.remove()
    map = null
  }
  markers = []
})
 



// Export functionality
const exportData = () => {
  const data = {
    verificationData: verificationData.value,
    rawData: rawData.value,
    timestamp: new Date().toISOString(),
    totalVerifications: verificationData.value.reduce((sum, item) => sum + item.total, 0),
    totalCompleted: verificationData.value.reduce((sum, item) => sum + item.completed, 0),
    totalPending: verificationData.value.reduce((sum, item) => sum + item.pending, 0)
  }

  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `verification-data-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Force reload data function
const forceReloadData = async () => {
  console.log('🔄 Force reloading data...')
  try {
    await loadVerificationData()
    if (map) {
      await addPensionerLocationMarkers()
    }
    console.log('✅ Data reloaded successfully')
  } catch (error) {
    console.error('❌ Error reloading data:', error)
  }
}
</script>

<style lang="scss" scoped>
.verification-map-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;

  /* Premium Multi-layer Border Effect */
  border: 3px solid transparent;
  background-clip: padding-box;

  /* Outer glow shadow */
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 0 3px rgba(102, 126, 234, 0.2),
    0 8px 32px rgba(0, 0, 0, 0.15),
    0 4px 16px rgba(102, 126, 234, 0.1);

  /* Premium border gradient overlay */
  &::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    background: linear-gradient(45deg,
      #667eea 0%,
      #764ba2 25%,
      #f093fb 50%,
      #f5576c 75%,
      #667eea 100%);
    border-radius: 23px;
    z-index: -1;
    opacity: 0.8;
  }

  /* Inner highlight border */
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    bottom: 2px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 18px;
    pointer-events: none;
    z-index: 1;
  }
}

.verification-map-card:hover {
  /* Removed transform and scale effects */

  /* Enhanced hover shadow with premium glow */
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.2),
    0 0 0 4px rgba(102, 126, 234, 0.3),
    0 16px 48px rgba(0, 0, 0, 0.2),
    0 8px 24px rgba(102, 126, 234, 0.2),
    0 0 40px rgba(245, 87, 108, 0.1);

  /* Animate the gradient border on hover */
  &::before {
    opacity: 1;
    background: linear-gradient(45deg,
      #667eea 0%,
      #764ba2 20%,
      #f093fb 40%,
      #f5576c 60%,
      #4facfe 80%,
      #667eea 100%);
    animation: borderGlow 3s ease-in-out infinite;
  }
}

/* Premium border animation */
@keyframes borderGlow {
  0%, 100% {
    background: linear-gradient(45deg,
      #667eea 0%,
      #764ba2 25%,
      #f093fb 50%,
      #f5576c 75%,
      #667eea 100%);
  }
  50% {
    background: linear-gradient(45deg,
      #f5576c 0%,
      #f093fb 25%,
      #764ba2 50%,
      #667eea 75%,
      #4facfe 100%);
  }
}

.card-header {
  background: linear-gradient(135deg, var(--va-info) 0%, var(--va-info-dark) 100%);
  padding: 20px 24px;
  color: white !important;
  position: relative;
  z-index: 10;
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
  /* Responsive height to fit nicely in the card */
  height: clamp(500px, 60vh, 900px);
  background: var(--va-background-secondary);
  overflow: hidden;
  border-radius: 18px;

  /* Inner premium border for map container */
  border: 2px solid rgba(255, 255, 255, 0.1);

  /* Subtle inner shadow for depth */
  box-shadow:
    inset 0 2px 8px rgba(0, 0, 0, 0.1),
    inset 0 -2px 4px rgba(255, 255, 255, 0.05);

  /* Animated border highlight */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%);
    z-index: 10;
    animation: shimmer 3s ease-in-out infinite;
  }
}

/* Shimmer animation for top border */
@keyframes shimmer {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

.leaflet-map {
  width: 100%;
  height: 100%;
  z-index: 1;
  border-radius: 0 0 16px 16px;
  overflow: hidden;
  position: relative;
  background: #f8fafc;

  /* Premium map border styling */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-top: none;

  /* Enhanced shadow for better card integration */
  box-shadow:
    0 0 20px rgba(102, 126, 234, 0.1),
    inset 0 0 20px rgba(255, 255, 255, 0.02);
}

/* Leaflet custom styles */
:deep(.leaflet-container) {
  height: 100%;
  width: 100%;
  border-radius: 0 0 16px 16px;

  /* Clean background for better tile visibility */
  background: #f8f9fa !important;

  /* Enhanced border for leaflet container */
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: none;

  /* Subtle inner glow */
  box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.1);
}

/* Ensure map tiles display properly */
:deep(.leaflet-tile-container) {
  opacity: 1 !important;
}

:deep(.leaflet-tile) {
  opacity: 1 !important;
  filter: none !important;
}

/* Hide Leaflet attribution */
.leaflet-control-attribution {
  display: none !important;
}

/* Breadcrumb Navigation */
.breadcrumb-nav {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.breadcrumb-btn {
  background: transparent;
  border: none;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.breadcrumb-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.breadcrumb-btn.active {
  background: #3b82f6;
  color: white;
  font-weight: 600;
}

.breadcrumb-separator {
  color: #9ca3af;
  font-weight: 500;
  font-size: 14px;
}

/* Custom styling for map tiles */
:deep(.map-tiles) {
  opacity: 1 !important;
}

:deep(.leaflet-control-zoom) {
  border: none !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}

:deep(.leaflet-control-zoom a) {
  background: var(--va-background-primary) !important;
  color: var(--va-text-primary) !important;
  border: 1px solid var(--va-background-border) !important;
  width: 34px !important;
  height: 34px !important;
  line-height: 34px !important;
  font-size: 18px !important;
  font-weight: bold !important;
  border-radius: 4px !important;
}

:deep(.leaflet-control-zoom a:hover) {
  background: var(--va-background-secondary) !important;
}

/* Clean marker styles - no dark background */
:deep(.custom-verification-marker) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

:deep(.clean-pin) {
  background: transparent !important;
}

:deep(.map-pin-clean) {
  transition: all 0.3s ease;
  background: transparent !important;
}

:deep(.map-pin-clean:hover) {
  transform: scale(1.08);
}

:deep(.map-pin-clean:hover .pin-body-clean) {
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.35) !important;
  transform: rotate(-45deg) scale(1.02);
}

:deep(.pin-body-clean) {
  transition: all 0.3s ease;
}

:deep(.pin-center-clean) {
  transition: all 0.3s ease;
}

/* Theme-aware clean pin styles */
[data-theme='dark'] :deep(.pin-center-clean) {
  background: #1a1a1a !important;
  color: #ffffff !important;
  border: 1px solid rgba(255,255,255,0.2) !important;
}

[data-theme='light'] :deep(.pin-center-clean) {
  background: #ffffff !important;
  border: 1px solid rgba(0,0,0,0.1) !important;
}

/* Popup styles */
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  background: var(--va-background-primary) !important;
  color: var(--va-text-primary) !important;
}

:deep(.leaflet-popup-content) {
  margin: 12px 16px !important;
  font-family: 'Inter', sans-serif !important;
  color: var(--va-text-primary) !important;
}

:deep(.verification-popup) {
  min-width: 200px;
}

.map-legend {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  color: var(--va-text-primary);
  padding: 12px;
  border-radius: 10px;
  z-index: 1000;
  max-width: 240px;
  min-width: 180px;

  /* Premium legend border styling */
  border: 2px solid transparent;
  background-clip: padding-box;

  /* Multi-layer shadow for premium look */
  box-shadow:
    0 0 0 1px rgba(102, 126, 234, 0.2),
    0 8px 32px rgba(0, 0, 0, 0.15),
    0 4px 16px rgba(102, 126, 234, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);

  /* Premium gradient border */
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(135deg,
      rgba(102, 126, 234, 0.3) 0%,
      rgba(118, 75, 162, 0.3) 50%,
      rgba(240, 147, 251, 0.3) 100%);
    border-radius: 18px;
    z-index: -1;
  }

  /* Subtle hover effect */
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 0 0 1px rgba(102, 126, 234, 0.3),
      0 12px 40px rgba(0, 0, 0, 0.2),
      0 6px 20px rgba(102, 126, 234, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }
}

.legend-content {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.legend-section {
  flex: 1;
  min-width: 120px;
}

.legend-section:last-child {
  margin-bottom: 0;
}

.legend-section h4 {
  font-size: 12px;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: var(--va-text-primary);
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--va-text-secondary);
}

.legend-color {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-border {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid;
  background: var(--va-background-primary);
}

/* Map Header Styles */
.map-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.header-title {
  font-size: 16px;
  font-weight: 700;
  color: white;
  margin: 0;
  letter-spacing: 0.5px;
}

.header-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin: 2px 0 0 0;
}

.refresh-btn {
  background: var(--va-info, #2196f3);
  color: var(--va-on-info, white);
  border: 1px solid var(--va-info, #2196f3);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-right: 8px;
}

.refresh-btn:hover {
  background: var(--va-info-darken, #1976d2);
  border-color: var(--va-info-darken, #1976d2);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.export-btn {
  background: var(--va-primary, #10b981);
  color: var(--va-on-primary, white);
  border: 1px solid var(--va-primary, #10b981);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.export-btn:hover {
  background: var(--va-primary-darken, #059669);
  border-color: var(--va-primary-darken, #059669);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}



/* Responsive design for mobile */
@media (max-width: 768px) {
  .map-container {
    height: 500px;
  }

  .map-legend {
    position: absolute;
    bottom: 16px;
    left: 16px;
    right: 16px;
    margin: 0;
    width: calc(100% - 32px);
  }

  .legend-content {
    flex-direction: column;
    gap: 10px;
  }

  .legend-section {
    min-width: auto;
  }

  .map-header {
    padding: 12px 16px;
  }

  .header-title {
    font-size: 14px;
  }

  .header-subtitle {
    font-size: 11px;
  }

  .refresh-btn {
    padding: 6px 12px;
    font-size: 11px;
    gap: 4px;
    margin-right: 6px;
  }

  .refresh-btn {
    padding: 6px 12px;
    font-size: 11px;
    gap: 4px;
    margin-right: 6px;
  }

  .export-btn {
    padding: 6px 12px;
    font-size: 11px;
    gap: 4px;
  }



  :deep(.leaflet-control-zoom) {
    margin-right: 10px !important;
    margin-top: 10px !important;
  }
}

/* Light theme adjustments - Higher specificity */
[data-theme='light'] .verification-map-card .card-header {
  background: linear-gradient(135deg, #17a2b8 0%, #117a8b 100%) !important;
  color: white !important;
  position: relative !important;
  z-index: 10 !important;
}

[data-theme='light'] .verification-map-card .card-title {
  color: white !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  position: relative !important;
  z-index: 11 !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
}

[data-theme='light'] .verification-map-card .card-subtitle {
  color: rgba(255, 255, 255, 0.95) !important;
  font-weight: 500 !important;
  position: relative !important;
  z-index: 11 !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
}

[data-theme='light'] .verification-map-card {
  background: white !important;
  border: 1px solid #e9ecef !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

/* Fallback for header visibility in all themes */
.verification-map-card .card-header {
  position: relative;
  z-index: 1;
}

.verification-map-card .card-title,
.verification-map-card .card-subtitle {
  position: relative;
  z-index: 2;
}

/* Ensure text is always visible regardless of theme */
.verification-map-card .card-header * {
  color: white !important;
}

/* Override any potential CSS variable conflicts */
html[data-theme='light'] .verification-map-card .card-header,
body[data-theme='light'] .verification-map-card .card-header,
.theme-light .verification-map-card .card-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: white !important;
}

html[data-theme='light'] .verification-map-card .card-title,
body[data-theme='light'] .verification-map-card .card-title,
.theme-light .verification-map-card .card-title {
  color: white !important;
}

html[data-theme='light'] .verification-map-card .card-subtitle,
body[data-theme='light'] .verification-map-card .card-subtitle,
.theme-light .verification-map-card .card-subtitle {
  color: rgba(255, 255, 255, 0.95) !important;
}

/* Ultra-aggressive override for all possible scenarios */
.verification-map-card .card-header,
.verification-map-card .card-header *,
.verification-map-card .card-title,
.verification-map-card .card-subtitle {
  color: white !important;
}

.verification-map-card .card-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
}

/* Override any CSS variables that might affect text color */
.verification-map-card .card-header {
  --va-text-primary: white !important;
  --va-text-secondary: rgba(255, 255, 255, 0.95) !important;
}

/* Additional theme-specific popup fixes */
[data-theme='dark'] :deep(.leaflet-popup-content-wrapper) {
  background: var(--va-background-primary) !important;
  color: var(--va-text-primary) !important;
}

[data-theme='dark'] :deep(.verification-popup h4) {
  color: var(--va-text-primary) !important;
}

[data-theme='dark'] :deep(.verification-popup div) {
  color: var(--va-text-primary) !important;
}

/* Dark theme adjustments */
[data-theme='dark'] .verification-map-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

[data-theme='dark'] .verification-map-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

/* Floating Legend Panel Styles */
.floating-legend-container {
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 1000;
}

.floating-card-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100px;
  height: 40px;
}

.floating-legend-card {
  position: absolute;
  bottom: 0;
  left: 0;
  min-width: 100px;
  height: 40px;
  background: var(--va-background-primary, #ffffff);
  border: 1px solid var(--va-background-border, #e0e7ff);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: float 3s ease-in-out infinite;
  padding: 0 12px;
}

.floating-legend-card:hover {
  /* Removed transform and shadow effects */
  border-color: var(--va-primary, #154ec1);
}



.card-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--va-text-primary, #333333);
  white-space: nowrap;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

.expanded-legend-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 280px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.legend-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
}

.legend-close-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

.legend-content {
  padding: 20px;
  padding-top: 40px;
}

.legend-section {
  margin-bottom: 12px;
}

.legend-section:last-child {
  margin-bottom: 0;
}

/* Simple location marker styles */
.simple-location-marker {
  background: transparent !important;
  border: none !important;
  z-index: 1000 !important;
  position: relative !important;
}

/* Pensioner location marker styles - same as Delhi marker */
.pensioner-location-marker {
  background: transparent !important;
  border: none !important;
  z-index: 10000 !important;
  position: relative !important;
}

.pensioner-location-marker .modern-location-pin {
  width: 30px;
  height: 40px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pensioner-location-marker .modern-location-pin::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  background: #ff4444;
  border-radius: 50% 50% 50% 0;
  transform: translateX(-50%) rotate(-45deg);
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.pensioner-location-marker .modern-location-pin::after {
  content: '';
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 12px solid #ff4444;
}

.pensioner-location-marker .pin-dot {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  z-index: 10002;
}

/* Ensure markers are always visible */
:deep(.leaflet-marker-pane) {
  z-index: 600 !important;
}

:deep(.leaflet-marker-pane .pensioner-location-marker) {
  z-index: 10000 !important;
}

.modern-location-pin {
  width: 30px;
  height: 40px;
  position: relative;
  cursor: pointer;
  background: transparent;
}

.modern-location-pin::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 24px;
  background: #ff4444;
  border-radius: 50%;
  border: 3px solid #ffffff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  z-index: 1000;
}

.modern-location-pin::after {
  content: '';
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 12px solid #ff4444;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  z-index: 999;
}

.modern-location-pin:hover {
  transform: scale(1.1);
}

.modern-location-pin:hover::before {
  background: #cc0000;
  box-shadow: 0 3px 12px rgba(255,68,68,0.4);
}

.modern-location-pin:hover::after {
  border-top-color: #cc0000;
}

.pin-dot {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0,0,0,0.3);
  z-index: 1001;
}

.modern-location-pin:hover .pin-dot {
  background: #ffffff;
}

.location-popup {
  text-align: center;
  font-family: 'Inter', sans-serif;
}

.location-popup h4 {
  margin: 0 0 8px 0;
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
}

.location-popup p {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
}

.legend-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--va-text-primary, #333);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--va-text-primary, #333);
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.legend-border {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Data Toggle Checkbox Styles */
.data-toggle-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.data-toggle-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: var(--va-text-primary, #333);
  transition: all 0.2s ease;
}

.data-toggle-label:hover {
  color: var(--va-primary, #154ec1);
}

.data-toggle-checkbox {
  display: none;
}

.checkmark {
  position: relative;
  width: 18px;
  height: 18px;
  background: white;
  border: 2px solid #ddd;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.data-toggle-checkbox:checked + .checkmark {
  background: var(--va-primary, #154ec1);
  border-color: var(--va-primary, #154ec1);
}

.data-toggle-checkbox:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.toggle-text {
  user-select: none;
  font-weight: 500;
  color: #374151;
  margin-left: 8px;
}

/* Data Point Marker Styles */
.custom-data-point-marker {
  background: transparent !important;
  border: none !important;
}

.data-point-pin {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.data-point-popup {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  min-width: 200px;
}

.data-point-popup h4 {
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

/* Dark theme support for toggle */
[data-theme='dark'] .data-toggle-section {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

[data-theme='dark'] .checkmark {
  background: var(--va-background-secondary, #2a2a2a);
  border-color: var(--va-background-border, #444);
}

[data-theme='dark'] .data-toggle-checkbox:checked + .checkmark {
  background: var(--va-primary, #4c9aff);
  border-color: var(--va-primary, #4c9aff);
}

/* Animation Transitions */
.legend-expand-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.legend-expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.legend-expand-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.legend-expand-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}

.legend-expand-enter-to,
.legend-expand-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Dark theme support for floating panel */
[data-theme='dark'] .floating-legend-card {
  background: var(--va-background-primary, #1a1a1a);
  border: 1px solid var(--va-background-border, #333333);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

[data-theme='dark'] .floating-legend-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  border-color: var(--va-primary, #4c9aff);
}

[data-theme='dark'] .card-text {
  color: var(--va-text-primary, #ffffff);
}

[data-theme='dark'] .expanded-legend-panel {
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

[data-theme='dark'] .legend-close-btn {
  background: rgba(60, 60, 60, 0.8);
}

[data-theme='dark'] .legend-close-btn:hover {
  background: rgba(80, 80, 80, 1);
}

[data-theme='dark'] .legend-section h4 {
  color: var(--va-text-primary);
}

[data-theme='dark'] .legend-item {
  color: var(--va-text-primary);
}

/* Dark theme support for buttons */
[data-theme='dark'] .refresh-btn {
  background: var(--va-info, #4c9aff);
  color: var(--va-on-info, #ffffff);
  border: 1px solid var(--va-info, #4c9aff);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

[data-theme='dark'] .refresh-btn:hover {
  background: var(--va-info-darken, #3b82f6);
  border-color: var(--va-info-darken, #3b82f6);
  box-shadow: 0 4px 12px rgba(76, 154, 255, 0.4);
}

[data-theme='dark'] .export-btn {
  background: var(--va-primary, #4c9aff);
  color: var(--va-on-primary, #ffffff);
  border: 1px solid var(--va-primary, #4c9aff);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

[data-theme='dark'] .export-btn:hover {
  background: var(--va-primary-darken, #3b82f6);
  border-color: var(--va-primary-darken, #3b82f6);
  box-shadow: 0 4px 12px rgba(76, 154, 255, 0.4);
}

/* Custom GeoJSON popup styles */
:deep(.custom-geo-popup) {
  font-family: 'Inter', sans-serif;
  padding: 8px;
}

:deep(.custom-geo-popup h3) {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

:deep(.custom-geo-popup p) {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
}

/* State popup styles */
:deep(.state-popup) {
  font-family: 'Inter', sans-serif;
  padding: 8px;
}

:deep(.state-popup h3) {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

:deep(.state-popup p) {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
}

/* Loading and Error States */
.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.loading-content,
.error-content {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.loading-spinner {
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
  color: #3b82f6;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-content p,
.error-content p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.retry-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background: #2563eb;
}

/* Dark theme support for loading/error states */
[data-theme='dark'] .loading-overlay,
[data-theme='dark'] .error-overlay {
  background: rgba(17, 24, 39, 0.9);
}

[data-theme='dark'] .loading-content,
[data-theme='dark'] .error-content {
  background: #1f2937;
  border-color: #374151;
  color: #f9fafb;
}

[data-theme='dark'] .loading-content p,
[data-theme='dark'] .error-content p {
  color: #d1d5db;
}

/* Stats grid styles */
.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #e5e7eb;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-size: 12px;
  color: #1f2937;
  font-weight: 600;
}

/* Custom location marker styles */
.custom-location-marker {
  background: transparent !important;
  border: none !important;
}

/* Premium location pin styles */
.premium-location-pin {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: pinDrop 0.6s ease-out;
}

.premium-location-pin:hover {
  transform: scale(1.15) translateY(-2px);
}

.premium-location-pin svg {
  filter: drop-shadow(0 8px 16px rgba(79, 70, 229, 0.25)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.premium-location-pin:hover svg {
  filter: drop-shadow(0 12px 24px rgba(79, 70, 229, 0.4)) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.2));
}

/* Pin drop animation */
@keyframes pinDrop {
  0% {
    transform: translateY(-20px) scale(0.8);
    opacity: 0;
  }
  50% {
    transform: translateY(2px) scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* Pulse animation for active pins */
.premium-location-pin.active {
  animation: pinPulse 2s infinite;
}

@keyframes pinPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Color-specific hover effects */
.premium-location-pin.high:hover svg {
  filter: drop-shadow(0 12px 24px rgba(220, 38, 38, 0.4)) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.2));
}

.premium-location-pin.medium:hover svg {
  filter: drop-shadow(0 12px 24px rgba(245, 158, 11, 0.4)) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.2));
}

.premium-location-pin.low:hover svg {
  filter: drop-shadow(0 12px 24px rgba(16, 185, 129, 0.4)) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.2));
}

.premium-location-pin.default:hover svg {
  filter: drop-shadow(0 12px 24px rgba(79, 70, 229, 0.4)) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.2));
}



.location-popup {
  font-family: 'Inter', sans-serif;
  min-width: 250px;
}

.location-popup h4 {
  margin: 0 0 10px 0;
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
}

.location-popup p {
  margin: 5px 0;
  color: #4b5563;
  font-size: 14px;
}

.location-popup details {
  margin-top: 10px;
}

.location-popup summary {
  cursor: pointer;
  font-weight: 500;
  color: #374151;
  padding: 5px 0;
}

.location-popup ul {
  max-height: 150px;
  overflow-y: auto;
}

/* Premium Modern Popup Styles */
.premium-location-popup {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  min-width: 320px;
  max-width: 380px;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.popup-header-modern {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.location-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  backdrop-filter: blur(10px);
}

.location-info {
  flex: 1;
}

.district-name {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.state-name {
  margin: 2px 0 0 0;
  font-size: 13px;
  opacity: 0.85;
  font-weight: 500;
}

.popup-close {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  font-weight: 300;
  transition: all 0.2s ease;
}

.popup-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.popup-content-modern {
  padding: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card.pin-codes .stat-icon {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
}

.stat-card.pensioners .stat-icon {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.popup-footer {
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
  display: flex;
  justify-content: center;
}

.coordinates-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  color: #475569;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #e2e8f0;
}

.coordinates-badge svg {
  opacity: 0.7;
}

.location-popup li {
  margin: 3px 0;
  font-size: 13px;
  color: #6b7280;
}

/* Dark theme support for stats */
[data-theme='dark'] .stat-item {
  border-bottom-color: #374151;
}

[data-theme='dark'] .stat-label {
  color: #9ca3af;
}

[data-theme='dark'] .stat-value {
  color: #f9fafb;
}

[data-theme='dark'] .location-popup h4 {
  color: #f9fafb;
}

[data-theme='dark'] .location-popup p {
  color: #d1d5db;
}

[data-theme='dark'] .location-popup summary {
  color: #e5e7eb;
}

[data-theme='dark'] .location-popup li {
  color: #9ca3af;
}

/* Ultra Premium Popup Styles */
.ultra-premium-popup {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  width: 320px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 32px rgba(0, 0, 0, 0.1);
  background: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.popup-header-ultra {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%);
  padding: 20px;
  color: white;
  display: flex;
  align-items: center;
  gap: 16px;
  overflow: hidden;
}

.header-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
  z-index: 1;
}

.location-icon-ultra {
  position: relative;
  z-index: 2;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.location-info-ultra {
  position: relative;
  z-index: 2;
  flex: 1;
}

.district-name-ultra {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.state-name-ultra {
  margin: 4px 0 0 0;
  font-size: 14px;
  opacity: 0.9;
  font-weight: 500;
}

.density-indicator {
  position: relative;
  z-index: 2;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
}

.density-indicator.high .density-dot {
  background: #ef4444;
  animation: pulse-red 2s infinite;
}

.density-indicator.medium .density-dot {
  background: #f59e0b;
  animation: pulse-orange 2s infinite;
}

.density-indicator.low .density-dot {
  background: #10b981;
  animation: pulse-green 2s infinite;
}

.density-indicator.default .density-dot {
  background: #3b82f6;
  animation: pulse-blue 2s infinite;
}

.density-dot {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

@keyframes pulse-red {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
}

@keyframes pulse-orange {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
  50% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
}

@keyframes pulse-green {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
}

@keyframes pulse-blue {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
  50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
}

.popup-body-ultra {
  padding: 24px;
  background: white;
}

.stats-container-ultra {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card-ultra {
  position: relative;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  overflow: hidden;
}

.stat-card-ultra:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon-ultra {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.pin-icon {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.pensioner-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.stat-content-ultra {
  flex: 1;
}

.stat-number-ultra {
  font-size: 32px;
  font-weight: 800;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label-ultra {
  font-size: 14px;
  color: #374151;
  font-weight: 600;
  margin-bottom: 2px;
}

.stat-description {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.stat-accent {
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  border-radius: 0 16px 16px 0;
}

.pin-accent {
  background: linear-gradient(to bottom, #fbbf24, #f59e0b);
}

.pensioner-accent {
  background: linear-gradient(to bottom, #3b82f6, #2563eb);
}

.popup-footer-ultra {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.coordinates-info-ultra {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.coordinates-text {
  font-size: 12px;
  color: #475569;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
}

.density-badge-ultra {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.density-badge-ultra.high {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.density-badge-ultra.medium {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
  border: 1px solid #fcd34d;
}

.density-badge-ultra.low {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #059669;
  border: 1px solid #6ee7b7;
}

.density-badge-ultra.default {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
  border: 1px solid #93c5fd;
}

.density-text {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Leaflet popup container styling */
:deep(.ultra-premium-leaflet-popup .leaflet-popup-content-wrapper) {
  background: transparent;
  border-radius: 20px;
  box-shadow: none;
  padding: 0;
}

:deep(.ultra-premium-leaflet-popup .leaflet-popup-content) {
  margin: 0;
  padding: 0;
  border-radius: 20px;
  overflow: hidden;
}

:deep(.ultra-premium-leaflet-popup .leaflet-popup-tip) {
  background: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

</style>
/* Floating Ask AI Button */
.ask-ai-btn {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 1000;
  background: #2c3e50;
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 12px 24px;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  cursor: pointer;
  transition: background 0.2s;
}
.ask-ai-btn:hover {
  background: #34495e;
}

/* Chatbot Card View */
.chatbot-card {
  position: fixed;
  top: 64px;
  right: 32px;
  width: 340px;
  max-width: 90vw;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  z-index: 1100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.chatbot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #2c3e50;
  color: #fff;
  font-weight: bold;
}
.close-btn {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
}
.chatbot-body {
  padding: 16px;
  min-height: 120px;
}

/* Floating State Info Card */
.floating-state-info-card {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 280px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 1001;
  overflow: hidden;
}

.state-info-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.state-info-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.close-state-info {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}

.close-state-info:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.state-info-content {
  padding: 20px;
}

.state-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}

.top-banks-section {
  margin-top: 16px;
}

.top-banks-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.banks-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bank-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  border-left: 3px solid #667eea;
}

.bank-name {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  flex: 1;
  margin-right: 8px;
}

.bank-count {
  font-size: 12px;
  font-weight: 600;
  color: #667eea;
}

/* Animation for state info card */
.state-info-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.state-info-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.state-info-slide-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.state-info-slide-enter-to {
  opacity: 1;
  transform: translateX(0) scale(1);
}

.state-info-slide-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
}

.state-info-slide-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

/* Dark theme support for floating state info */
[data-theme='dark'] .floating-state-info-card {
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

[data-theme='dark'] .state-stat {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

[data-theme='dark'] .stat-label {
  color: #9ca3af;
}

[data-theme='dark'] .stat-value {
  color: #f9fafb;
}

[data-theme='dark'] .top-banks-section h4 {
  color: #e5e7eb;
}

[data-theme='dark'] .bank-item {
  background: rgba(102, 126, 234, 0.2);
}

[data-theme='dark'] .bank-name {
  color: #d1d5db;
}
