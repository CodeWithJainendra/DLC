import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => {
    return {
      isSidebarMinimized: false,
      showFilterPanel: false,
      selectedStateInfo: null as any,
      // Filter selections
      selectedState: null as string | null,
      selectedDistrict: null as string | null,
      selectedAgeGroup: null as string | null,
      selectedStatus: null as string | null,
      selectedBank: null as string | null,
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
    // Filter actions
    setFilter(filterType: string, value: string | null) {
      switch (filterType) {
        case 'state':
          this.selectedState = value
          break
        case 'district':
          this.selectedDistrict = value
          break
        case 'ageGroup':
          this.selectedAgeGroup = value
          break
        case 'status':
          this.selectedStatus = value
          break
        case 'bank':
          this.selectedBank = value
          break
      }
    },
    clearAllFilters() {
      this.selectedState = null
      this.selectedDistrict = null
      this.selectedAgeGroup = null
      this.selectedStatus = null
      this.selectedBank = null
    },
    getActiveFilters() {
      const filters: Record<string, string> = {}
      if (this.selectedState) filters.state = this.selectedState
      if (this.selectedDistrict) filters.district = this.selectedDistrict
      if (this.selectedAgeGroup) filters.age_group = this.selectedAgeGroup
      if (this.selectedStatus) filters.status = this.selectedStatus
      if (this.selectedBank) filters.bank = this.selectedBank
      return filters
    },
  },
})
