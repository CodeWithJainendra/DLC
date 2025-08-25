// Authentication service
export const authService = {
  // Check if user is authenticated
  isAuthenticated(): boolean {
    return localStorage.getItem('isAuthenticated') === 'true'
  },

  // Get current user email
  getCurrentUser(): string | null {
    return localStorage.getItem('userEmail')
  },

  // Login user
  login(email: string): void {
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('userEmail', email)
  },

  // Logout user
  logout(): void {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userEmail')
  },
}

// Route guard for authentication
export const requireAuth = () => {
  if (!authService.isAuthenticated()) {
    return { name: 'login' }
  }
  return true
}

// Route guard for guests (redirect authenticated users)
export const requireGuest = () => {
  if (authService.isAuthenticated()) {
    return { name: 'dashboard' }
  }
  return true
}
