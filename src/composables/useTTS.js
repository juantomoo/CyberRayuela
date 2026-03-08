import { ref, computed, onUnmounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

export function useTTS() {
  const settings = useSettingsStore()
  const synth = window.speechSynthesis
  const isPlaying = ref(false)
  const isPaused = ref(false)
  const voices = ref([])
  const currentParagraph = ref(-1)

  // Chrome bug: speechSynthesis silently cancels after ~15s of speaking.
  // Fix: pause/resume every 14s to keep it alive.
  let keepAliveTimer = null
  function startKeepAlive() {
    stopKeepAlive()
    keepAliveTimer = setInterval(() => {
      if (synth.speaking && !synth.paused) {
        synth.pause()
        synth.resume()
      }
    }, 14000)
  }
  function stopKeepAlive() {
    if (keepAliveTimer) { clearInterval(keepAliveTimer); keepAliveTimer = null }
  }

  function loadVoices() {
    const allVoices = synth.getVoices()
    voices.value = allVoices.filter(v => v.lang.startsWith('es'))
    // If no Spanish voices found, include all voices as fallback
    if (voices.value.length === 0) {
      voices.value = allVoices
    }
    if (!settings.ttsVoice && voices.value.length > 0) {
      settings.ttsVoice = voices.value[0].name
    }
  }

  // Voices load async in some browsers
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices
  }
  loadVoices()

  const selectedVoice = computed(() => {
    return voices.value.find(v => v.name === settings.ttsVoice) || voices.value[0]
  })

  function speak(text, paragraphIndex = -1) {
    stop()
    if (!text) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'es-ES'
    utterance.rate = settings.ttsRate
    if (selectedVoice.value) {
      utterance.voice = selectedVoice.value
    }

    currentParagraph.value = paragraphIndex

    utterance.onstart = () => { startKeepAlive() }
    utterance.onend = () => {
      stopKeepAlive()
      isPlaying.value = false
      isPaused.value = false
      currentParagraph.value = -1
    }
    utterance.onerror = (e) => {
      if (e.error === 'interrupted') return // normal on stop()
      stopKeepAlive()
      isPlaying.value = false
      isPaused.value = false
      currentParagraph.value = -1
    }

    isPlaying.value = true
    synth.speak(utterance)
  }

  function speakParagraphs(paragraphs) {
    // synth.cancel() is synchronous — no need to defer.
    // IMPORTANT: Chrome requires synth.speak() in the same call stack as the
    // user gesture click. A setTimeout would break that requirement and cause
    // silent failure.
    synth.cancel()
    isPlaying.value = false
    isPaused.value = false
    currentParagraph.value = -1
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
        return
      }

      const text = paragraphs[index]
      if (!text.trim()) { index++; speakNext(); return }

      currentParagraph.value = index
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'es-ES'
      utterance.rate = settings.ttsRate
      if (selectedVoice.value) {
        utterance.voice = selectedVoice.value
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
  }

  function togglePlayPause(text) {
    if (isPlaying.value && !isPaused.value) {
      pause()
    } else if (isPaused.value) {
      resume()
    } else {
      speak(text)
    }
  }

  onUnmounted(() => {
    stopKeepAlive()
    stop()
  })

  return {
    isPlaying,
    isPaused,
    voices,
    currentParagraph,
    selectedVoice,
    speak,
    speakParagraphs,
    pause,
    resume,
    stop,
    togglePlayPause
  }
}
