<template>
  <div class="app-navbar-actions">
    <VaButton
      v-if="!isMobile"
      preset="secondary"
      color="textPrimary"
      class="app-navbar-actions__item flex-shrink-0 mx-0"
      @click="toggleTheme"
      :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
    >
      <VaIcon :name="isDark ? 'light_mode' : 'dark_mode'" size="large" />
    </VaButton>
    <NotificationDropdown class="app-navbar-actions__item" />
    <ProfileDropdown class="app-navbar-actions__item app-navbar-actions__item--profile mr-1" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useColors } from 'vuestic-ui'
import ProfileDropdown from './dropdowns/ProfileDropdown.vue'
import NotificationDropdown from './dropdowns/NotificationDropdown.vue'

defineProps({
  isMobile: { type: Boolean, default: false },
})

const { applyPreset, currentPresetName } = useColors()

const isDark = computed(() => currentPresetName.value === 'dark')

const toggleTheme = () => {
  const newTheme = isDark.value ? 'light' : 'dark'
  applyPreset(newTheme)
}
</script>

<style lang="scss">
.app-navbar-actions {
  display: flex;
  align-items: center;

  .va-dropdown__anchor {
    color: var(--va-primary);
    fill: var(--va-primary);
  }

  &__item {
    padding: 0;
    margin-left: 0.25rem;
    margin-right: 0.25rem;

    svg {
      height: 20px;
    }

    &--profile {
      display: flex;
      justify-content: center;
    }

    .va-dropdown-content {
      background-color: var(--va-white);
    }

    @media screen and (max-width: 640px) {
      margin-left: 0;
      margin-right: 0;

      &:first-of-type {
        margin-left: 0;
      }
    }
  }

  .fa-github {
    color: var(--va-on-background-primary);
  }
}
</style>
