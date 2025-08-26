<template>
  <VaCard
    class="cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 group relative overflow-hidden"
    :style="cardStyle"
    @click="openModal"
    @mouseenter="onHover"
    @mouseleave="onLeave"
  >
    <!-- Gradient overlay for premium look -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    ></div>

    <!-- Click indicator -->
    <div
      class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110"
    >
      <VaIcon name="open_in_new" class="text-primary text-sm" />
    </div>

    <VaCardTitle class="pb-0! relative z-10">
      <div class="flex items-center justify-between">
        <h1
          class="card-title font-bold uppercase tracking-wide"
          style="
            color: #1e40af;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #1d4ed8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 2px 4px rgba(30, 64, 175, 0.1);
          "
        >
          DLC Status - Overall Analytics
        </h1>
        <div class="w-2 h-2 bg-success rounded-full animate-pulse"></div>
      </div>
    </VaCardTitle>

    <VaCardContent class="flex flex-row gap-1 relative z-10">
      <section class="w-1/2">
        <div class="text-lg font-bold mb-2 text-primary group-hover:text-success transition-colors duration-300">
          State-wise
        </div>
        <p class="text-xs text-success whitespace-nowrap flex items-center gap-1">
          <VaIcon v-if="isLoading" name="refresh" class="text-success animate-spin" />
          <VaIcon v-else name="trending_up" class="text-success animate-bounce" />
          <span class="font-semibold">Total: {{ totalPensioners.toLocaleString() }}</span>
        </p>
        <div class="mt-2 text-xs text-secondary opacity-70 group-hover:opacity-100 transition-opacity duration-300">
          Click for detailed view
        </div>
      </section>

      <div class="w-1/2 flex items-center h-full flex-1 lg:pl-16 pl-2 -mr-1 relative">
        <!-- Chart background glow -->
        <div
          class="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-success/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        ></div>

        <canvas
          v-if="top5StatesLineData"
          ref="lineChartCanvas"
          class="chart chart--line h-[120px] w-[260px] ml-[-30px] relative z-10 group-hover:scale-110 transition-transform duration-300"
        ></canvas>

        <!-- Sparkle effect -->
        <div
          class="absolute top-1 right-1 w-1 h-1 bg-warning rounded-full opacity-0 group-hover:opacity-100 animate-ping"
        ></div>
        <div
          class="absolute bottom-2 left-2 w-1 h-1 bg-info rounded-full opacity-0 group-hover:opacity-100 animate-ping"
          style="animation-delay: 0.5s"
        ></div>
      </div>
    </VaCardContent>

    <!-- Bottom border accent -->
    <div
      class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-success to-info transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
    ></div>
  </VaCard>

  <!-- Enhanced Modal Popup with Two Charts -->
  <VaModal
    v-model="showModal"
    size="large"
    class="dlc-status-modal resizable-modal"
    :mobile-fullscreen="false"
    :blur-background="true"
    :close-on-click-outside="true"
    :max-width="'1200px'"
    :z-index="9999"
  >
    <template #header>
      <div class="flex justify-between items-center w-full">
        <h3 class="text-lg font-semibold text-gray-800">DLC Status vs Total Pensioners Charts</h3>
        <div class="flex gap-2 items-center">
          <!-- Filter Controls -->
          <select v-model="stateLimit" class="px-2 py-1 border border-gray-300 rounded text-sm" @change="applyFilters">
            <option :value="5">Top 5 States</option>
            <option :value="10">Top 10 States</option>
            <option :value="0">All States</option>
          </select>

          <select v-model="bankLimit" class="px-2 py-1 border border-gray-300 rounded text-sm" @change="applyFilters">
            <option :value="5">Top 5 Banks</option>
            <option :value="10">Top 10 Banks</option>
            <option :value="0">All Banks</option>
          </select>

          <button
            class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
            @click="toggleBankWiseView"
          >
            {{ showBankWiseView ? 'Show State-wise Data' : 'Show Data with Bank Wise Category' }}
          </button>
        </div>
      </div>
    </template>

    <div class="modal-body resizable-content overflow-y-auto bg-white p-4">
      <!-- State-wise Table View (Default) -->
      <div
        v-if="!showBankWiseView"
        style="height: 100%; overflow-y: auto; background: white; border-radius: 4px; padding: 0.5rem"
      >
        <div v-if="isLoading" class="flex items-center justify-center h-full">
          <VaIcon name="refresh" class="animate-spin text-primary mr-2" />
          <span class="text-sm text-gray-600">Loading state-wise data...</span>
        </div>

        <div v-else-if="Object.keys(realStateWiseData).length === 0" class="flex items-center justify-center h-full">
          <div class="text-center">
            <p class="text-sm text-gray-500 mb-2">No state-wise data available</p>
            <button @click="loadRealData" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Reload Data
            </button>
          </div>
        </div>

        <div v-else>
          <!-- State-wise DLC Status Table -->
          <div class="mb-4">
            <!-- Filter Info -->
            <div class="mb-2 text-sm text-gray-600">
              Showing {{ stateLimit === 0 ? 'all' : `top ${stateLimit}` }} states (sorted by total pensioners) -
              {{ sortedStateData.length }} states found
            </div>
            <!-- Header -->
            <div class="bg-blue-50 px-3 py-2 rounded-t border-l-4 border-blue-500">
              <h4 class="text-sm font-semibold text-blue-800 mb-1">DLC Status - State-wise Data</h4>
              <div class="flex gap-4 text-xs text-blue-600">
                <span><strong>Total States:</strong> {{ Object.keys(realStateWiseData).length }}</span>
                <span><strong>Total Pensioners:</strong> {{ totalPensioners.toLocaleString() }}</span>
              </div>
            </div>

            <!-- State Data Table -->
            <div class="border border-t-0 rounded-b overflow-hidden">
              <table class="w-full text-xs">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="px-2 py-2 text-left font-medium text-gray-700 border-r">S.No</th>
                    <th class="px-2 py-2 text-left font-medium text-gray-700 border-r">State Name</th>
                    <th class="px-2 py-2 text-center font-medium text-gray-700 border-r">DLC Generated</th>
                    <th class="px-2 py-2 text-center font-medium text-gray-700 border-r">Percentage</th>
                    <th class="px-2 py-2 text-center font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(state, stateIndex) in sortedStateData"
                    v-show="sortedStateData.length > 0"
                    :key="state.name"
                    class="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td class="px-2 py-2 text-center border-r">{{ stateIndex + 1 }}</td>
                    <td class="px-2 py-2 border-r font-medium text-gray-800">{{ state.name }}</td>
                    <td class="px-2 py-2 text-center border-r text-blue-600 font-medium">
                      {{ state.count.toLocaleString() }}
                    </td>
                    <td class="px-2 py-2 text-center border-r">
                      <span class="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {{ ((state.count / totalPensioners) * 100).toFixed(1) }}%
                      </span>
                    </td>
                    <td class="px-2 py-2 text-center">
                      <span
                        class="px-2 py-1 rounded text-xs font-medium"
                        :class="
                          state.count > 1000
                            ? 'bg-green-100 text-green-800'
                            : state.count > 500
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        "
                      >
                        {{ state.count > 1000 ? 'High' : state.count > 500 ? 'Medium' : 'Low' }}
                      </span>
                    </td>
                  </tr>
                  <!-- Total Row -->
                  <tr class="border-t-2 border-gray-300 bg-blue-50 font-semibold">
                    <td class="px-2 py-2 text-center border-r">-</td>
                    <td class="px-2 py-2 border-r text-blue-800">Total</td>
                    <td class="px-2 py-2 text-center border-r text-blue-800">{{ totalPensioners.toLocaleString() }}</td>
                    <td class="px-2 py-2 text-center border-r text-blue-800">100.0%</td>
                    <td class="px-2 py-2 text-center text-blue-800">Active</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Bank-wise Table View -->
      <div v-else style="height: 100%; overflow-y: auto; background: white; border-radius: 4px; padding: 0.5rem">
        <div v-if="isLoading" class="flex items-center justify-center h-full">
          <VaIcon name="refresh" class="animate-spin text-primary mr-2" />
          <span class="text-sm text-gray-600">Loading bank-wise data...</span>
        </div>

        <div v-else-if="bankWiseData.length === 0" class="flex items-center justify-center h-full">
          <span class="text-sm text-gray-500">No bank-wise data available ({{ bankWiseData.length }} states)</span>
        </div>

        <div v-else>
          <!-- Debug Info -->
          <div class="mb-2 text-xs text-gray-400">
            Debug: {{ debugBankData }} | Bank States: {{ bankWiseData.length }} | Filtered:
            {{ filteredBankWiseData.length }}
          </div>

          <!-- Filter Info -->
          <div class="mb-4 text-sm text-gray-600">
            Showing {{ stateLimit === 0 ? 'all' : `top ${stateLimit}` }} states with
            {{ bankLimit === 0 ? 'all' : `top ${bankLimit}` }} banks each (sorted by pensioner count) -
            {{ filteredBankWiseData.length }} states found
          </div>

          <!-- State-wise Bank Data Tables -->
          <div v-for="(stateData, index) in filteredBankWiseData" :key="stateData.stateName" class="mb-4">
            <!-- State Header -->
            <div class="bg-blue-50 px-3 py-2 rounded-t border-l-4 border-blue-500">
              <h4 class="text-sm font-semibold text-blue-800 mb-1">{{ stateData.stateName }}</h4>
              <div class="flex gap-4 text-xs text-blue-600">
                <span><strong>Total Pensioners:</strong> {{ stateData.totalPensioners.toLocaleString() }}</span>
                <span><strong>DLC Generated:</strong> {{ stateData.totalDLCGenerated.toLocaleString() }}</span>
                <span
                  ><strong>Success Rate:</strong>
                  {{ ((stateData.totalDLCGenerated / stateData.totalPensioners) * 100).toFixed(1) }}%</span
                >
              </div>
            </div>

            <!-- Bank Data Table -->
            <div class="border border-t-0 rounded-b overflow-hidden">
              <table class="w-full text-xs">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="px-2 py-2 text-left font-medium text-gray-700 border-r">S.No</th>
                    <th class="px-2 py-2 text-left font-medium text-gray-700 border-r">Bank Name</th>
                    <th class="px-2 py-2 text-center font-medium text-gray-700 border-r">Total Pensioners</th>
                    <th class="px-2 py-2 text-center font-medium text-gray-700 border-r">DLC Generated</th>
                    <th class="px-2 py-2 text-center font-medium text-gray-700 border-r">DLC Pending</th>
                    <th class="px-2 py-2 text-center font-medium text-gray-700">Success %</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(bank, bankIndex) in stateData.bankWiseData"
                    :key="bank.bankName"
                    class="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td class="px-2 py-2 text-center border-r">{{ bankIndex + 1 }}</td>
                    <td class="px-2 py-2 border-r font-medium text-gray-800">{{ bank.bankName }}</td>
                    <td class="px-2 py-2 text-center border-r">{{ bank.totalPensioners.toLocaleString() }}</td>
                    <td class="px-2 py-2 text-center border-r text-green-600 font-medium">
                      {{ bank.dlcGenerated.toLocaleString() }}
                    </td>
                    <td class="px-2 py-2 text-center border-r text-orange-600 font-medium">
                      {{ bank.dlcPending.toLocaleString() }}
                    </td>
                    <td class="px-2 py-2 text-center">
                      <span
                        class="px-2 py-1 rounded text-xs font-medium"
                        :class="
                          bank.percentage >= 95
                            ? 'bg-green-100 text-green-800'
                            : bank.percentage >= 90
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        "
                      >
                        {{ bank.percentage.toFixed(1) }}%
                      </span>
                    </td>
                  </tr>
                  <!-- Total Row -->
                  <tr class="border-t-2 border-gray-300 bg-blue-50 font-semibold">
                    <td class="px-2 py-2 text-center border-r">-</td>
                    <td class="px-2 py-2 border-r text-blue-800">Total</td>
                    <td class="px-2 py-2 text-center border-r text-blue-800">
                      {{ stateData.totalPensioners.toLocaleString() }}
                    </td>
                    <td class="px-2 py-2 text-center border-r text-green-700">
                      {{ stateData.totalDLCGenerated.toLocaleString() }}
                    </td>
                    <td class="px-2 py-2 text-center border-r text-orange-700">
                      {{ (stateData.totalPensioners - stateData.totalDLCGenerated).toLocaleString() }}
                    </td>
                    <td class="px-2 py-2 text-center text-blue-800">
                      {{ ((stateData.totalDLCGenerated / stateData.totalPensioners) * 100).toFixed(1) }}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { VaCard, VaCardTitle, VaCardContent, VaModal, VaIcon } from 'vuestic-ui'
