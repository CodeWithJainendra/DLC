import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => {
    return {
      isSidebarMinimized: false,
      showFilterPanel: false,
      selectedStateInfo: null as any,
    }
  },

  actions: {
    toggleSidebar() {
      this.isSidebarMinimized = !this.isSidebarMinimized
    },
    toggleFilterPanel() {
      this.showFilterPanel = !this.showFilterPanel
    },
    setSelectedStateInfo(stateInfo: any) {
      this.selectedStateInfo = stateInfo
    },
    clearSelectedStateInfo() {
      this.selectedStateInfo = null
    },
  },
})
