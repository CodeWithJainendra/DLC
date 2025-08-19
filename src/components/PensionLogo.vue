<template>
  <div class="pension-logo flex items-center gap-3">
    <!-- Logo Icon -->
    <div class="logo-icon">
      <img
        src="/mainlogo.png"
        alt="Main Logo"
        class="w-10 h-10 rounded-lg object-contain shadow cursor-pointer"
        style="background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,0.12);"
        @click="openLogoFullscreen"
        ref="logoImg"
      />
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
import { computed, ref } from 'vue'
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

const logoImg = ref<HTMLImageElement | null>(null)

function openLogoFullscreen() {
  const img = logoImg.value
  if (img) {
    if (img.requestFullscreen) {
      img.requestFullscreen()
    } else if ((img as any).webkitRequestFullscreen) {
      (img as any).webkitRequestFullscreen()
    } else if ((img as any).msRequestFullscreen) {
      (img as any).msRequestFullscreen()
    }
  }
}
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
