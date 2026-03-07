import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref(JSON.parse(localStorage.getItem('cr-notes') || '[]'))

  const notesByChapter = computed(() => {
    const map = {}
    for (const note of notes.value) {
      if (note.chapter) {
        if (!map[note.chapter]) map[note.chapter] = []
        map[note.chapter].push(note)
      }
    }
    return map
  })

  function addNote({ title, text, chapter }) {
    const note = {
      id: Date.now(),
      title: title || 'Sin título',
      text,
      chapter: chapter || null,
      createdAt: new Date().toISOString()
    }
    notes.value.unshift(note)
    persist()
    return note
  }

  function deleteNote(id) {
    notes.value = notes.value.filter(n => n.id !== id)
    persist()
  }

  function updateNote(id, updates) {
    const note = notes.value.find(n => n.id === id)
    if (note) {
      Object.assign(note, updates)
      persist()
    }
  }

  function getNotesForChapter(ch) {
    return notes.value.filter(n => n.chapter === ch)
  }

  function exportNotes() {
    return JSON.stringify(notes.value, null, 2)
  }

  function importNotes(json) {
    try {
      const imported = JSON.parse(json)
      if (Array.isArray(imported)) {
        notes.value = [...imported, ...notes.value]
        persist()
        return true
      }
    } catch { /* ignore */ }
    return false
  }

  function persist() {
    localStorage.setItem('cr-notes', JSON.stringify(notes.value))
  }

  return {
    notes,
    notesByChapter,
    addNote,
    deleteNote,
    updateNote,
    getNotesForChapter,
    exportNotes,
    importNotes
  }
})
