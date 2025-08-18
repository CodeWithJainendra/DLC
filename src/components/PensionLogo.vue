<template>
  <div class="pension-logo flex items-center gap-3">
    <!-- Logo Icon -->
    <div class="logo-icon">
      <div
        class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg bank-icon"
        :style="{ backgroundColor: iconColor }"
      >
        <!-- Bank Icon -->
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="text-white">
          <path d="M12 2L2 7v2h20V7l-10-5zM4 11v8h2v-8H4zm4 0v8h2v-8H8zm4 0v8h2v-8h-2zm4 0v8h2v-8h-2zm4 0v8h2v-8h-2zM2 21h20v2H2v-2z"/>
        </svg>
      </div>
    </div>
    
    <!-- Logo Text -->
    <div class="logo-text">
      <div class="text-lg font-bold" :style="{ color: primaryColor }">
        DOPPW DLC
      </div>
      <div class="text-xs text-secondary">
        Management System
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useColors } from 'vuestic-ui'

const { getColor } = useColors()

const props = withDefaults(
  defineProps<{
    iconColor?: string
    primaryColor?: string
  }>(),
  {
    iconColor: 'primary',
    primaryColor: 'primary',
  },
)

const iconColor = computed(() => getColor(props.iconColor))
const primaryColor = computed(() => getColor(props.primaryColor))
</script>

<style lang="scss" scoped>
.pension-logo {
  .logo-icon {
    flex-shrink: 0;
  }
  
  .logo-text {
    line-height: 1.2;
  }
}
</style>
