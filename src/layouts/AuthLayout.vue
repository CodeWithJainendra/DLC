<template>
  <VaLayout v-if="breakpoint.lgUp" class="h-screen bg-[var(--va-background-secondary)]">
    <template #left>
      <div class="bg-primary h-full flex items-center justify-center" style="width: 35vw">
        <div class="text-center">
          <!-- Government Logo -->
          <div class="mb-6">
            <div class="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" class="text-blue-600">
                <path d="M12 2L2 7v2h20V7l-10-5zM4 11v8h2v-8H4zm4 0v8h2v-8H8zm4 0v8h2v-8h-2zm4 0v8h2v-8h-2zm4 0v8h2v-8h-2zM2 21h20v2H2v-2z"/>
              </svg>
            </div>
          </div>
          <!-- Department Text -->
          <div class="text-white">
            <h1 class="text-2xl font-bold mb-2">DEPARTMENT OF</h1>
            <h2 class="text-xl font-semibold mb-1">PENSION & PENSIONERS' WELFARE</h2>
            <p class="text-sm opacity-90">Government of India</p>
            <div class="mt-4 pt-4 border-t border-white/20">
              <p class="text-lg font-medium">Digital Life Certificate</p>
              <p class="text-sm opacity-80">Management System v4.0</p>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #content>
      <main class="h-full flex items-center justify-center mx-auto max-w-[420px]">
        <RouterView />
      </main>
    </template>
  </VaLayout>

  <VaLayout v-else class="h-screen bg-[var(--va-background-secondary)]">
    <template #content>
      <div class="p-4">
        <main class="h-full flex flex-row items-center justify-start mx-auto max-w-[420px]">
          <div class="flex flex-col items-start">
            <div class="py-4">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="text-white">
                    <path d="M12 2L2 7v2h20V7l-10-5zM4 11v8h2v-8H4zm4 0v8h2v-8H8zm4 0v8h2v-8h-2zm4 0v8h2v-8h-2zm4 0v8h2v-8h-2zM2 21h20v2H2v-2z"/>
                  </svg>
                </div>
                <div>
                  <h1 class="text-lg font-bold text-gray-800">DOPPW DLC</h1>
                  <p class="text-sm text-gray-600">Digital Life Certificate</p>
                </div>
              </div>
            </div>
            <RouterView />
          </div>
        </main>
      </div>
    </template>
  </VaLayout>
</template>

<script lang="ts" setup>
import { useBreakpoint } from 'vuestic-ui'

const breakpoint = useBreakpoint()
</script>
