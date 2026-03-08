<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <div class="mb-6">
      <h2 class="font-display text-xl text-neon-pink tracking-wider mb-1">ANÁLISIS LITERARIO · IA</h2>
      <p class="font-mono text-xs text-cyber-text-dim">
        Conversa con una IA especialista en Cortázar y <em>Rayuela</em>
      </p>
    </div>

    <!-- Chapter context selector -->
    <div class="flex items-center gap-3 mb-6">
      <label class="font-mono text-xs text-cyber-text-dim">Contexto:</label>
      <select v-model.number="selectedChapter"
        class="bg-cyber-dark border border-cyber-border text-cyber-text font-mono text-sm px-2 py-1 rounded focus:border-neon-pink focus:outline-none">
        <option :value="null">Sin capítulo</option>
        <option v-for="n in 155" :key="n" :value="n">Capítulo {{ n }}</option>
      </select>
      <span v-if="selectedChapter" class="font-mono text-xs text-neon-cyan">
        Cap. {{ selectedChapter }} cargado como contexto
      </span>
      <div class="flex-1"></div>
      <button @click="clearChat" class="font-mono text-xs text-cyber-text-dim hover:text-neon-pink">
        Limpiar chat
      </button>
    </div>

    <!-- Messages -->
    <div ref="chatContainer" class="space-y-4 mb-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
      <div v-if="messages.length === 0" class="text-center py-12">
        <p class="text-5xl mb-3 opacity-30">🤖</p>
        <p class="font-mono text-sm text-cyber-text-dim mb-4">
          Pregúntame sobre <em>Rayuela</em>, sus personajes, estructura o simbolismo.
        </p>
        <div class="flex flex-wrap justify-center gap-2">
          <button v-for="s in suggestions" :key="s" @click="submitMessage(s)"
            class="font-mono text-xs text-neon-cyan border border-neon-cyan/30 px-3 py-1.5 rounded hover:bg-neon-cyan/10 transition-colors">
            {{ s }}
          </button>
        </div>
      </div>

      <div v-for="(msg, i) in messages" :key="i"
        :class="[
          'p-4 rounded-lg font-mono text-sm leading-relaxed',
          msg.role === 'user'
            ? 'bg-neon-cyan/10 border border-neon-cyan/20 ml-8'
            : 'bg-neon-pink/5 border border-neon-pink/20 mr-8'
        ]">
        <div class="flex items-center gap-2 mb-2">
          <span :class="msg.role === 'user' ? 'text-neon-cyan' : 'text-neon-pink'" class="text-xs font-display tracking-wider">
            {{ msg.role === 'user' ? 'TÚ' : 'IA' }}
          </span>
        </div>
        <div v-html="renderMarkdown(msg.text)" class="ai-response"></div>
      </div>

      <div v-if="loading" class="p-4 rounded-lg bg-neon-pink/5 border border-neon-pink/20 mr-8">
        <span class="text-neon-pink text-xs font-display tracking-wider">IA</span>
        <div class="mt-2 flex gap-1">
          <span class="w-2 h-2 bg-neon-pink rounded-full animate-bounce" style="animation-delay:0ms"></span>
          <span class="w-2 h-2 bg-neon-pink rounded-full animate-bounce" style="animation-delay:150ms"></span>
          <span class="w-2 h-2 bg-neon-pink rounded-full animate-bounce" style="animation-delay:300ms"></span>
        </div>
      </div>
    </div>

    <!-- Input -->
    <form @submit.prevent="submitMessage(userInput)" class="flex gap-2">
      <input v-model="userInput" :disabled="loading" placeholder="Escribe tu pregunta sobre Rayuela..."
        class="flex-1 bg-cyber-dark border border-cyber-border text-cyber-text font-mono px-4 py-3 rounded-lg focus:border-neon-pink focus:outline-none disabled:opacity-50" />
      <button type="submit" :disabled="loading || !userInput.trim()" class="btn-neon px-6 disabled:opacity-30">
        Enviar
      </button>
    </form>

    <!-- Error -->
    <p v-if="error" class="mt-3 font-mono text-xs text-neon-pink">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { useGemini } from '@/composables/useGemini'
import { useChapters } from '@/composables/useChapters'
import { marked } from 'marked'

const { messages, loading, error, sendMessage, clearMessages } = useGemini()
const { loadChapter, getPlainText } = useChapters()

const userInput = ref('')
const selectedChapter = ref(null)
const chatContainer = ref(null)

const suggestions = [
  '¿Quién es La Maga?',
  '¿Qué significa el Tablero de Dirección?',
  '¿Por qué hay capítulos "prescindibles"?',
  'Analiza el simbolismo del Club de la Serpiente',
  '¿Quién es Morelli?'
]

async function submitMessage(text) {
  if (!text?.trim()) return
  userInput.value = ''

  let chapterContext = null
  if (selectedChapter.value) {
    await loadChapter(selectedChapter.value)
    const plain = getPlainText()
    if (plain) {
      chapterContext = { number: selectedChapter.value, text: plain.slice(0, 3000) }
    }
  }

  await sendMessage(text, chapterContext)
  await nextTick()
  scrollToBottom()
}

function clearChat() {
  clearMessages()
}

function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

function renderMarkdown(text) {
  return marked.parse(text, { breaks: true })
}

watch(messages, () => {
  nextTick(scrollToBottom)
}, { deep: true })
</script>

<style scoped>
.ai-response :deep(p) {
  margin-bottom: 0.5rem;
}
.ai-response :deep(strong) {
  color: var(--color-neon-orange);
}
.ai-response :deep(em) {
  color: var(--color-neon-cyan);
}
.ai-response :deep(ul), .ai-response :deep(ol) {
  margin-left: 1rem;
  margin-bottom: 0.5rem;
}
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: var(--color-cyber-border);
  border-radius: 2px;
}
</style>
