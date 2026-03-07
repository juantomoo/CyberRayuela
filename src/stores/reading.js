import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import tableroData from '@/data/tablero.json'

export const useReadingStore = defineStore('reading', () => {
  // State
  const currentChapter = ref(parseInt(localStorage.getItem('cr-chapter') || '1'))
  const readingMode = ref(localStorage.getItem('cr-mode') || 'tradicional') // tradicional | rayuela | laberinto
  const history = ref(JSON.parse(localStorage.getItem('cr-history') || '[]'))
  const tableroIndex = ref(parseInt(localStorage.getItem('cr-tablero-idx') || '0'))

  // Tablero sequence
  const tablero = tableroData.sequence

  // Getters
  const totalChapters = computed(() => 155)

  const traditionalMax = computed(() => 56)

  const currentSection = computed(() => {
    const ch = currentChapter.value
    if (ch <= 36) return 'Del lado de allá'
    if (ch <= 56) return 'Del lado de acá'
    return 'De otros lados'
  })

  const nextChapter = computed(() => {
    const ch = currentChapter.value
    if (readingMode.value === 'tradicional') {
      return ch < 56 ? ch + 1 : null
    }
    if (readingMode.value === 'rayuela') {
      const idx = tablero.indexOf(ch)
      if (idx >= 0 && idx < tablero.length - 1) {
        return tablero[idx + 1]
      }
      return null
    }
    // Laberinto: sequential
    return ch < 155 ? ch + 1 : null
  })

  const prevChapter = computed(() => {
    const ch = currentChapter.value
    if (readingMode.value === 'tradicional') {
      return ch > 1 ? ch - 1 : null
    }
    if (readingMode.value === 'rayuela') {
      const idx = tablero.indexOf(ch)
      if (idx > 0) {
        return tablero[idx - 1]
      }
      return null
    }
    return ch > 1 ? ch - 1 : null
  })

  const tableroNext = computed(() => {
    const idx = tablero.indexOf(currentChapter.value)
    if (idx >= 0 && idx < tablero.length - 1) {
      return tablero[idx + 1]
    }
    return null
  })

  const progress = computed(() => {
    if (readingMode.value === 'tradicional') {
      return Math.round((currentChapter.value / 56) * 100)
    }
    if (readingMode.value === 'rayuela') {
      const idx = tablero.indexOf(currentChapter.value)
      return idx >= 0 ? Math.round((idx / tablero.length) * 100) : 0
    }
    return Math.round((currentChapter.value / 155) * 100)
  })

  // Actions
  function goToChapter(num) {
    if (num >= 1 && num <= 155) {
      history.value.push(currentChapter.value)
      if (history.value.length > 50) history.value.shift()
      currentChapter.value = num
      persist()
    }
  }

  function setMode(mode) {
    readingMode.value = mode
    if (mode === 'rayuela') {
      currentChapter.value = 73
      tableroIndex.value = 0
    } else if (mode === 'tradicional') {
      currentChapter.value = 1
    }
    persist()
  }

  function goNext() {
    if (nextChapter.value !== null) {
      goToChapter(nextChapter.value)
    }
  }

  function goPrev() {
    if (prevChapter.value !== null) {
      goToChapter(prevChapter.value)
    }
  }

  function goRandom() {
    const random = Math.floor(Math.random() * 155) + 1
    goToChapter(random)
    return random
  }

  function persist() {
    localStorage.setItem('cr-chapter', String(currentChapter.value))
    localStorage.setItem('cr-mode', readingMode.value)
    localStorage.setItem('cr-history', JSON.stringify(history.value))
    localStorage.setItem('cr-tablero-idx', String(tableroIndex.value))
  }

  return {
    currentChapter,
    readingMode,
    history,
    tablero,
    totalChapters,
    traditionalMax,
    currentSection,
    nextChapter,
    prevChapter,
    tableroNext,
    progress,
    goToChapter,
    setMode,
    goNext,
    goPrev,
    goRandom,
    persist
  }
})
