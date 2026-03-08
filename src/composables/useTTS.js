import { ref, computed, onUnmounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

/* ══════════════════════════════════════════════════════════
   TTS Engine — Google Translate audio (primary)
                + native speechSynthesis (fallback)
   ══════════════════════════════════════════════════════════ */

/* ── Google Translate TTS URL builder ── */
function ttsAudioUrl(text) {
  return (
    'https://translate.google.com/translate_tts?ie=UTF-8&tl=es&client=tw-ob&q=' +
    encodeURIComponent(text)
  )
}

/* ── Split text into ≤ 180-char chunks at sentence boundaries ── */
function splitIntoChunks(text, maxLen = 180) {
  if (!text) return []
  if (text.length <= maxLen) return [text]

  const result = []
  // split at sentence / clause boundaries
  const parts = text.match(/[^.!?;:]+[.!?;:,]?\s*/g) || [text]
  let buf = ''
  for (const part of parts) {
    if ((buf + part).length > maxLen && buf.trim()) {
      result.push(buf.trim())
      buf = part
    } else {
      buf += part
    }
  }
  if (buf.trim()) result.push(buf.trim())

  // further split any still-oversized pieces at word boundaries
  const final = []
  for (const chunk of result) {
    if (chunk.length <= maxLen) {
      final.push(chunk)
    } else {
      let rem = chunk
      while (rem.length > maxLen) {
        let idx = rem.lastIndexOf(' ', maxLen)
        if (idx < 30) idx = maxLen
        final.push(rem.slice(0, idx).trim())
        rem = rem.slice(idx).trim()
      }
      if (rem) final.push(rem)
    }
  }
  return final
}

export function useTTS() {
  const settings = useSettingsStore()
  const synth = window.speechSynthesis

  /* ── Reactive state ── */
  const isPlaying = ref(false)
  const isPaused = ref(false)
  const currentParagraph = ref(-1)
  const currentWordIndex = ref(-1)
  const voices = ref([])

  /* ── Internal ── */
  let audio = null
  let chunks = []       // { text, pIdx, wordStart, wordCount }
  let chunkIdx = 0
  let gen = 0           // generation counter – prevents stale handlers
  let trackingTimer = null
  let trackingStart = 0

  /* ── Native voices (kept for fallback & settings UI) ── */
  function loadVoices() {
    const all = synth.getVoices()
    voices.value = all.filter(v => v.lang.startsWith('es'))
    if (!voices.value.length) voices.value = all
    if (!settings.ttsVoice && voices.value.length) {
      settings.ttsVoice = voices.value[0].name
    }
  }
  if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = loadVoices
  loadVoices()

  const selectedVoice = computed(() =>
    voices.value.find(v => v.name === settings.ttsVoice) || voices.value[0]
  )

  /* ── Build flat chunk list from paragraphs ── */
  function buildChunks(paragraphs) {
    const list = []
    for (let p = 0; p < paragraphs.length; p++) {
      const segs = splitIntoChunks(paragraphs[p])
      let wOff = 0
      for (const seg of segs) {
        const wc = (seg.match(/\S+/g) || []).length
        list.push({ text: seg, pIdx: p, wordStart: wOff, wordCount: wc })
        wOff += wc
      }
    }
    return list
  }

  /* ── Time-based word tracking ──
     Uses audio.currentTime / duration when available, otherwise estimates
     ~2.5 words / second at 1× rate. Polls 12 × / second.                */
  function startTracking(chunk) {
    stopTracking()
    if (!chunk.wordCount) return
    trackingStart = Date.now()

    trackingTimer = setInterval(() => {
      if (!audio || isPaused.value) return

      let progress = 0
      if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
        progress = audio.currentTime / audio.duration
      } else {
        const elapsed = (Date.now() - trackingStart) / 1000
        const estDur = chunk.wordCount / (2.5 * (settings.ttsRate || 1))
        progress = Math.min(elapsed / estDur, 0.99)
      }

      const wi = Math.min(
        Math.floor(progress * chunk.wordCount),
        chunk.wordCount - 1
      )
      currentWordIndex.value = chunk.wordStart + wi
    }, 80)
  }

  function stopTracking() {
    if (trackingTimer) { clearInterval(trackingTimer); trackingTimer = null }
  }

  /* ── Clean up current audio element ── */
  function disposeAudio() {
    if (audio) {
      audio.onended = null
      audio.onerror = null
      audio.oncanplaythrough = null
      audio.pause()
      try { audio.removeAttribute('src'); audio.load() } catch (_) { /* ok */ }
      audio = null
    }
  }

  /* ── Play the chunk at chunkIdx ── */
  function playChunk() {
    if (chunkIdx >= chunks.length || !isPlaying.value) {
      resetState()
      return
    }

    const myGen = gen
    const chunk = chunks[chunkIdx]
    currentParagraph.value = chunk.pIdx
    currentWordIndex.value = chunk.wordStart

    disposeAudio()
    audio = new Audio()

    audio.oncanplaythrough = () => {
      if (myGen !== gen) return
      startTracking(chunk)
    }

    audio.onended = () => {
      if (myGen !== gen) return
      stopTracking()
      chunkIdx++
      playChunk()
    }

    audio.onerror = () => {
      if (myGen !== gen) return
      stopTracking()
      // Google TTS unavailable → try native speechSynthesis
      tryNative(chunk, myGen)
    }

    audio.src = ttsAudioUrl(chunk.text)
    audio.playbackRate = settings.ttsRate

    audio.play().catch(() => {
      if (myGen !== gen) return
      tryNative(chunk, myGen)
    })
  }

  /* ── Native speechSynthesis fallback for a single chunk ── */
  function tryNative(chunk, myGen) {
    const u = new SpeechSynthesisUtterance(chunk.text)
    u.lang = 'es-ES'
    u.rate = settings.ttsRate
    if (selectedVoice.value) u.voice = selectedVoice.value

    let done = false
    const advance = () => {
      if (done || myGen !== gen) return
      done = true
      chunkIdx++
      playChunk()
    }

    // word-level tracking via onboundary (works in some browsers)
    const words = chunk.text.match(/\S+/g) || []
    u.onboundary = (e) => {
      if (e.name !== 'word' || myGen !== gen) return
      for (let i = 0; i < words.length; i++) {
        if (e.charIndex >= chunk.text.indexOf(words[i])) {
          currentWordIndex.value = chunk.wordStart + i
        }
      }
    }

    u.onend = advance
    u.onerror = (e) => { if (e.error !== 'interrupted') advance() }

    synth.speak(u)

    // Watchdog: if native produces no sound, skip after timeout
    const timeout = Math.max(chunk.text.length * 50, 4000)
    setTimeout(() => {
      if (!done && myGen === gen && isPlaying.value) {
        synth.cancel()
        advance()
      }
    }, timeout)
  }

  /* ════════════════  Public API  ════════════════ */

  function speakParagraphs(paragraphs) {
    stop()
    if (!paragraphs?.length) return

    gen++
    chunks = buildChunks(paragraphs)
    chunkIdx = 0
    isPlaying.value = true
    isPaused.value = false
    playChunk()
  }

  function speak(text, paragraphIndex = -1) {
    speakParagraphs(text ? [text] : [])
    if (paragraphIndex >= 0) currentParagraph.value = paragraphIndex
  }

  function pause() {
    if (!isPlaying.value || isPaused.value) return
    if (audio && !audio.paused) audio.pause()
    else synth.pause()
    stopTracking()
    isPaused.value = true
  }

  function resume() {
    if (!isPaused.value) return
    isPaused.value = false
    if (audio && audio.src && audio.paused) {
      audio.play().catch(() => {})
      const chunk = chunks[chunkIdx]
      if (chunk) startTracking(chunk)
    } else {
      synth.resume()
    }
  }

  function stop() {
    gen++
    stopTracking()
    disposeAudio()
    synth.cancel()
    resetState()
  }

  function resetState() {
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

  onUnmounted(() => { stop() })

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
