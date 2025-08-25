<template>
  <div class="flex flex-col gap-4">
    <!-- Quick Help Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <VaCard class="cursor-pointer hover:shadow-lg transition-shadow" @click="openUserGuide">
        <VaCardContent class="text-center">
          <VaIcon name="menu_book" size="3xl" color="primary" />
          <h3 class="text-lg font-semibold mt-3">User Guide</h3>
          <p class="text-secondary mt-2">Complete guide for using the pension system</p>
        </VaCardContent>
      </VaCard>

      <VaCard class="cursor-pointer hover:shadow-lg transition-shadow" @click="openVideoTutorials">
        <VaCardContent class="text-center">
          <VaIcon name="play_circle" size="3xl" color="success" />
          <h3 class="text-lg font-semibold mt-3">Video Tutorials</h3>
          <p class="text-secondary mt-2">Step-by-step video instructions</p>
        </VaCardContent>
      </VaCard>

      <VaCard class="cursor-pointer hover:shadow-lg transition-shadow" @click="openFAQ">
        <VaCardContent class="text-center">
          <VaIcon name="quiz" size="3xl" color="info" />
          <h3 class="text-lg font-semibold mt-3">FAQ</h3>
          <p class="text-secondary mt-2">Frequently asked questions and answers</p>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Contact Support -->
    <VaCard>
      <VaCardTitle>
        <h2 class="text-xl font-semibold">Contact Support</h2>
      </VaCardTitle>
      <VaCardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-semibold mb-3">Technical Support</h4>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <VaIcon name="phone" size="small" />
                <span>+91-11-2345-6789</span>
              </div>
              <div class="flex items-center gap-2">
                <VaIcon name="email" size="small" />
                <span>tech.support@pension.gov.in</span>
              </div>
              <div class="flex items-center gap-2">
                <VaIcon name="schedule" size="small" />
                <span>Mon-Fri: 9:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>

          <div>
            <h4 class="font-semibold mb-3">Administrative Support</h4>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <VaIcon name="phone" size="small" />
                <span>+91-11-2345-6790</span>
              </div>
              <div class="flex items-center gap-2">
                <VaIcon name="email" size="small" />
                <span>admin.support@pension.gov.in</span>
              </div>
              <div class="flex items-center gap-2">
                <VaIcon name="schedule" size="small" />
                <span>Mon-Fri: 10:00 AM - 5:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Submit Support Ticket -->
    <VaCard>
      <VaCardTitle>
        <h2 class="text-xl font-semibold">Submit Support Ticket</h2>
      </VaCardTitle>
      <VaCardContent>
        <VaForm class="flex flex-col gap-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VaSelect
              v-model="ticket.category"
              :options="ticketCategories"
              label="Category"
              placeholder="Select category"
            />

            <VaSelect
              v-model="ticket.priority"
              :options="priorityOptions"
              label="Priority"
              placeholder="Select priority"
            />
          </div>

          <VaInput v-model="ticket.subject" label="Subject" placeholder="Brief description of the issue" />

          <VaTextarea
            v-model="ticket.description"
            label="Description"
            placeholder="Detailed description of the issue"
            rows="4"
          />

          <div class="flex justify-end">
            <VaButton preset="primary" @click="submitTicket"> Submit Ticket </VaButton>
          </div>
        </VaForm>
      </VaCardContent>
    </VaCard>

    <!-- System Information -->
    <VaCard>
      <VaCardTitle>
        <h2 class="text-xl font-semibold">System Information</h2>
      </VaCardTitle>
      <VaCardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 class="font-semibold mb-2">Application Details</h4>
            <div class="space-y-1 text-sm">
              <div><strong>Version:</strong> {{ systemInfo.version }}</div>
              <div><strong>Build:</strong> {{ systemInfo.build }}</div>
              <div><strong>Last Updated:</strong> {{ systemInfo.lastUpdated }}</div>
            </div>
          </div>

          <div>
            <h4 class="font-semibold mb-2">Server Status</h4>
            <div class="space-y-1 text-sm">
              <div class="flex items-center gap-2">
                <VaIcon name="circle" size="small" color="success" />
                <span>Database: Online</span>
              </div>
              <div class="flex items-center gap-2">
                <VaIcon name="circle" size="small" color="success" />
                <span>API Services: Online</span>
              </div>
              <div class="flex items-center gap-2">
                <VaIcon name="circle" size="small" color="success" />
                <span>File Storage: Online</span>
              </div>
            </div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VaCard, VaCardContent, VaCardTitle, VaIcon, VaForm, VaSelect, VaInput, VaTextarea, VaButton } from 'vuestic-ui'

const ticket = ref({
  category: '',
  priority: '',
  subject: '',
  description: '',
})

const ticketCategories = [
  'Technical Issue',
  'Account Access',
  'Data Verification',
  'System Bug',
  'Feature Request',
  'Training Request',
]

const priorityOptions = ['Low', 'Medium', 'High', 'Critical']

const systemInfo = ref({
  version: '3.1.0',
  build: '2024.01.20',
  lastUpdated: '20 Jan 2024',
})

const openUserGuide = () => {
  console.log('Opening user guide...')
}

const openVideoTutorials = () => {
  console.log('Opening video tutorials...')
}

const openFAQ = () => {
  console.log('Opening FAQ...')
}

const submitTicket = () => {
  console.log('Submitting support ticket:', ticket.value)
  // Reset form
  ticket.value = {
    category: '',
    priority: '',
    subject: '',
    description: '',
  }
}
</script>
