/**
 * Stats API Service for Pension Management System Dashboard
 * Integrates with the Flask backend running on localhost:5000
 */

export interface DashboardStats {
  totalPensioners: number
  verifiedThisMonth: number
  pendingVerifications: number
  totalAmount: number
  lastUpdated: string
}

export interface AgeDistribution {
  ageGroup: string
  count: number
}

export interface StateWiseData {
  state: string
  totalPensioners: number
  verified: number
  pending: number
  avgAmount: number
}

export interface VerificationLocation {
  district: string
  state: string
  coordinates: [number, number]
  total: number
  verified: number
  pending: number
  status: string
}

export interface PensionerRecord {
  id: number
  pension_id: string
  name: string
  age: number
  district: string
  state: string
  status: string
  amount: number
  last_verification: string
  created_at: string
}

export interface PensionersResponse {
  data: PensionerRecord[]
  page: number
  per_page: number
  total: number
}

export interface DLCBankData {
  state_wise_data: Record<string, {
    total_pensioners: number
    age_groups: Record<string, number>
    bank_locations: Record<string, number>
    pincode_counts: Record<string, number>
  }>
  bank_pincode_data: Record<string, any>
  total_records: number
  total_states: number
  processed_at: string
}

export interface FormattedStats {
  totalPensioners: string
  verifiedThisMonth: string
  pendingVerifications: string
  totalAmount: string
}

export interface AnalyticsTrends {
  verifications: number[]
  registrations: number[]
  disbursements: number[]
  dates: string[]
}

class StatsApiService {
  private baseUrl: string

  constructor() {
    // Connect to Flask backend running on port 5000
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
  }

  /**
   * Get dashboard statistics from Flask backend
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${this.baseUrl}/api/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('📊 Dashboard Stats API Response:', data)
      return data
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  }

  /**
   * Get formatted dashboard statistics for cards
   */
  async getFormattedStats(): Promise<FormattedStats> {
    try {
      const stats = await this.getDashboardStats()
      
      return {
        totalPensioners: this.formatNumber(stats.totalPensioners),
        verifiedThisMonth: this.formatNumber(stats.verifiedThisMonth),
        pendingVerifications: this.formatNumber(stats.pendingVerifications),
        totalAmount: this.formatCurrency(stats.totalAmount)
      }
    } catch (error) {
      console.error('Error fetching formatted stats, using fallback:', error)
      return {
        totalPensioners: '0',
        verifiedThisMonth: '0',
        pendingVerifications: '0',
        totalAmount: '₹0'
      }
    }
  }

  /**
   * Get age distribution data
   */
  async getAgeDistribution(): Promise<AgeDistribution[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/dashboard/age-distribution`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('📊 Age Distribution Response:', data)
      return data
    } catch (error) {
      console.error('Error fetching age distribution:', error)
      return []
    }
  }

  /**
   * Get state-wise pension data
   */
  async getStateWiseData(): Promise<StateWiseData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/dashboard/state-wise-data`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('📊 State-wise Data Response:', data)
      return data
    } catch (error) {
      console.error('Error fetching state-wise data:', error)
      return []
    }
  }

  /**
   * Get verification locations for map
   */
  async getVerificationLocations(): Promise<VerificationLocation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/dashboard/verification-locations`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('🗺️ Verification Locations Response:', data)
      return data
    } catch (error) {
      console.error('Error fetching verification locations:', error)
      return []
    }
  }

  /**
   * Get pensioners list with pagination
   */
  async getPensioners(page: number = 1, perPage: number = 50, status?: string): Promise<PensionersResponse> {
    try {
      let url = `${this.baseUrl}/api/pensioners?page=${page}&per_page=${perPage}`
      if (status) {
        url += `&status=${status}`
      }
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('👥 Pensioners Response:', data)
      return data
    } catch (error) {
      console.error('Error fetching pensioners:', error)
      return { data: [], page: 1, per_page: perPage, total: 0 }
    }
  }

  /**
   * Get DLC bank pincode data from Excel analysis
   */
  async getDLCBankData(): Promise<DLCBankData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/dlc-bank-pincode-data`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('🏦 DLC Bank Data Response:', data)
      return data
    } catch (error) {
      console.error('Error fetching DLC bank data:', error)
      return null
    }
  }

  /**
   * Get analytics trends data
   */
  async getAnalyticsTrends(days: number = 30): Promise<AnalyticsTrends> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/trends?days=${days}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📈 Analytics Trends Response:', data)
      return data
    } catch (error) {
      console.error('Error fetching analytics trends:', error)
      return { verifications: [], registrations: [], disbursements: [], dates: [] }
    }
  }

  /**
   * Format numbers with Indian comma notation
   */
  private formatNumber(num: number): string {
    if (!num || num === 0) return '0'
    
    // Convert to Indian number format (lakhs, crores)
    if (num >= 10000000) {
      return (num / 10000000).toFixed(1) + ' Cr'
    } else if (num >= 100000) {
      return (num / 100000).toFixed(1) + ' L'
    } else if (num >= 1000) {
      return num.toLocaleString('en-IN')
    }
    
    return num.toString()
  }

  /**
   * Format currency amounts
   */
  private formatCurrency(amount: number): string {
    if (!amount || amount === 0) return '₹0'
    
    const formatted = this.formatNumber(amount)
    return `₹${formatted}`
  }

  /**
   * Get Excel pensioner data (uses DLC analysis data)
   */
  async getExcelPensionerData(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/excel-pensioner-data`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📊 Excel Pensioner Data Response:', data)
      return data
    } catch (error) {
      console.error('Error fetching Excel pensioner data:', error)
      return null
    }
  }

  /**
   * Check if the Flask backend is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(`${this.baseUrl}/api/dashboard/stats`, {
        method: 'GET',
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      return response.ok
    } catch (error) {
      console.warn('Backend health check failed:', error)
      return false
    }
  }
}

export const statsApi = new StatsApiService()