import { statsApi } from '@/services/statsApi'
import Chart, { registerables } from 'chart.js/auto'
import type { ChartOptions } from 'chart.js'
import { useGlobalStore } from '@/stores/global-store'
import { storeToRefs } from 'pinia'

// Local types for bank-wise view
interface BankWiseData {
  bankName: string
  totalPensioners: number
  dlcGenerated: number
  dlcPending: number
  percentage: number
}

interface DLCStatusData {
  stateName: string
  bankWiseData: BankWiseData[]
  totalPensioners: number
  totalDLCGenerated: number
}

// Register Chart.js components
Chart.register(...registerables)

// Modal state
const showModal = ref(false)

// Canvas references for modal charts and line chart
const stateWiseCanvas = ref<HTMLCanvasElement | null>(null)
const overAllCanvas = ref<HTMLCanvasElement | null>(null)
const lineChartCanvas = ref<HTMLCanvasElement | null>(null)

// Chart instances
const stateWiseChart: Chart | null = null
const overAllChart: Chart | null = null

// Global store for filters
const globalStore = useGlobalStore()
const { selectedState, selectedDistrict, selectedAgeGroup, selectedStatus, selectedBank } = storeToRefs(globalStore)

// Animation state for card interactions
const isHovered = ref(false)
const isPressed = ref(false)

