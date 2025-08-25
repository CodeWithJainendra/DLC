<template>
  <VaSidebar
    v-model="writableVisible"
    :minimized="localMinimized"
    :width="localMinimized ? '64px' : `${sidebarWidth}px`"
    :minimized-width="'64px'"
    :color="color"
    class="relative"
  >
    <!-- Collapse/Expand Handle -->
    <div
      class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-16 bg-gray-200 dark:bg-gray-700 rounded-r-lg flex items-center justify-center cursor-pointer z-30 hover:bg-primary-500 hover:text-white transition-colors"
      @click="toggleSidebar"
    >
      <VaIcon :name="localMinimized ? 'chevron_right' : 'chevron_left'" size="small" />
    </div>
    <!-- Width Resize Handle (only when expanded) -->
    <div
      v-if="!localMinimized"
      class="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary-500 active:bg-primary-600 transition-colors z-10"
      @mousedown="startResize"
    />

    <div class="flex flex-col h-full">
      <!-- Navigation Menu -->
      <div class="flex-1">
        <VaAccordion v-model="value" multiple>
          <VaCollapse v-for="(route, index) in navigationRoutes.routes" :key="index" class="mb-1">
            <template #header="{ value: isCollapsed }">
              <VaSidebarItem
                :to="route.children ? undefined : { name: route.name }"
                :active="routeHasActiveChild(route)"
                :active-color="activeColor"
                :text-color="textColor(route)"
                :aria-label="`${route.children ? 'Open category ' : 'Visit'} ${t(route.displayName)}`"
                role="button"
                hover-opacity="0.10"
              >
                <VaSidebarItemContent :class="['py-3 pr-2', localMinimized ? 'pl-3' : 'pl-4']">
                  <VaIcon
                    v-if="route.meta.icon"
                    aria-hidden="true"
                    :name="route.meta.icon"
                    size="20px"
                    :color="iconColor(route)"
                  />
                  <VaSidebarItemTitle
                    v-if="!localMinimized"
                    class="flex justify-between items-center leading-5 font-semibold"
                  >
                    {{ t(route.displayName) }}
                    <VaIcon v-if="route.children" :name="arrowDirection(isCollapsed)" size="20px" />
                  </VaSidebarItemTitle>
                </VaSidebarItemContent>
              </VaSidebarItem>
            </template>
            <template #body>
              <div v-for="(childRoute, index2) in route.children" v-if="!localMinimized" :key="index2">
                <VaSidebarItem
                  :to="{ name: childRoute.name }"
                  :active="isActiveChildRoute(childRoute)"
                  :active-color="activeColor"
                  :text-color="textColor(childRoute)"
                  :aria-label="`Visit ${t(route.displayName)}`"
                  hover-opacity="0.10"
                >
                  <VaSidebarItemContent class="py-3 pr-2 pl-11">
                    <VaSidebarItemTitle class="leading-5 font-semibold">
                      {{ t(childRoute.displayName) }}
                    </VaSidebarItemTitle>
                  </VaSidebarItemContent>
                </VaSidebarItem>
              </div>
            </template>
          </VaCollapse>
        </VaAccordion>
      </div>

      <!-- Footer: Version -->
      <div class="p-4 border-t border-[color:var(--va-border)] mt-auto">
        <div class="text-center text-sm text-secondary">v4.0.0</div>
      </div>
    </div>
  </VaSidebar>
</template>

<script lang="ts">
import { defineComponent, watch, ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

import { useI18n } from 'vue-i18n'
import { useColors } from 'vuestic-ui'

import navigationRoutes, { type INavigationRoute } from './NavigationRoutes'

export default defineComponent({
  name: 'Sidebar',
  props: {
    visible: { type: Boolean, default: true },
    mobile: { type: Boolean, default: false },
    minimized: { type: Boolean, default: false },
  },
  emits: ['update:visible', 'update:minimized'],

  setup: (props, { emit }) => {
    const { getColor, colorToRgba } = useColors()
    const route = useRoute()
    const { t } = useI18n()

    const value = ref<boolean[]>([])
    // Local minimized state to work even if parent doesn't sync
    const localMinimized = ref<boolean>(props.minimized)
    watch(
      () => props.minimized,
      (v) => (localMinimized.value = v),
    )
    // Width for expanded state
    const sidebarWidth = ref<number>(280)

    const writableVisible = computed({
      get: () => props.visible,
      set: (v: boolean) => emit('update:visible', v),
    })

    const isActiveChildRoute = (child: INavigationRoute) => route.name === child.name

    const routeHasActiveChild = (section: INavigationRoute) => {
      if (!section.children) {
        return route.path.endsWith(`${section.name}`)
      }

      return section.children.some(({ name }) => route.path.endsWith(`${name}`))
    }

    const setActiveExpand = () =>
      (value.value = navigationRoutes.routes.map((route: INavigationRoute) => routeHasActiveChild(route)))

    const sidebarMinWidth = computed(() => (props.mobile ? '0' : '64'))
    const color = computed(() => getColor('background-secondary'))
    const activeColor = computed(() => colorToRgba(getColor('focus'), 0.1))

    // Toggle between collapsed and expanded states
    const toggleSidebar = () => {
      localMinimized.value = !localMinimized.value
      emit('update:minimized', localMinimized.value)
    }

    // Resize logic for expanded state
    const startResize = (e: MouseEvent) => {
      const startX = e.pageX
      const startWidth = sidebarWidth.value

      const onMouseMove = (e: MouseEvent) => {
        const newWidth = startWidth + e.pageX - startX
        const clamped = Math.min(400, Math.max(200, newWidth))
        sidebarWidth.value = clamped
      }

      const stop = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', stop)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', stop, { once: true })
    }

    const iconColor = (route: INavigationRoute) => (routeHasActiveChild(route) ? 'primary' : 'secondary')
    const textColor = (route: INavigationRoute) => (routeHasActiveChild(route) ? 'primary' : 'textPrimary')
    const arrowDirection = (state: boolean) => (state ? 'va-arrow-up' : 'va-arrow-down')

    watch(
      () => route.path,
      () => setActiveExpand(),
      { immediate: true },
    )

    return {
      writableVisible,
      localMinimized,
      sidebarWidth,
      sidebarMinWidth,
      value,
      color,
      activeColor,
      navigationRoutes,
      routeHasActiveChild,
      isActiveChildRoute,
      t,
      iconColor,
      textColor,
      arrowDirection,
      toggleSidebar,
      startResize,
      minimized: computed(() => props.minimized),
    }
  },
})
</script>

<style lang="scss" scoped>
// Prevent icon jump on animation and add smooth transitions
.va-sidebar {
  width: unset !important;
  min-width: unset !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  overflow: visible !important;
}

// Force transition on the sidebar wrapper
:deep(.va-sidebar__wrapper) {
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

// Ensure content transitions smoothly
:deep(.va-sidebar__content) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.va-sidebar__menu) {
  padding-top: 0.5rem;
}

.text-secondary {
  color: var(--va-secondary) !important;
  opacity: 0.8;
}

// Ensure menu items don't overflow
:deep(.va-sidebar-item) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// Adjust padding when minimized
:deep(.va-sidebar-item-content) {
  padding: 0.75rem 1rem !important;
}

// Make sure the sidebar has a border
.va-sidebar {
  border-right: 1px solid var(--va-border);
}
</style>
