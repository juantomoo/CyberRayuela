<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <!-- Chapter header -->
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <div class="font-mono text-xs text-cyber-text-dim uppercase tracking-wider mb-1">
          {{ reading.currentSection }} · {{ reading.readingMode }}
        </div>
        <h2 class="font-display text-xl text-neon-cyan tracking-wider">
          Capítulo {{ reading.currentChapter }}
        </h2>
      </div>
      
      <div class="flex items-center gap-3">
        <!-- Chapter selector -->
        <select v-model.number="jumpTo"
          class="bg-cyber-dark border border-cyber-border text-cyber-text font-mono text-sm px-3 py-1.5 rounded focus:border-neon-cyan focus:outline-none">
          <option v-for="n in 155" :key="n" :value="n">Cap. {{ n }}</option>
        </select>
        <button @click="navigateTo(jumpTo)" class="btn-neon text-xs px-3 py-1.5">IR</button>
        
        <!-- Mode switcher -->
        <select v-model="reading.readingMode"
          class="bg-cyber-dark border border-cyber-border text-cyber-text font-mono text-sm px-3 py-1.5 rounded focus:border-neon-pink focus:outline-none">
          <option value="tradicional">Tradicional</option>
          <option value="rayuela">Rayuela</option>
          <option value="laberinto">Laberinto</option>
        </select>
      </div>
    </div>
    
    <!-- Progress bar -->
    <div class="mb-6">
      <div class="h-1 bg-cyber-border rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-neon-cyan to-neon-pink rounded-full transition-all duration-500"
          :style="{ width: reading.progress + '%' }"></div>
      </div>
      <div class="flex justify-between mt-1 font-mono text-xs text-cyber-text-dim">
        <span>{{ reading.progress }}%</span>
        <span v-if="reading.readingMode === 'rayuela'">
          Tablero: pos. {{ tableroPosition }} de {{ reading.tablero.length }}
        </span>
        <span v-else>
          Cap. {{ reading.currentChapter }} de {{ reading.readingMode === 'tradicional' ? 56 : 155 }}
        </span>
      </div>
    </div>
    
    <!-- TTS Controls -->
    <TTSControls :paragraphs="paragraphs" :currentParagraph="tts.currentParagraph.value"
      :isPlaying="tts.isPlaying.value" :isPaused="tts.isPaused.value" :voices="tts.voices.value"
      @play="playTTS" @stop="tts.stop()" />
    
    <!-- Chapter content -->
    <div v-if="chapters.loading.value" class="text-center py-20">
      <div class="inline-block w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-4 font-mono text-sm text-cyber-text-dim">Cargando capítulo...</p>
    </div>
    
    <div v-else-if="chapters.error.value" class="text-center py-20">
      <p class="text-neon-pink font-mono">{{ chapters.error.value }}</p>
    </div>
    
    <article v-else class="chapter-content mb-12">
      <div v-for="(para, idx) in renderedParagraphs" :key="idx"
        :class="{ 'tts-active': tts.currentParagraph.value === idx }"
        :ref="el => { if (tts.currentParagraph.value === idx) scrollToActive(el) }"
        v-html="para">
      </div>
    </article>
    
    <!-- Navigation buttons -->
    <div class="border-t border-cyber-border pt-6 mb-8">
      <!-- Tablero hint for Rayuela mode -->
      <div v-if="reading.readingMode === 'rayuela' && reading.tableroNext" 
        class="mb-4 p-4 border border-neon-pink/30 rounded-lg bg-cyber-dark/50 text-center">
        <p class="font-mono text-sm text-neon-pink">
          Según el Tablero de Dirección →
          <button @click="navigateTo(reading.tableroNext)" class="underline hover:text-neon-cyan transition-colors font-bold">
            Capítulo {{ reading.tableroNext }}
          </button>
        </p>
      </div>
      
      <!-- Loop infinito -->
      <div v-if="reading.readingMode === 'rayuela' && isInfiniteLoop" 
        class="mb-4 p-4 border border-neon-orange/30 rounded-lg bg-cyber-dark/50 text-center">
        <p class="font-mono text-sm text-neon-orange flicker">
          ∞ BUCLE INFINITO — Capítulos 131 ↔ 58 — Como Cortázar lo diseñó ∞
        </p>
      </div>
      
      <div class="flex justify-between items-center gap-4">
        <button v-if="reading.prevChapter"
          @click="navigateTo(reading.prevChapter)"
          class="btn-neon flex items-center gap-2">
          <span>←</span> Cap. {{ reading.prevChapter }}
        </button>
        <div v-else></div>
        
        <button v-if="reading.nextChapter"
          @click="navigateTo(reading.nextChapter)"
          class="btn-neon btn-neon-pink flex items-center gap-2">
          Cap. {{ reading.nextChapter }} <span>→</span>
        </button>
        <div v-else-if="reading.readingMode === 'tradicional'" class="text-center">
          <p class="font-mono text-sm text-neon-cyan">★ ★ ★</p>
          <p class="font-mono text-xs text-cyber-text-dim mt-1">FIN del primer libro</p>
        </div>
      </div>
    </div>
    
    <!-- Chapter notes -->
    <div class="border-t border-cyber-border pt-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-display text-sm text-neon-orange tracking-wider">NOTAS · CAPÍTULO {{ reading.currentChapter }}</h3>
        <button @click="showNoteForm = !showNoteForm" class="btn-neon text-xs px-3 py-1">
          {{ showNoteForm ? 'Cerrar' : '+ Nota' }}
        </button>
      </div>
      
      <div v-if="showNoteForm" class="mb-4 p-4 border border-cyber-border rounded-lg bg-cyber-dark/50">
        <input v-model="newNoteTitle" placeholder="Título de la nota" 
          class="w-full bg-transparent border-b border-cyber-border text-cyber-text font-mono text-sm pb-2 mb-3 focus:border-neon-cyan focus:outline-none" />
        <textarea v-model="newNoteText" placeholder="Tu reflexión sobre este capítulo..."
          class="w-full bg-transparent border border-cyber-border rounded text-cyber-text text-sm p-3 h-24 focus:border-neon-cyan focus:outline-none resize-none"></textarea>
        <button @click="saveNote" class="btn-neon text-xs mt-3">Guardar</button>
      </div>
      
      <div v-for="note in chapterNotes" :key="note.id" class="mb-3 p-3 border border-cyber-border/50 rounded bg-cyber-dark/30">
        <div class="flex justify-between items-start">
          <h4 class="font-mono text-sm text-neon-cyan">{{ note.title }}</h4>
          <button @click="notesStore.deleteNote(note.id)" class="text-cyber-text-dim hover:text-neon-pink text-xs">✕</button>
        </div>
        <p class="text-sm text-cyber-text mt-1">{{ note.text }}</p>
        <div class="font-mono text-xs text-cyber-text-dim mt-2">{{ formatDate(note.createdAt) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReadingStore } from '@/stores/reading'
import { useNotesStore } from '@/stores/notes'
import { useChapters } from '@/composables/useChapters'
import { useTTS } from '@/composables/useTTS'
import { marked } from 'marked'
import TTSControls from '@/components/TTSControls.vue'

const route = useRoute()
const router = useRouter()
const reading = useReadingStore()
const notesStore = useNotesStore()
const chapters = useChapters()
const tts = useTTS()

const jumpTo = ref(reading.currentChapter)
const showNoteForm = ref(false)
const newNoteTitle = ref('')
const newNoteText = ref('')

// Computed
const paragraphs = computed(() => chapters.getParagraphs())

const renderedParagraphs = computed(() => {
  const plain = chapters.getPlainText()
  if (!plain) return []
  return plain.split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
})

const chapterNotes = computed(() => notesStore.getNotesForChapter(reading.currentChapter))

const tableroPosition = computed(() => {
  const idx = reading.tablero.indexOf(reading.currentChapter)
  return idx >= 0 ? idx + 1 : '?'
})

const isInfiniteLoop = computed(() => {
  return (reading.currentChapter === 131 || reading.currentChapter === 58) && reading.readingMode === 'rayuela'
})

// Methods
function navigateTo(ch) {
  reading.goToChapter(ch)
  jumpTo.value = ch
  router.replace({ name: 'reader', params: { chapter: ch } })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function playTTS() {
  const paras = paragraphs.value
  if (paras.length > 0) {
    tts.speakParagraphs(paras)
  }
}

function scrollToActive(el) {
  if (el) {
    nextTick(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }
}

function saveNote() {
  if (newNoteText.value.trim()) {
    notesStore.addNote({
      title: newNoteTitle.value || `Nota - Cap. ${reading.currentChapter}`,
      text: newNoteText.value,
      chapter: reading.currentChapter
    })
    newNoteTitle.value = ''
    newNoteText.value = ''
    showNoteForm.value = false
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Load chapter on mount and route change
async function loadCurrentChapter() {
  const ch = route.params.chapter ? parseInt(route.params.chapter) : reading.currentChapter
  if (ch >= 1 && ch <= 155) {
    reading.currentChapter = ch
    jumpTo.value = ch
    await chapters.loadChapter(ch)
    reading.persist()
  }
}

watch(() => route.params.chapter, loadCurrentChapter)
onMounted(loadCurrentChapter)
</script>