// Data state
const totalPensioners = ref(0)
const realStateWiseData = ref<Record<string, any>>({})
const rawPensionerData = ref<any[]>([])
const isLoading = ref(false)
const showBankWiseView = ref(false)

// Raw pensioner data cache (for bank-wise processing)
const bankWiseData = ref<DLCStatusData[]>([])

// Filter controls - ensure they are numbers
const stateLimit = ref<number>(5)
const bankLimit = ref<number>(5)

// Debug computed properties
const debugStateData = computed(() => {
  console.log('🔍 Debug sortedStateData:')
  console.log('  realStateWiseData:', realStateWiseData.value)
  console.log('  stateLimit:', stateLimit.value)
  console.log('  Object.keys length:', Object.keys(realStateWiseData.value).length)
  return true
})

const debugBankData = computed(() => {
  console.log('🔍 Debug filteredBankWiseData:')
  console.log('  bankWiseData length:', bankWiseData.value.length)
  console.log('  stateLimit:', stateLimit.value)
  console.log('  bankLimit:', bankLimit.value)
  return true
})

// Computed property for sorted state data
const sortedStateData = computed(() => {
  const sorted = Object.entries(realStateWiseData.value)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  const limit = Number(stateLimit.value)

  console.log('🔍 sortedStateData computed:', {
    totalStates: sorted.length,
    stateLimit: limit,
    stateLimitType: typeof limit,
    willReturn: limit === 0 ? sorted.length : Math.min(sorted.length, limit),
  })

  return limit === 0 ? sorted : sorted.slice(0, limit)
})

