<template>
  <VaCard
    :class="['cardview', isClickable ? 'cardview-clickable' : '', { 'cardview-hovered': hovered }]"
    style="
      height: 100px;
      min-height: 100px;
      max-height: 100px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      transition: all 0.3s ease;
    "
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <VaCardContent style="height: 100%; display: flex; flex-direction: column; justify-content: center">
      <section style="height: 100%; display: flex; flex-direction: column; justify-content: center">
        <header class="flex items-center justify-between">
          <div v-if="value" class="text-lg font-semibold grow">{{ value }}</div>
          <div
            class="p-1 rounded"
            :style="{
              backgroundColor: iconBackground,
              color: iconColor,
            }"
          >
            <slot name="icon"></slot>
          </div>
        </header>
        <div style="flex: 1; overflow: hidden">
          <p v-if="title" class="mb-2">{{ title }}</p>
          <div style="height: 32px; overflow: visible">
            <slot name="chart"></slot>
          </div>
        </div>
      </section>
    </VaCardContent>
  </VaCard>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { VaCard } from 'vuestic-ui'

const props = defineProps({
  title: String,
  value: [String, Number],
  changeText: String,
  up: Boolean,
  iconBackground: String,
  iconColor: String,
})
const hovered = ref(false)
const isClickable = computed(() => props.title === '' && props.value === '') // Only Pending Verifications card
</script>

<style scoped>
.cardview {
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.cardview:hover {
  /* Removed transform and enhanced shadow effects */
}

/* Dark theme border support */
:deep(.va-card) {
  border: 1px solid var(--va-background-border, rgba(255, 255, 255, 0.08));
}

:deep(.va-card:hover) {
  /* Removed hover border changes */
}

.cardview-clickable {
  cursor: pointer;
  transition:
    box-shadow 0.2s,
    transform 0.2s;
}

.cardview-clickable:hover {
  /* Removed transform and enhanced shadow effects */
}
</style>
