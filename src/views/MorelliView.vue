<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="font-display text-xl text-neon-orange tracking-wider mb-1">EL CUADERNO DE MORELLI</h2>
        <p class="font-mono text-xs text-cyber-text-dim">Tus notas, reflexiones y conexiones</p>
      </div>
      <div class="flex gap-2">
        <button @click="showNewNote = true" class="btn-neon text-xs">+ Nueva nota</button>
        <button @click="exportAll" class="btn-neon text-xs px-3" title="Exportar notas">↓</button>
        <label class="btn-neon text-xs px-3 cursor-pointer" title="Importar notas">
          ↑
          <input type="file" accept=".json" class="hidden" @change="importFile" />
        </label>
      </div>
    </div>
    
    <!-- New note form -->
    <div v-if="showNewNote" class="mb-8 p-6 border border-neon-orange/30 rounded-lg bg-cyber-dark/50">
      <h3 class="font-display text-sm text-neon-orange mb-4">NUEVA NOTA</h3>
      <input v-model="noteTitle" placeholder="Título"
        class="w-full bg-transparent border-b border-cyber-border text-cyber-text font-mono pb-2 mb-4 focus:border-neon-orange focus:outline-none" />
      <textarea v-model="noteText" placeholder="Escribe tu reflexión..."
        class="w-full bg-transparent border border-cyber-border rounded text-cyber-text p-3 h-32 focus:border-neon-orange focus:outline-none resize-none mb-4"></textarea>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <label class="font-mono text-xs text-cyber-text-dim">Capítulo:</label>
          <select v-model.number="noteChapter"
            class="bg-cyber-dark border border-cyber-border text-cyber-text font-mono text-sm px-2 py-1 rounded focus:border-neon-orange focus:outline-none">
            <option :value="null">General</option>
            <option v-for="n in 155" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
        <div class="flex-1"></div>
        <button @click="showNewNote = false" class="font-mono text-xs text-cyber-text-dim hover:text-neon-pink">Cancelar</button>
        <button @click="saveNote" class="btn-neon text-xs">Guardar</button>
      </div>
    </div>
    
    <!-- Stats -->
    <div class="flex gap-6 mb-8 font-mono text-xs text-cyber-text-dim">
      <span>{{ notesStore.notes.length }} notas totales</span>
      <span>{{ chaptersWithNotes }} capítulos anotados</span>
    </div>
    
    <!-- Notes list -->
    <div v-if="notesStore.notes.length === 0" class="text-center py-16">
      <p class="text-6xl mb-4 opacity-30">📔</p>
      <p class="font-mono text-sm text-cyber-text-dim">El cuaderno está vacío.</p>
      <p class="font-mono text-xs text-cyber-text-dim mt-1">
        Como Morelli, empieza a escribir tus notas mientras lees.
      </p>
    </div>
    
    <div v-else class="space-y-4">
      <div v-for="note in notesStore.notes" :key="note.id"
        class="p-4 border border-cyber-border/50 rounded-lg bg-cyber-dark/30 group hover:border-cyber-border transition-colors">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="font-mono text-sm text-neon-orange">{{ note.title }}</h3>
              <router-link v-if="note.chapter" :to="{ name: 'reader', params: { chapter: note.chapter } }"
                class="font-mono text-xs text-neon-cyan hover:underline">
                Cap. {{ note.chapter }}
              </router-link>
              <span v-else class="font-mono text-xs text-cyber-text-dim">General</span>
            </div>
            <p class="text-sm text-cyber-text leading-relaxed">{{ note.text }}</p>
            <div class="mt-2 font-mono text-xs text-cyber-text-dim">
              {{ formatDate(note.createdAt) }}
            </div>
          </div>
          <button @click="notesStore.deleteNote(note.id)"
            class="opacity-0 group-hover:opacity-100 text-cyber-text-dim hover:text-neon-pink text-sm transition-opacity">
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useNotesStore } from '@/stores/notes'

const notesStore = useNotesStore()

const showNewNote = ref(false)
const noteTitle = ref('')
const noteText = ref('')
const noteChapter = ref(null)

const chaptersWithNotes = computed(() => {
  const chs = new Set(notesStore.notes.filter(n => n.chapter).map(n => n.chapter))
  return chs.size
})

function saveNote() {
  if (noteText.value.trim()) {
    notesStore.addNote({
      title: noteTitle.value,
      text: noteText.value,
      chapter: noteChapter.value
    })
    noteTitle.value = ''
    noteText.value = ''
    noteChapter.value = null
    showNewNote.value = false
  }
}

function exportAll() {
  const data = notesStore.exportNotes()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `morelli-notas-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function importFile(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    notesStore.importNotes(reader.result)
  }
  reader.readAsText(file)
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>