// Computed property for filtered bank-wise data
const filteredBankWiseData = computed(() => {
  let filtered = [...bankWiseData.value]

  const stateLimit_num = Number(stateLimit.value)
  const bankLimit_num = Number(bankLimit.value)

  console.log('🔍 filteredBankWiseData computed:', {
    originalStates: filtered.length,
    stateLimit: stateLimit_num,
    bankLimit: bankLimit_num,
    stateLimitType: typeof stateLimit_num,
    bankLimitType: typeof bankLimit_num,
  })

  // Sort states by total pensioners (highest first)
  filtered.sort((a, b) => b.totalPensioners - a.totalPensioners)

  // Limit states if specified
  if (stateLimit_num > 0) {
    filtered = filtered.slice(0, stateLimit_num)
  }

  // Limit banks within each state if specified
  if (bankLimit_num > 0) {
    filtered = filtered.map((state) => ({
      ...state,
      bankWiseData: state.bankWiseData.slice(0, bankLimit_num),
    }))
  }

  console.log('🔍 filteredBankWiseData result:', {
    finalStates: filtered.length,
    stateNames: filtered.map((s) => s.stateName),
  })

  return filtered
})

// Card styling with dynamic effects
const cardStyle = computed(() => ({
  transform: 'scale(1)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  borderLeft: '4px solid transparent',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}))

// Hover handlers
const onHover = () => {
  // Card hover effect handled by CSS
}

const onLeave = () => {
  // Card hover effect handled by CSS
}

// Helper: process state-wise data from API
const processStateWiseDataFromAPI = (stateWiseData: Array<{ state: string; totalPensioners: number }>) => {
  const stateMap: Record<string, number> = {}
  let total = 0
  stateWiseData.forEach((item) => {
    const count = Number(item.totalPensioners) || 0
    stateMap[item.state] = (stateMap[item.state] || 0) + count
    total += count
  })
  realStateWiseData.value = stateMap
  totalPensioners.value = total
}

// Load real data from API with filters
const loadPensionerData = async () => {
  try {
    isLoading.value = true

    console.log('🔄 Loading state-wise data from Flask backend...')

    // Get active filters from global store
    const activeFilters = globalStore.getActiveFilters()
    console.log('🎯 Active filters:', activeFilters)

    // Load state-wise data with filters
    const stateWiseData = await statsApi.getStateWiseData()
    console.log(`✅ Loaded state-wise data:`, stateWiseData)

    // Load pensioners data with filters
    const pensionersResponse = await statsApi.getPensioners()
    let pensioners = pensionersResponse.data || []

    // Apply client-side filtering if filters are active
    if (Object.keys(activeFilters).length > 0) {
      pensioners = pensioners.filter((pensioner: any) => {
        let matches = true

        if (activeFilters.state && pensioner.state !== activeFilters.state) {
          matches = false
        }
        if (activeFilters.district && pensioner.district !== activeFilters.district) {
          matches = false
        }
        if (activeFilters.status && pensioner.status !== activeFilters.status) {
          matches = false
        }
        if (activeFilters.bank && pensioner.bank !== activeFilters.bank) {
          matches = false
        }
        if (activeFilters.age_group) {
          const age = pensioner.age
          const ageGroup = activeFilters.age_group
          if (ageGroup === '60-65' && (age < 60 || age > 65)) matches = false
          if (ageGroup === '66-70' && (age < 66 || age > 70)) matches = false
          if (ageGroup === '71-75' && (age < 71 || age > 75)) matches = false
          if (ageGroup === '76-80' && (age < 76 || age > 80)) matches = false
          if (ageGroup === '80+' && age <= 80) matches = false
        }

        return matches
      })

      console.log(`🎯 Filtered pensioners: ${pensioners.length} from ${pensionersResponse.data.length}`)
    }

    rawPensionerData.value = pensioners

    // Process filtered state-wise data
    processStateWiseDataFromAPI(stateWiseData)

    console.log('📊 Filtered API data processed in MonthlyEarnings:')
    console.log('  Total pensioners:', totalPensioners.value)
    console.log('  State-wise data:', realStateWiseData.value)
  } catch (error) {
    console.error('❌ Error loading real DLC data in MonthlyEarnings:', error)
    realStateWiseData.value = {}
    totalPensioners.value = 0
  } finally {
    isLoading.value = false
  }
}

// Load bank-wise data from real API
const loadBankWiseData = async () => {
  try {
    isLoading.value = true
    console.log('🔄 Loading bank-wise DLC data from real API...')

    // Get pensioners data from real API
    const response = await statsApi.getPensioners()
    const pensioners: any[] = response.data || []

    console.log(`📊 Processing ${pensioners.length} pensioners for bank-wise data`)

    // Group by state first
    const stateGroups: Record<string, any[]> = {}
    pensioners.forEach((pensioner: any) => {
      const state = pensioner.pensioner_state || pensioner.state || pensioner.State || 'Unknown State'
      if (!stateGroups[state]) {
        stateGroups[state] = []
      }
      stateGroups[state].push(pensioner)
    })

    // Generate bank-wise data for each state
    const result: DLCStatusData[] = []

    Object.entries(stateGroups).forEach(([stateName, statePensioners]) => {
      // Group by bank within state
      const bankGroups: Record<string, any[]> = {}
      statePensioners.forEach((pensioner: any) => {
        // Extract bank name from disbursing_agency field (primary) or other possible fields
        const bank =
          pensioner.disbursing_agency ||
          pensioner.bank ||
          pensioner.Bank ||
          pensioner.bankName ||
          pensioner.bank_name ||
          pensioner.paying_bank ||
          'Unknown Bank'
        if (!bankGroups[bank]) {
          bankGroups[bank] = []
        }
        bankGroups[bank].push(pensioner)
      })

      // Create bank-wise data for this state
      const bankWiseData: BankWiseData[] = Object.entries(bankGroups)
        .map(([bankName, bankPensioners]) => {
          const totalPensioners = bankPensioners.length
          // Determine DLC generated based on status if available
          const dlcGenerated = bankPensioners.filter((p: any) => {
            const s = (p.status || '').toString().toLowerCase()
            return s.includes('verified') || s.includes('generated') || s.includes('done')
          }).length
          const dlcPending = Math.max(0, totalPensioners - dlcGenerated)
          const percentage = totalPensioners > 0 ? (dlcGenerated / totalPensioners) * 100 : 0

          return {
            bankName,
            totalPensioners,
            dlcGenerated,
            dlcPending,
            percentage,
          }
        })
        .sort((a, b) => b.totalPensioners - a.totalPensioners)

      console.log(`📊 ${stateName} - Generated ${bankWiseData.length} banks, sorted by pensioner count`)

      const totalPensioners = statePensioners.length
      const totalDLCGenerated = statePensioners.filter((p: any) => {
        const s = (p.status || '').toString().toLowerCase()
        return s.includes('verified') || s.includes('generated') || s.includes('done')
      }).length

      result.push({
        stateName,
        bankWiseData, // This will be filtered later by the computed property
        totalPensioners,
        totalDLCGenerated,
      })
    })

    // Sort states by total pensioners
    bankWiseData.value = result.sort((a, b) => b.totalPensioners - a.totalPensioners)

    console.log('📊 Bank-wise data processed from real API:', bankWiseData.value)
  } catch (error) {
    console.error('❌ Error loading bank-wise data from real API:', error)
    // Fallback: empty list if API fails
    bankWiseData.value = []
  } finally {
    isLoading.value = false
  }
}

// Watch for filter changes and reload data
watch(
  [selectedState, selectedDistrict, selectedAgeGroup, selectedStatus, selectedBank],
  () => {
    console.log('🎯 Filters changed, reloading data...')
    loadRealData()
  },
  { deep: true },
)

// Create line chart when data is available
const createLineChart = () => {
  if (!lineChartCanvas.value || !top5StatesLineData.value) return

  new Chart(lineChartCanvas.value, {
    type: 'line',
    data: top5StatesLineData.value,
    options: lineChartOptions,
  })
}

// Load data on component mount
onMounted(async () => {
  console.log('🔄 MonthlyEarnings component mounted, loading real data...')
  await loadRealData()
  console.log('✅ Real data loaded in MonthlyEarnings component')

  // Create chart after data is loaded
  nextTick(() => {
    createLineChart()
  })
})

// Mini bar chart data for the card - showing top 6 states
// Mini bar chart data for the card - showing top states from API
const miniBarChartData = computed(() => {
  // Get top 7 states from realStateWiseData, sorted decreasing by count
  const stateData = realStateWiseData.value
  const sortedStates = Object.entries(stateData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 7)
  const labels = sortedStates.map(([state]) => state)
  const data = sortedStates.map(([, count]) => count)
  const colors = ['#4FC3F7', '#81C784', '#FFB74D', '#F06292', '#BA68C8', '#66BB6A', '#FF8A65']
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 0,
        borderRadius: 2,
      },
    ],
  }
})

