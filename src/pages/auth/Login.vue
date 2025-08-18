<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="text-xl font-semibold text-gray-800 mb-6 text-center">Sign In to Your Account</h2>
      <VaForm ref="form" @submit.prevent="handleLogin" class="space-y-4">
        <!-- Email Field -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <VaInput
            v-model="formData.email"
            type="email"
            placeholder="Enter your email"
            class="w-full"
            :error="!!emailError"
            :error-messages="emailError"
            :loading="isLoading"
          >
            <template #prependInner>
              <VaIcon name="email" size="small" color="secondary" />
            </template>
          </VaInput>
        </div>
        <!-- Password Field -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <VaInput
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Enter your password"
            class="w-full"
            :error="!!passwordError"
            :error-messages="passwordError"
            :loading="isLoading"
          >
            <template #prependInner>
              <VaIcon name="lock" size="small" color="secondary" />
              </template>
            <template #appendInner>
              <VaIcon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                size="small"
                color="secondary"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </VaInput>
        </div>
        <!-- Remember Me -->
        <div class="flex items-center justify-between">
          <VaCheckbox v-model="formData.keepLoggedIn" label="Remember me" />
          <a href="#" class="text-sm text-blue-600 hover:text-blue-800">Forgot password?</a>
        </div>
        <!-- Login Button -->
        <VaButton
          type="submit"
          class="w-full"
          :loading="isLoading"
          :disabled="!isFormValid"
        >
          Sign In
        </VaButton>
      </VaForm>
      <!-- Demo Credentials Info -->
      <div class="demo-info">
        <div class="text-xs text-gray-500 text-center mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p class="font-medium text-blue-800 mb-1">Demo Credentials:</p>
          <p><strong>Email:</strong> dlc@example.com</p>
          <p><strong>Password:</strong> 123456789</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { VaInput, VaButton, VaIcon, VaCheckbox, VaForm, useToast } from 'vuestic-ui'

const router = useRouter()
const { init: initToast } = useToast()

// Form data
const formData = reactive({
  email: '',
  password: '',
  keepLoggedIn: false
})

const showPassword = ref(false)
const isLoading = ref(false)

// Validation errors
const emailError = ref('')
const passwordError = ref('')

// Hardcoded credentials
const VALID_EMAIL = 'dlc@example.com'
const VALID_PASSWORD = '123456789'

// Form validation
const isFormValid = computed(() => {
  return formData.email.length > 0 && formData.password.length > 0
})

// Validate email
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) {
    return 'Email is required'
  }
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address'
  }
  return ''
}

// Validate password
const validatePassword = (password: string) => {
  if (!password) {
    return 'Password is required'
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters'
  }
  return ''
}

// Handle login
const handleLogin = async () => {
  // Clear previous errors
  emailError.value = ''
  passwordError.value = ''

  // Validate form
  emailError.value = validateEmail(formData.email)
  passwordError.value = validatePassword(formData.password)

  if (emailError.value || passwordError.value) {
    return
  }

  isLoading.value = true

  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check credentials
    if (formData.email === VALID_EMAIL && formData.password === VALID_PASSWORD) {
      // Store authentication state
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userEmail', formData.email)

      // Show success message
      initToast({
        message: 'Login successful! Welcome to DOPPW DLC Dashboard.',
        color: 'success',
        duration: 3000,
        position: 'top-right'
      })

      // Redirect to dashboard
      router.push('/admin/dashboard')
    } else {
      // Show error for invalid credentials
      initToast({
        message: 'Invalid email or password. Please check your credentials.',
        color: 'danger',
        duration: 4000,
        position: 'top-right'
      })
    }
  } catch (error) {
    console.error('Login error:', error)
    initToast({
      message: 'An error occurred during login. Please try again.',
      color: 'danger',
      duration: 4000,
      position: 'top-right'
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  padding: 2rem;
}

.login-card {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  padding: 2.5rem;
  width: 100%;
  max-width: 450px;
  border: 1px solid #f0f0f0;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.logo-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
}

.logo-icon-small {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  box-shadow: 0 8px 16px -4px rgba(59, 130, 246, 0.3);
}

.demo-info {
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .login-container {
    padding: 1rem;
  }
  
  .login-card {
    padding: 1.5rem;
    margin: 0;
    max-width: 100%;
  }
}
</style>
