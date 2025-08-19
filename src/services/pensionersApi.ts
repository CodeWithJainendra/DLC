// Pensioners API Service
export interface Pensioner {
  name: string
  PPO: string
  pensioner_mobile_number: string
  pensioner_email: string
  pensioner_pin: string
  pensioner_state: string
  pensioner_district: string
  pensioner_YearOfBirth: number
  disbursing_authority: string
  disbursing_agency: string
  department: string
  type_of_pensioner: string
  central_govt_pensioner_type?: string
  pensioner_DLC_type: string
}

export interface PensionersResponse {
  DLC_generated_pensioners: Pensioner[]
}

class PensionersApiService {
  private baseUrl: string

  constructor() {
    // Use proxy in development, direct URL in production
    this.baseUrl = import.meta.env.DEV 
      ? '/api/pensioners' 
      : (import.meta.env.VITE_PENSIONERS_API_URL || 'http://100.113.47.45:8080/pensioners')
  }

  async getPensioners(date?: string): Promise<PensionersResponse> {
    try {
      const url = date ? `${this.baseUrl}?date=${date}` : this.baseUrl
      console.log('🔄 Fetching pensioners from:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors', // Enable CORS
      })

      console.log('📡 API Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ API data received:', {
        total_count: data.total_count,
        pensioners_length: data.DLC_generated_pensioners?.length || 0,
        generated_at: data.generated_at
      })
      
      return data
    } catch (error) {
      console.error('❌ Error fetching pensioners data:', error)
      console.log('🔄 Using fallback data instead')
      // Return fallback dummy data when API is not available
      return this.getFallbackData()
    }
  }

  // Fallback dummy data for development/testing
  private getFallbackData(): PensionersResponse {
    const dummyPensioners: Pensioner[] = [
      {
        name: "Ravi Sharma",
        PPO: "CIV2020123456",
        pensioner_mobile_number: "9876543210",
        pensioner_email: "ravi.sharma@example.com",
        pensioner_pin: "208004",
        pensioner_state: "Uttar Pradesh",
        pensioner_district: "Kanpur Nagar",
        pensioner_YearOfBirth: 1950,
        disbursing_authority: "Bank",
        disbursing_agency: "State Bank of India",
        department: "civil",
        type_of_pensioner: "central_government",
        central_govt_pensioner_type: "civil",
        pensioner_DLC_type: "Fingerprint"
      },
      {
        name: "Sunita Devi",
        PPO: "RAI2019987654",
        pensioner_mobile_number: "9123456789",
        pensioner_email: "sunita.devi@example.com",
        pensioner_pin: "400001",
        pensioner_state: "Maharashtra",
        pensioner_district: "Mumbai",
        pensioner_YearOfBirth: 1955,
        disbursing_authority: "Bank",
        disbursing_agency: "HDFC Bank",
        department: "railways",
        type_of_pensioner: "central_government",
        central_govt_pensioner_type: "railways",
        pensioner_DLC_type: "IRIS"
      },
      {
        name: "Colonel Rajesh Kumar",
        PPO: "DEF2018456789",
        pensioner_mobile_number: "9988776655",
        pensioner_email: "rajesh.kumar@example.com",
        pensioner_pin: "110001",
        pensioner_state: "Delhi",
        pensioner_district: "New Delhi",
        pensioner_YearOfBirth: 1952,
        disbursing_authority: "Defence",
        disbursing_agency: "Defence Accounts Department",
        department: "defence",
        type_of_pensioner: "central_government",
        central_govt_pensioner_type: "defence",
        pensioner_DLC_type: "Face"
      }
    ]

    // Generate more dummy data for different states
    const states = [
      "Uttar Pradesh", "Maharashtra", "Bihar", "West Bengal", "Madhya Pradesh",
      "Tamil Nadu", "Rajasthan", "Karnataka", "Gujarat", "Andhra Pradesh",
      "Odisha", "Telangana", "Kerala", "Jharkhand", "Assam", "Punjab",
      "Chhattisgarh", "Haryana", "Delhi", "Jammu and Kashmir"
    ]

    const departments = ["civil", "railways", "defence", "post", "telecom", "EPFO", "state"]
    const dlcTypes = ["Fingerprint", "IRIS", "Face"]
    const authorities = ["Bank", "Treasury", "PostOffice", "Defence", "EPFO"]

    // Generate additional dummy records
    for (let i = 0; i < 500; i++) {
      const state = states[Math.floor(Math.random() * states.length)]
      const dept = departments[Math.floor(Math.random() * departments.length)]
      const dlcType = dlcTypes[Math.floor(Math.random() * dlcTypes.length)]
      const authority = authorities[Math.floor(Math.random() * authorities.length)]

      dummyPensioners.push({
        name: `Pensioner ${i + 4}`,
        PPO: `PPO${2020 + Math.floor(Math.random() * 5)}${String(i + 1000).padStart(6, '0')}`,
        pensioner_mobile_number: `9${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')}`,
        pensioner_email: `pensioner${i + 4}@example.com`,
        pensioner_pin: String(Math.floor(Math.random() * 900000) + 100000),
        pensioner_state: state,
        pensioner_district: `District ${i % 10 + 1}`,
        pensioner_YearOfBirth: 1940 + Math.floor(Math.random() * 25),
        disbursing_authority: authority,
        disbursing_agency: `Agency ${i % 5 + 1}`,
        department: dept,
        type_of_pensioner: dept === "state" ? "state_government" : "central_government",
        central_govt_pensioner_type: dept !== "state" ? dept : undefined,
        pensioner_DLC_type: dlcType
      })
    }

    return {
      DLC_generated_pensioners: dummyPensioners
    }
  }

  // Helper method to get state-wise verification counts
  getStateWiseData(pensioners: Pensioner[]): Record<string, number> {
    const stateData: Record<string, number> = {}
    
    pensioners.forEach(pensioner => {
      const state = pensioner.pensioner_state
      if (state) {
        stateData[state] = (stateData[state] || 0) + 1
      }
    })
    
    return stateData
  }

  // Helper method to get department-wise data
  getDepartmentWiseData(pensioners: Pensioner[]): Record<string, number> {
    const departmentData: Record<string, number> = {}
    
    pensioners.forEach(pensioner => {
      const dept = pensioner.department
      if (dept) {
        departmentData[dept] = (departmentData[dept] || 0) + 1
      }
    })
    
    return departmentData
  }

  // Helper method to get DLC type-wise data
  getDLCTypeWiseData(pensioners: Pensioner[]): Record<string, number> {
    const dlcData: Record<string, number> = {}
    
    pensioners.forEach(pensioner => {
      const dlcType = pensioner.pensioner_DLC_type
      if (dlcType) {
        dlcData[dlcType] = (dlcData[dlcType] || 0) + 1
      }
    })
    
    return dlcData
  }

  // Helper method to get disbursing authority-wise data
  getDisbursingAuthorityData(pensioners: Pensioner[]): Record<string, number> {
    const authorityData: Record<string, number> = {}
    
    pensioners.forEach(pensioner => {
      const authority = pensioner.disbursing_authority
      if (authority) {
        authorityData[authority] = (authorityData[authority] || 0) + 1
      }
    })
    
    return authorityData
  }

  // Helper method to get age distribution
  getAgeDistribution(pensioners: Pensioner[]): Record<string, number> {
    const currentYear = new Date().getFullYear()
    const ageGroups: Record<string, number> = {
      '60-65': 0,
      '66-70': 0,
      '71-75': 0,
      '76-80': 0,
      '81-85': 0,
      '86+': 0
    }
    
    pensioners.forEach(pensioner => {
      const age = currentYear - pensioner.pensioner_YearOfBirth
      if (age >= 60 && age <= 65) ageGroups['60-65']++
      else if (age >= 66 && age <= 70) ageGroups['66-70']++
      else if (age >= 71 && age <= 75) ageGroups['71-75']++
      else if (age >= 76 && age <= 80) ageGroups['76-80']++
      else if (age >= 81 && age <= 85) ageGroups['81-85']++
      else if (age >= 86) ageGroups['86+']++
    })
    
    return ageGroups
  }
}

export const pensionersApi = new PensionersApiService()