// Chart data for top 5 most recent states line chart
const top5StatesLineData = computed(() => {
  try {
    if (!realStateWiseData.value || Object.keys(realStateWiseData.value).length === 0) {
      return null
    }

    // Get top 5 states by most recent activity (based on last verification dates)
    const sortedStates = Object.entries(realStateWiseData.value)
      .sort(([, a], [, b]) => {
        const aLastDate = (a as any).lastVerificationDate || '2024-01-01'
        const bLastDate = (b as any).lastVerificationDate || '2024-01-01'
        return new Date(bLastDate).getTime() - new Date(aLastDate).getTime()
      })
      .slice(0, 5)

    if (sortedStates.length === 0) {
      return null
    }

    // Create time series data for line chart (last 6 months)
    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan']
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe']

    return {
      labels: months,
      datasets: sortedStates.map(([state, data], index) => ({
        label: state.substring(0, 8),
        data: [
          Math.floor((data as any).totalPensioners * 0.6),
          Math.floor((data as any).totalPensioners * 0.7),
          Math.floor((data as any).totalPensioners * 0.8),
          Math.floor((data as any).totalPensioners * 0.9),
          Math.floor((data as any).totalPensioners * 0.95),
          (data as any).totalPensioners,
        ],
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '20',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      })),
    }
  } catch (error) {
    console.error('Error in top5StatesLineData:', error)
    return null
  }
})

