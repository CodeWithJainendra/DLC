<script lang="ts" setup>
import RevenueByLocationMap from './cards/RevenueByLocationMap.vue'
import DataSection from './DataSection.vue'
import YearlyBreakup from './cards/YearlyBreakup.vue'
import MonthlyEarnings from './cards/MonthlyEarnings.vue'
import AuthenticationMethods from './cards/AuthenticationMethods.vue'

import { ref, watch } from 'vue'
import { useGlobalStore } from '@/stores/global-store'
import { storeToRefs } from 'pinia'
// import { useDark } from 'vuestic-ui' // Incorrect import, removed
// If you want dark mode detection, use useColors from vuestic-ui or use a custom solution
// Chatbot message state
interface ChatMessage {
  text: string
  from: 'user' | 'bot'
}
const chatMessages = ref<ChatMessage[]>([])
const chatInput = ref('')

function sendMessage() {
  const text = chatInput.value.trim()
  if (!text) return
  chatMessages.value.push({ text, from: 'user' })
  chatInput.value = ''
  // Optionally, scroll to bottom
  setTimeout(() => {
    const el = document.getElementById('chat-messages')
    if (el) el.scrollTop = el.scrollHeight
  }, 50)
}

const showChatbot = ref(false)
// const isDark = useDark() // Removed due to incorrect import
// Simple fallback for dark mode (replace with your own logic or Vuestic composable)
const isDark = ref(false)

// Filter functionality
const globalStore = useGlobalStore()
const { showFilterPanel, selectedStateInfo } = storeToRefs(globalStore)

// Track if we're in district view to hide state info card
const isDistrictView = ref(false)

// Watch for changes in selectedStateInfo to determine view state
watch(
  selectedStateInfo,
  (newValue) => {
    // If selectedStateInfo is cleared, we're likely in district view
    if (!newValue) {
      isDistrictView.value = true
    } else {
      isDistrictView.value = false
    }
  },
  { immediate: true },
)
const filterOptions = ref({
  chooseDate: '',
  verificationMode: '',
  department: '',
  typeOfPensioner: '',
  disbursingAuthority: '',
})

function applyFilters() {
  console.log('Applying filters:', filterOptions.value)
  // API integration logic will go here
  const { toggleFilterPanel } = useGlobalStore()
  toggleFilterPanel()
}

function clearFilters() {
  filterOptions.value = {
    chooseDate: '',
    verificationMode: '',
    department: '',
    typeOfPensioner: '',
    disbursingAuthority: '',
  }
}
</script>

