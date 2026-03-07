import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const darkMode = ref(localStorage.getItem('cr-dark') !== 'false')
  const ttsVoice = ref(localStorage.getItem('cr-tts-voice') || '')
  const ttsRate = ref(parseFloat(localStorage.getItem('cr-tts-rate') || '1'))
  const sidebarOpen = ref(false)

  watch(darkMode, (v) => {
    localStorage.setItem('cr-dark', String(v))
    document.documentElement.classList.toggle('light-mode', !v)
  }, { immediate: true })

  watch(ttsVoice, (v) => localStorage.setItem('cr-tts-voice', v))
  watch(ttsRate, (v) => localStorage.setItem('cr-tts-rate', String(v)))

  function toggleDark() {
    darkMode.value = !darkMode.value
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  return { darkMode, ttsVoice, ttsRate, sidebarOpen, toggleDark, toggleSidebar }
})