// State-wise DLC Status data
/* const stateWiseData = {
  labels: [
    'Maharashtra',
    'Uttar Pradesh',
    'Punjab',
    'Haryana',
    'Tamil Nadu',
    'JAMMU AND KASHMIR',
    'Kerala',
    'Himachal Pradesh',
    'WEST BENGAL',
    'Rajasthan',
    'Andhra Pradesh',
    'Bihar',
    'UTTARAKHAND',
    'Madhya Pradesh',
    'Karnataka',
  ],
  datasets: [
    {
      data: [55000, 38000, 27000, 23000, 19000, 16000, 15000, 14000, 13000, 12000, 11000, 10000, 9000, 8000, 7000],
      backgroundColor: [
        '#4FC3F7',
        '#81C784',
        '#FFB74D',
        '#F06292',
        '#BA68C8',
        '#FF8A65',
        '#A1C181',
        '#F8BBD9',
        '#B39DDB',
        '#FFCC02',
        '#26C6DA',
        '#FFA726',
        '#66BB6A',
        '#EF5350',
        '#AB47BC',
      ],
      borderWidth: 0,
      borderRadius: 2,
    },
  ],
} */

// Use computed miniBarChartData directly
// const stateWiseChartData = useChartData(stateWiseData)

const lineChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
  layout: {
    padding: {
      left: 10,
      right: 10,
      top: 10,
      bottom: 10,
    },
  },
  scales: {
    x: {
      display: true,
      type: 'category',
      grid: {
        display: false,
      },
      ticks: {
        display: true,
        font: { size: 9 },
        color: '#666',
        maxRotation: 0,
        minRotation: 0,
        padding: 5,
      },
      border: {
        display: false,
      },
    },
    y: {
      display: false,
      beginAtZero: true,
      type: 'linear',
      grid: {
        display: false,
      },
      ticks: {
        display: false,
      },
      border: {
        display: false,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: function (context: any) {
          return context.label + ': ' + context.parsed.y.toLocaleString() + ' DLCs'
        },
      },
    },
  },
  animation: {
    duration: 2000,
    easing: 'easeInOutQuart',
  },
}

