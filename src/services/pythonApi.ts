/**
 * Python Backend API Integration Service
 * Connects Vue.js Dashboard with Python Flask Backend
 */

import axios from 'axios'

// Python backend base URL
const PYTHON_API_BASE = 'http://localhost:5000/api'

// Create axios instance with default config
const pythonApi = axios.create({
  baseURL: PYTHON_API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
pythonApi.interceptors.request.use(
  (config) => {
    console.log(`🐍 Python API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('🚫 Python API Request Error:', error)
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
pythonApi.interceptors.response.use(
  (response) => {
    console.log(`✅ Python API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('🚫 Python API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  },
)

// Type definitions
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
  status: 'active' | 'pending'
}

export interface Pensioner {
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
  data: Pensioner[]
  page: number
  per_page: number
  total: number
}

export interface AnalyticsTrends {
  verifications: number[]
  registrations: number[]
  disbursements: number[]
  dates: string[]
}

export interface BarChartRaceData {
  data: Record<string, Record<string, number>>
  title: string
  periods: string[]
}

// API Service Class
export class PythonApiService {
  /**
   * Get main dashboard statistics
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await pythonApi.get<DashboardStats>('/dashboard/stats')
      return response.data
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      // Return fallback data
      return {
        totalPensioners: 0,
        verifiedThisMonth: 0,
        pendingVerifications: 0,
        totalAmount: 0,
        lastUpdated: new Date().toISOString(),
      }
    }
  }

  /**
   * Get age-wise distribution data
   */
  static async getAgeDistribution(): Promise<AgeDistribution[]> {
    try {
      const response = await pythonApi.get<AgeDistribution[]>('/dashboard/age-distribution')
      return response.data
    } catch (error) {
      console.error('Failed to fetch age distribution:', error)
      return []
    }
  }

  /**
   * Get state-wise pension data
   */
  static async getStateWiseData(): Promise<StateWiseData[]> {
    try {
      const response = await pythonApi.get<StateWiseData[]>('/dashboard/state-wise-data')
      return response.data
    } catch (error) {
      console.error('Failed to fetch state-wise data:', error)
      return []
    }
  }

  /**
   * Get verification locations for map
   */
  static async getVerificationLocations(): Promise<VerificationLocation[]> {
    try {
      const response = await pythonApi.get<VerificationLocation[]>('/dashboard/verification-locations')
      return response.data
    } catch (error) {
      console.error('Failed to fetch verification locations:', error)
      return []
    }
  }

  /**
   * Get paginated list of pensioners
   */
  static async getPensioners(
    page: number = 1,
    perPage: number = 50,
    statusFilter?: string,
  ): Promise<PensionersResponse> {
    try {
      const params: any = { page, per_page: perPage }
      if (statusFilter) {
        params.status = statusFilter
      }

      const response = await pythonApi.get<PensionersResponse>('/pensioners', { params })
      return response.data
    } catch (error) {
      console.error('Failed to fetch pensioners:', error)
      return {
        data: [],
        page: 1,
        per_page: perPage,
        total: 0,
      }
    }
  }

  /**
   * Get analytics trends data
   */
  static async getAnalyticsTrends(days: number = 30): Promise<AnalyticsTrends> {
    try {
      const response = await pythonApi.get<AnalyticsTrends>('/analytics/trends', {
        params: { days },
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch analytics trends:', error)
      return {
        verifications: [],
        registrations: [],
        disbursements: [],
        dates: [],
      }
    }
  }

  /**
   * Get bar chart race data for state-wise visualization
   */
  static async getBarChartRaceData(): Promise<BarChartRaceData> {
    try {
      const response = await pythonApi.get<BarChartRaceData>('/analytics/bar-chart-race-data')
      return response.data
    } catch (error) {
      console.error('Failed to fetch bar chart race data:', error)
      return {
        data: {},
        title: 'State-wise Pension Verifications',
        periods: [],
      }
    }
  }

  /**
   * Check if Python backend is available
   */
  static async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await pythonApi.get('/dashboard/stats')
      return response.status === 200
    } catch (error) {
      console.warn('Python backend not available:', error)
      return false
    }
  }
}

// Export default instance
export default PythonApiService
