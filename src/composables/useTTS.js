import { ref, computed, onUnmounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

/**
 * Build a map of word positions from a plain-text string.
 * Each entry: { index, start, end }
 * "index" is the 0-based ordinal word number.
 */
function buildWordMap(text) {
  const map = []
  const re = /\S+/g
  let m
  while ((m = re.exec(text)) !== null) {
    map.push({ index: map.length, start: m.index, end: m.index + m[0].length })
  }
  return map
}

export function useTTS() {
  const settings = useSettingsStore()
  const synth = window.speechSynthesis
  const isPlaying = ref(false)
  const isPaused = ref(false)
  const voices = ref([])
  const currentParagraph = ref(-1)
  const currentWordIndex = ref(-1)  // word ordinal inside current paragraph

  // Chrome bug: speechSynthesis silently cancels after ~15 s.
  let keepAliveTimer = null
  function startKeepAlive() {
    stopKeepAlive()
    keepAliveTimer = setInterval(() => {
      if (synth.speaking && !synth.paused) { synth.pause(); synth.resume() }
    }, 14000)
  }
  function stopKeepAlive() {
    if (keepAliveTimer) { clearInterval(keepAliveTimer); keepAliveTimer = null }
  }

  /* ── voices ── */
  function loadVoices() {
    const all = synth.getVoices()
    voices.value = all.filter(v => v.lang.startsWith('es'))
    if (voices.value.length === 0) voices.value = all
    if (!settings.ttsVoice && voices.value.length > 0) {
      settings.ttsVoice = voices.value[0].name
    }
  }
  if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = loadVoices
  loadVoices()

  const selectedVoice = computed(() =>
    voices.value.find(v => v.name === settings.ttsVoice) || voices.value[0]
  )

  /* ── speak a single text ── */
  function speak(text, paragraphIndex = -1) {
    stop()
    if (!text) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'es-ES'
    utterance.rate = settings.ttsRate
    if (selectedVoice.value) utterance.voice = selectedVoice.value

    currentParagraph.value = paragraphIndex
    currentWordIndex.value = 0

    const wordMap = buildWordMap(text)

    utterance.onboundary = (e) => {
      if (e.name === 'word') {
        const ci = e.charIndex
        for (let i = 0; i < wordMap.length; i++) {
          if (ci >= wordMap[i].start && ci < wordMap[i].end) {
            currentWordIndex.value = i
            break
          }
        }
      }
    }
    utterance.onstart = () => { startKeepAlive() }
    utterance.onend = () => {
      stopKeepAlive()
      isPlaying.value = false
      isPaused.value = false
      currentParagraph.value = -1
      currentWordIndex.value = -1
    }
    utterance.onerror = (e) => {
      if (e.error === 'interrupted') return
      stopKeepAlive()
      isPlaying.value = false
      isPaused.value = false
      currentParagraph.value = -1
      currentWordIndex.value = -1
    }

    isPlaying.value = true
    synth.speak(utterance)
  }

  /* ── speak paragraph-by-paragraph with word tracking ── */
  function speakParagraphs(paragraphs) {
    // IMPORTANT: synth.cancel + synth.speak MUST run synchronously in the
    // same call-stack as the user gesture (click).  Do NOT wrap in setTimeout
    // or await — Chrome blocks speechSynthesis.speak when outside a gesture.
    synth.cancel()
    isPlaying.value = false
    isPaused.value = false
    currentParagraph.value = -1
    currentWordIndex.value = -1
    stopKeepAlive()

    if (!paragraphs || paragraphs.length === 0) return

    let index = 0
    isPlaying.value = true
    startKeepAlive()

    function speakNext() {
      if (index >= paragraphs.length || !isPlaying.value) {
        stopKeepAlive()
        isPlaying.value = false
        currentParagraph.value = -1
        currentWordIndex.value = -1
        return
      }

      const text = paragraphs[index]
      if (!text.trim()) { index++; speakNext(); return }

      currentParagraph.value = index
      currentWordIndex.value = 0

      const wordMap = buildWordMap(text)

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'es-ES'
      utterance.rate = settings.ttsRate
      if (selectedVoice.value) utterance.voice = selectedVoice.value

      // Word-by-word highlight via the boundary event
      utterance.onboundary = (e) => {
        if (e.name === 'word') {
          const ci = e.charIndex
          for (let i = 0; i < wordMap.length; i++) {
            if (ci >= wordMap[i].start && ci < wordMap[i].end) {
              currentWordIndex.value = i
              break
            }
          }
        }
      }

      utterance.onend = () => {
        if (!isPlaying.value) return
        index++
        speakNext()
      }
      utterance.onerror = (e) => {
        if (e.error === 'interrupted') return
        index++
        if (isPlaying.value) speakNext()
      }

      synth.speak(utterance)
    }

    speakNext()
  }

  /* ── controls ── */
  function pause() {
    if (isPlaying.value && !isPaused.value) {
      stopKeepAlive()
      synth.pause()
      isPaused.value = true
    }
  }

  function resume() {
    if (isPaused.value) {
      synth.resume()
      isPaused.value = false
      startKeepAlive()
    }
  }

  function stop() {
    stopKeepAlive()
    synth.cancel()
    isPlaying.value = false
    isPaused.value = false
    currentParagraph.value = -1
    currentWordIndex.value = -1
  }

  function togglePlayPause(text) {
    if (isPlaying.value && !isPaused.value) pause()
    else if (isPaused.value) resume()
    else speak(text)
  }

  onUnmounted(() => { stopKeepAlive(); stop() })

  return {
    isPlaying,
    isPaused,
    voices,
    currentParagraph,
    currentWordIndex,
    selectedVoice,
    speak,
    speakParagraphs,
    pause,
    resume,
    stop,
    togglePlayPause
  }
}