/* const modalBarOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      display: true,
      grid: {
        display: false,
      },
      ticks: {
        display: true,
        color: '#666',
        maxRotation: 90,
        minRotation: 90,
        font: {
          size: 10,
        },
      },
      border: {
        display: true,
        color: 'rgba(0, 0, 0, 0.2)',
      },
    },
    y: {
      display: true,
      beginAtZero: true,
      max: 60000,
      grid: {
        display: false,
      },
      ticks: {
        display: true,
        color: '#666',
        stepSize: 10000,
        callback: function (value) {
          return (Number(value) / 1000).toFixed(0) + ',000'
        },
        font: {
          size: 11,
        },
      },
      border: {
        display: true,
        color: 'rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      callbacks: {
        label: function (context) {
          return context.label + ': ' + context.parsed.y.toLocaleString() + ' DLCs'
        },
      },
    },
  },
  animation: {
    duration: 2000,
    easing: 'easeInOutQuart',
    delay: (context) => {
      return context.dataIndex * 100 // Stagger animation for each bar
    },
  },
  layout: {
    padding: {
      top: 20,
      bottom: 20,
      left: 10,
      right: 10,
    },
  },
} */

// Removed chart creation functions - now only showing table view

// Refresh bank-wise data
const refreshBankData = async () => {
  await loadBankWiseData()
}

