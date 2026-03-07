import { ref, computed, onUnmounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

export function useTTS() {
  const settings = useSettingsStore()
  const synth = window.speechSynthesis
  const isPlaying = ref(false)
  const isPaused = ref(false)
  const voices = ref([])
  const currentParagraph = ref(-1)

  function loadVoices() {
    const allVoices = synth.getVoices()
    voices.value = allVoices.filter(v => v.lang.startsWith('es'))
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

    utterance.onend = () => {
      isPlaying.value = false
      isPaused.value = false
      currentParagraph.value = -1
    }

    utterance.onerror = () => {
      isPlaying.value = false
      isPaused.value = false
      currentParagraph.value = -1
    }

    synth.speak(utterance)
    isPlaying.value = true
  }

  function speakParagraphs(paragraphs) {
    stop()
    if (!paragraphs || paragraphs.length === 0) return

    let index = 0
    isPlaying.value = true

    function speakNext() {
      if (index >= paragraphs.length || !isPlaying.value) {
        isPlaying.value = false
        currentParagraph.value = -1
        return
      }

      const text = paragraphs[index]
      currentParagraph.value = index
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'es-ES'
      utterance.rate = settings.ttsRate
      if (selectedVoice.value) {
        utterance.voice = selectedVoice.value
      }

      utterance.onend = () => {
        index++
        speakNext()
      }

      utterance.onerror = () => {
        index++
        speakNext()
      }

      synth.speak(utterance)
    }

    speakNext()
  }

  function pause() {
    if (isPlaying.value) {
      synth.pause()
      isPaused.value = true
    }
  }

  function resume() {
    if (isPaused.value) {
      synth.resume()
      isPaused.value = false
    }
  }

  function stop() {
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
