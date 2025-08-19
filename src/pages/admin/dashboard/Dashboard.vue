<script lang="ts" setup>

import RevenueByLocationMap from './cards/RevenueByLocationMap.vue'
import DataSection from './DataSection.vue'
import YearlyBreakup from './cards/YearlyBreakup.vue'
import MonthlyEarnings from './cards/MonthlyEarnings.vue'
import AuthenticationMethods from './cards/AuthenticationMethods.vue'

import { ref } from 'vue'
// import { useDark } from 'vuestic-ui' // Incorrect import, removed
// If you want dark mode detection, use useColors from vuestic-ui or use a custom solution
// Chatbot message state
interface ChatMessage {
  text: string;
  from: 'user' | 'bot';
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

</script>

<template>
  <section class="flex flex-col">
    <!-- Top Stats and DLC Status Section -->
    <div class="flex flex-col sm:flex-row gap-2">
      <DataSection class="w-full sm:w-[70%]" />
      <div class="flex flex-col gap-2 w-full sm:w-[30%]">
        <YearlyBreakup />
        <MonthlyEarnings />
        <AuthenticationMethods />
      </div>
    </div>

    <!-- Map Section - Moved up for better positioning -->
    <div class="flex flex-col sm:flex-row gap-2 -mt-[40.1rem] mb-0">
      <RevenueByLocationMap class="w-full sm:w-[69%]" />
    </div>


  </section>
  <!-- Floating Ask AI Button (fixed to bottom right) -->
  <button
    v-if="!showChatbot"
    class="fixed bottom-6 right-6 z-50 bg-white text-blue-600 border border-blue-200 rounded-full shadow-lg px-5 py-3 flex items-center gap-2 hover:bg-blue-50 transition-all ask-ai-float"
    @click="showChatbot = true"
    style="font-weight: 600; font-size: 1rem;"
    aria-label="Ask AI Chatbot"
  >
    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 mr-2">
      <span class="ai-logo flex items-center justify-center w-7 h-7 rounded-full bg-blue-100">
        <img src="/ai-logo-purple.png" alt="AI Logo" class="w-6 h-6 rounded-full object-cover" />
      </span>
    </span>
    Ask AI
  </button>
  <!-- Chatbot Popup Cardview -->
  <transition name="ask-ai-popup">
    <div
      v-if="showChatbot"
      :class="[
        'fixed bottom-24 right-6 z-50 rounded-xl shadow-lg p-0 w-[28rem] h-[32rem] flex flex-col chatbot-popup border border-blue-100',
        isDark ? 'bg-gray-900' : 'bg-white'
      ]"
      style="overflow: hidden;"
    >
      <div :class="[
        'flex items-center justify-between px-5 py-3',
        isDark ? 'bg-gray-900 text-white' : 'bg-blue-600 text-white'
      ]">
        <div class="flex items-center gap-2">
          <img
            src="/ai-logo-purple.png"
            alt="AI Logo"
            class="ask-ai-avatar"
            style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; margin-right: 10px;"
          />
          <span class="font-semibold">Virtual Assistant</span>
        </div>
        <button class="text-white text-xl" @click="showChatbot = false">×</button>
      </div>
      <div :class="[
        'flex-1 px-5 py-4 flex flex-col justify-between',
        isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      ]" style="min-height: 220px;">
        <div :class="[
          'chatbot-message-bubble rounded-lg px-4 py-2 mb-2 w-fit max-w-[80%] shadow-sm',
          isDark ? 'bg-gray-800 text-white' : 'bg-blue-50 text-blue-900'
        ]">
          👋 Welcome! I'm your Virtual Assistant.<br>
          Ask me anything or let me know how I can help you today.
        </div>
        <div class="mb-3 flex flex-col gap-2 flex-1" id="chat-messages">
          <!-- Chat messages will appear here dynamically -->
          <div v-for="(message, index) in chatMessages" :key="index" class="flex" :class="{'justify-end': message.from === 'user', 'justify-start': message.from !== 'user'}">
            <div v-if="message.from === 'user'" :class="[
              'rounded-lg px-4 py-2 mb-2 max-w-[80%] shadow-sm user-message',
              isDark ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white'
            ]">
              {{ message.text }}
            </div>
            <div v-else :class="[
              'rounded-lg px-4 py-2 mb-2 max-w-[80%] shadow-sm bot-message',
              isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'
            ]">
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
               isDark ? 'bg-gray-900 text-white border-gray-700 focus:ring-blue-400' : 'border-blue-200 focus:ring-blue-400 bg-white text-gray-900'
             ]"
             placeholder="Write a question..."
             style="min-height: 40px; max-height: 120px; overflow-y: auto;"
             oninput="this.style.height = '40px'; this.style.height = (this.scrollHeight)+'px';"
           ></textarea>
           <button
             :class="[
               'absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 shadow transition-all',
               isDark ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'
             ]"
             aria-label="Send message"
             @click="sendMessage"
           >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7" />
             </svg>
           </button>
         </div>
        </div>
      </div>
    </div>
  </transition>
 </template>
<style>
.ask-ai-popup-enter-active, .ask-ai-popup-leave-active {
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
</style>