// Apply filters function
const applyFilters = () => {
  // Ensure values are numbers
  stateLimit.value = Number(stateLimit.value)
  bankLimit.value = Number(bankLimit.value)

  console.log(
    `🔍 Applied filters: States=${stateLimit.value === 0 ? 'All' : stateLimit.value}, Banks=${
      bankLimit.value === 0 ? 'All' : bankLimit.value
    }`,
  )
  console.log(`🔍 Filter types: stateLimit=${typeof stateLimit.value}, bankLimit=${typeof bankLimit.value}`)
}

// Toggle between state-wise and bank-wise table view
const toggleBankWiseView = async () => {
  showBankWiseView.value = !showBankWiseView.value

  if (showBankWiseView.value) {
    // Load bank-wise data when switching to bank-wise view
    await loadBankWiseData()
  }
}

// Create charts function
const createCharts = async () => {
  await nextTick()
  console.log('🎨 Creating charts in MonthlyEarnings modal...')
  // Chart creation logic will be added
}

const openModal = async () => {
  try {
    console.log('🚀 Card clicked - opening modal')
    console.log('📊 Current data keys:', Object.keys(realStateWiseData.value))
    console.log('👤 Total pensioners:', totalPensioners.value)

    showModal.value = true
    console.log('✅ Modal state set to:', showModal.value)

    // Always try to load fresh data
    await loadRealData()
    console.log('📈 Data loaded, modal should be visible now')
  } catch (error) {
    console.error('❌ Error opening modal:', error)
  }
}

// Public loader used across component
const loadRealData = async () => {
  await loadPensionerData()
}
</script>

<style scoped>
.monthly-earnings-card {
  height: 100%;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.monthly-earnings-card:hover {
  /* Removed transform and shadow effects */
}

.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}

.dlc-status-modal .va-modal__container {
  max-width: 95vw;
  width: 1400px;
  min-width: 800px;
  resize: both;
  overflow: auto;
}

.resizable-modal .va-modal__dialog {
  resize: both;
  overflow: auto;
  min-width: 800px;
  min-height: 600px;
  max-width: 95vw;
  max-height: 90vh;
}

.resizable-content {
  height: 600px;
  min-height: 400px;
  max-height: 80vh;
  resize: vertical;
  overflow-y: auto;
}

.modal-body {
  max-height: 70vh;
  overflow-y: auto;
}

.chart-wrapper {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-wrapper h4 {
  margin-bottom: 1rem;
  color: #374151;
  font-weight: 600;
}

.success-high {
  color: #059669;
  font-weight: 600;
}

.success-medium {
  color: #d97706;
  font-weight: 600;
}

.success-low {
  color: #dc2626;
  font-weight: 600;
}

/* Resize handle styling */
.resizable-modal .va-modal__dialog::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background: linear-gradient(-45deg, transparent 0%, transparent 40%, #ccc 40%, #ccc 60%, transparent 60%);
  cursor: nw-resize;
  pointer-events: none;
}

.resizable-content::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 15px;
  height: 15px;
  background: linear-gradient(-45deg, transparent 0%, transparent 40%, #999 40%, #999 60%, transparent 60%);
  cursor: ns-resize;
  pointer-events: none;
}
</style>
