import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const isAuthenticated = computed(() => accessToken.value !== null)

  function setToken(token: string) {
    accessToken.value = token
    localStorage.setItem('accessToken', token)
  }

  function clear() {
    accessToken.value = null
    localStorage.removeItem('accessToken')
  }

  return { accessToken, isAuthenticated, setToken, clear }
})