<template>
  <section class="flex flex-col">
    <!-- Filter Panel -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 transform -translate-y-4 scale-95"
      enter-to-class="opacity-100 transform translate-y-0 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 transform translate-y-0 scale-100"
      leave-to-class="opacity-0 transform -translate-y-4 scale-95"
    >
      <div
        v-if="showFilterPanel"
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 mb-3 z-10 transform-gpu"
      >
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
          <!-- Choose Date -->
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">CHOOSE DATE</label>
            <input
              v-model="filterOptions.chooseDate"
              type="date"
              class="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <!-- Verification Mode -->
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">VERIFICATION MODE</label>
            <select
              v-model="filterOptions.verificationMode"
              class="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Modes</option>
              <option value="face">Face Verification</option>
              <option value="digital">Digital LC</option>
              <option value="video">Video LC</option>
              <option value="manual">Manual LC</option>
            </select>
          </div>

          <!-- Department -->
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">DEPARTMENT</label>
            <select
              v-model="filterOptions.department"
              class="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Departments</option>
              <option value="defence">Defence</option>
              <option value="railways">Railways</option>
              <option value="civil">Civil</option>
              <option value="post">Post</option>
              <option value="telecom">Telecom</option>
            </select>
          </div>

          <!-- Type of Pensioner -->
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">TYPE OF PENSIONER</label>
            <select
              v-model="filterOptions.typeOfPensioner"
              class="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Types</option>
              <option value="central">Central</option>
              <option value="state">State</option>
              <option value="epfo">EPFO</option>
              <option value="others">Others</option>
            </select>
          </div>

          <!-- Disbursing Authority -->
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">DISBURSING AUTHORITY</label>
            <select
              v-model="filterOptions.disbursingAuthority"
              class="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Authorities</option>
              <option value="bank">Bank</option>
              <option value="post_office">Post Office</option>
              <option value="epfo">EPFO</option>
              <option value="treasury">Treasury</option>
            </select>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2 mt-3">
          <button
            class="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            @click="clearFilters"
          >
            Clear
          </button>
          <button
            class="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
            @click="applyFilters"
          >
            <VaIcon name="check" size="14px" />
            Apply Filters
          </button>
        </div>
      </div>
    </Transition>

    <!-- Top Stats and DLC Status Section -->
    <div class="flex flex-col sm:flex-row gap-2 relative z-10">
      <DataSection class="w-full sm:w-[70%]" />
      <div class="flex flex-col gap-2 w-full sm:w-[30%]">
        <YearlyBreakup />
        <MonthlyEarnings />
        <AuthenticationMethods />
      </div>
    </div>

    <!-- Map Section - Moved up for better positioning -->
    <div class="flex flex-col sm:flex-row gap-2 -mt-[21.9rem] mb-0 relative z-20">
      <RevenueByLocationMap class="w-full sm:w-[69%]" />

      <!-- Floating State Info Card - Outside map, positioned on dashboard -->
      <Transition name="state-info-slide">
        <div v-if="selectedStateInfo && !isDistrictView" class="dashboard-floating-state-card">
          <div class="state-info-header">
            <h3>{{ selectedStateInfo.name }}</h3>
            <button class="close-state-info" @click="globalStore.clearSelectedStateInfo()">
              <VaIcon name="close" size="16px" />
            </button>
          </div>
          <div class="state-info-content">
            <div class="state-stat">
              <span class="stat-label">Total Pensioners:</span>
              <span class="stat-value">{{ selectedStateInfo.totalPensioners?.toLocaleString() || 0 }}</span>
            </div>
            <div class="state-stat">
              <span class="stat-label">Banks:</span>
              <span class="stat-value">{{ selectedStateInfo.totalBanks || 0 }}</span>
            </div>
            <div class="state-stat">
              <span class="stat-label">Districts:</span>
              <span class="stat-value">{{ selectedStateInfo.districts?.length || 0 }}</span>
            </div>
            <div class="top-banks-section">
              <h4>Top Banks:</h4>
              <div class="banks-list">
                <div v-for="bank in (selectedStateInfo.topBanks || []).slice(0, 3)" :key="bank.name" class="bank-item">
                  <span class="bank-name">{{ bank.name }}</span>
                  <span class="bank-count">({{ bank.count }})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </section>
  <!-- Floating Ask AI Button (fixed to bottom right) -->
  <button
    v-if="!showChatbot"
    class="fixed bottom-6 right-6 z-50 bg-white text-blue-600 border border-blue-200 rounded-full shadow-lg px-5 py-3 flex items-center gap-2 hover:bg-blue-50 transition-all ask-ai-float"
    style="font-weight: 600; font-size: 1rem"
    aria-label="Ask AI Chatbot"
    @click="showChatbot = true"
  >
    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 mr-2">
      <span class="ai-logo flex items-center justify-center w-7 h-7 rounded-full bg-blue-100">
        <img src="/ai-logo-purple.png" alt="AI Logo" class="w-6 h-6 rounded-full object-cover" />
      </span>
    </span>
    Ask AI
  </button>
  <!-- Chatbot Popup Cardview -->
  <Transition name="ask-ai-popup">
    <div
      v-if="showChatbot"
      :class="[
        'fixed bottom-24 right-6 z-50 rounded-xl shadow-lg p-0 w-[28rem] h-[32rem] flex flex-col chatbot-popup border border-blue-100',
        isDark ? 'bg-gray-900' : 'bg-white',
      ]"
      style="overflow: hidden"
    >
      <div
        :class="[
          'flex items-center justify-between px-5 py-3',
          isDark ? 'bg-gray-900 text-white' : 'bg-blue-600 text-white',
        ]"
      >
        <div class="flex items-center gap-2">
          <img
            src="/ai-logo-purple.png"
            alt="AI Logo"
            class="ask-ai-avatar"
            style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; margin-right: 10px"
          />
          <span class="font-semibold">Virtual Assistant</span>
        </div>
        <button class="text-white text-xl" @click="showChatbot = false">×</button>
      </div>
      <div
        :class="[
          'flex-1 px-5 py-4 flex flex-col justify-between',
          isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900',
        ]"
        style="min-height: 220px"
      >
        <div
          :class="[
            'chatbot-message-bubble rounded-lg px-4 py-2 mb-2 w-fit max-w-[80%] shadow-sm',
            isDark ? 'bg-gray-800 text-white' : 'bg-blue-50 text-blue-900',
          ]"
        >
          👋 Welcome! I'm your Virtual Assistant.<br />
          Ask me anything or let me know how I can help you today.
        </div>
        <div id="chat-messages" class="mb-3 flex flex-col gap-2 flex-1">
          <!-- Chat messages will appear here dynamically -->
          <div
            v-for="(message, index) in chatMessages"
            :key="index"
            class="flex"
            :class="{ 'justify-end': message.from === 'user', 'justify-start': message.from !== 'user' }"
          >
            <div
              v-if="message.from === 'user'"
              :class="[
                'rounded-lg px-4 py-2 mb-2 max-w-[80%] shadow-sm user-message',
                isDark ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white',
              ]"
            >
              {{ message.text }}
            </div>
            <div
              v-else
              :class="[
                'rounded-lg px-4 py-2 mb-2 max-w-[80%] shadow-sm bot-message',
                isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900',
              ]"
            >
              {{ message.text }}
            </div>
          </div>
        </div>
        <div class="mt-4">
          <div class="relative flex items-center">
            <textarea
              v-model="chatInput"
              rows="1"
              :class="[
                'w-full border rounded-lg px-3 py-2 pr-12 resize-none focus:outline-none focus:ring-2',
                isDark
                  ? 'bg-gray-900 text-white border-gray-700 focus:ring-blue-400'
                  : 'border-blue-200 focus:ring-blue-400 bg-white text-gray-900',
              ]"
              placeholder="Write a question..."
              style="min-height: 40px; max-height: 120px; overflow-y: auto"
              oninput="this.style.height = '40px'; this.style.height = (this.scrollHeight)+'px';"
            ></textarea>
            <button
              :class="[
                'absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 shadow transition-all',
                isDark ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700',
              ]"
              aria-label="Send message"
              @click="sendMessage"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                width="20"
                height="20"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
<style>
.ask-ai-popup-enter-active,
.ask-ai-popup-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.ask-ai-popup-enter-from {
  opacity: 0;
  transform: translateY(40px) scale(0.95);
}
.ask-ai-popup-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.ask-ai-popup-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.ask-ai-popup-leave-to {
  opacity: 0;
  transform: translateY(40px) scale(0.95);
}

/* Dashboard Floating State Info Card */
.dashboard-floating-state-card {
  position: absolute;
  top: 0;
  right: -300px;
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

/* Animation for dashboard state info card */
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

/* Dark theme support */
[data-theme='dark'] .dashboard-floating-state-card {
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
</style>
