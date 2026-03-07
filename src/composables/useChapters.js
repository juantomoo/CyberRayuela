import { ref } from 'vue'
import { marked } from 'marked'

// Configure marked for clean output
marked.setOptions({
  breaks: true,
  gfm: true
})

// Cache loaded chapters
const cache = new Map()

export function useChapters() {
  const chapterText = ref('')
  const chapterHtml = ref('')
  const loading = ref(false)
  const error = ref(null)

  async function loadChapter(num) {
    const n = parseInt(num)
    if (isNaN(n) || n < 1 || n > 155) {
      error.value = `Capítulo inválido: ${num}`
      return
    }

    loading.value = true
    error.value = null

    const padded = String(n).padStart(3, '0')
    const key = padded

    try {
      if (cache.has(key)) {
        chapterText.value = cache.get(key)
      } else {
        const response = await fetch(`/chapters/${padded}.md`)
        if (!response.ok) throw new Error(`No se pudo cargar el capítulo ${n}`)
        const text = await response.text()
        cache.set(key, text)
        chapterText.value = text
      }

      chapterHtml.value = marked(chapterText.value)
    } catch (err) {
      error.value = err.message
      chapterText.value = ''
      chapterHtml.value = ''
    } finally {
      loading.value = false
    }
  }

  function getPlainText() {
    // Strip markdown formatting
    return chapterText.value
      .replace(/^#\s+.*$/gm, '')
      .replace(/^>\s+.*$/gm, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .trim()
  }

  function getParagraphs() {
    return getPlainText()
      .split(/\n\s*\n/)
      .map(p => p.replace(/\n/g, ' ').trim())
      .filter(p => p.length > 0)
  }

  return {
    chapterText,
    chapterHtml,
    loading,
    error,
    loadChapter,
    getPlainText,
    getParagraphs
  }
}
