import { ref } from 'vue'

// ─── SYSTEM PROMPT ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Eres un experto en literatura latinoamericana del siglo XX, especializado en la obra de Julio Cortázar, particularmente en "Rayuela" (1963). Tu conocimiento abarca:

- La estructura experimental de la novela (Tablero de Dirección, los 155 capítulos, las tres partes)
- Los personajes: Horacio Oliveira, la Maga (Lucía), Gregorovius, Traveler, Talita, Gekrepten, Berthe Trépat, Morelli, Rocamadour, el Club de la Serpiente
- Los temas: la búsqueda metafísica, el azar, la anti-novela, el lector cómplice, París vs Buenos Aires, el jazz como lenguaje
- El contexto del Boom Latinoamericano y las influencias surrealistas
- Las referencias musicales (jazz, tango, música clásica) presentes en toda la obra
- La filosofía detrás de la novela: existencialismo, patafísica, el sentido del absurdo

Respondes siempre en español, con profundidad académica pero accesible. Usas citas textuales cuando es pertinente. Conectas los capítulos entre sí mostrando los hilos narrativos.

Cuando analices un capítulo, menciona su posición en el Tablero de Dirección y cómo se conecta con los capítulos anterior y siguiente en la lectura salteada.`

// ─── PROVIDERS ───────────────────────────────────────────────────────────────

function makeGeminiProvider(apiKey) {
  if (!apiKey) return null
  return {
    name: 'Gemini',
    async send(history, userMessage, chapterContext) {
      let fullPrompt = ''
      if (chapterContext) {
        fullPrompt += `[Contexto: Capítulo ${chapterContext.number}]\n[Fragmento:\n${chapterContext.text?.substring(0, 2000) || ''}...]\n\n`
      }
      fullPrompt += userMessage

      const contents = [
        ...history.slice(-10).map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        })),
        { role: 'user', parts: [{ text: fullPrompt }] }
      ]

      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents,
            generationConfig: { temperature: 0.7, topP: 0.9, maxOutputTokens: 2048 }
          })
        }
      )
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        const e = new Error(err.error?.message || `Gemini error ${resp.status}`)
        e.status = resp.status
        throw e
      }
      const data = await resp.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta'
    }
  }
}

function makeGroqProvider(apiKey) {
  // Groq: https://console.groq.com — capa gratuita muy generosa (14 400 req/día)
  if (!apiKey) return null
  return {
    name: 'Groq · Llama 3.3',
    async send(history, userMessage, chapterContext) {
      let content = userMessage
      if (chapterContext) {
        content = `[Contexto: Capítulo ${chapterContext.number}]\n[Fragmento:\n${chapterContext.text?.substring(0, 2000) || ''}...]\n\n${userMessage}`
      }
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.slice(-10).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
        { role: 'user', content }
      ]
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, temperature: 0.7, max_tokens: 2048 })
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        const e = new Error(err.error?.message || `Groq error ${resp.status}`)
        e.status = resp.status
        throw e
      }
      const data = await resp.json()
      return data.choices?.[0]?.message?.content || 'Sin respuesta'
    }
  }
}

function makeMistralProvider(apiKey) {
  // Mistral AI (Francia): https://console.mistral.ai — capa gratuita
  if (!apiKey) return null
  return {
    name: 'Mistral AI',
    async send(history, userMessage, chapterContext) {
      let content = userMessage
      if (chapterContext) {
        content = `[Contexto: Capítulo ${chapterContext.number}]\n[Fragmento:\n${chapterContext.text?.substring(0, 2000) || ''}...]\n\n${userMessage}`
      }
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.slice(-10).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
        { role: 'user', content }
      ]
      const resp = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'mistral-small-latest', messages, temperature: 0.7, max_tokens: 2048 })
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        const e = new Error(err.error?.message || `Mistral error ${resp.status}`)
        e.status = resp.status
        throw e
      }
      const data = await resp.json()
      return data.choices?.[0]?.message?.content || 'Sin respuesta'
    }
  }
}

function makeOpenRouterProvider(apiKey) {
  // OpenRouter: https://openrouter.ai — modelos gratuitos con clave gratis (Qwen, DeepSeek, etc.)
  if (!apiKey) return null
  return {
    name: 'OpenRouter · Qwen',
    async send(history, userMessage, chapterContext) {
      let content = userMessage
      if (chapterContext) {
        content = `[Contexto: Capítulo ${chapterContext.number}]\n[Fragmento:\n${chapterContext.text?.substring(0, 2000) || ''}...]\n\n${userMessage}`
      }
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.slice(-10).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
        { role: 'user', content }
      ]
      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://cyberrayuela.pages.dev',
          'X-Title': 'CyberRayuela'
        },
        body: JSON.stringify({ model: 'qwen/qwen3-8b:free', messages, temperature: 0.7, max_tokens: 2048 })
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        const e = new Error(err.error?.message || `OpenRouter error ${resp.status}`)
        e.status = resp.status
        throw e
      }
      const data = await resp.json()
      return data.choices?.[0]?.message?.content || 'Sin respuesta'
    }
  }
}

// ─── COMPOSABLE ──────────────────────────────────────────────────────────────
export function useGemini() {
  const loading = ref(false)
  const error = ref(null)
  const activeProvider = ref('')
  const messages = ref(JSON.parse(localStorage.getItem('cr-ai-messages') || '[]'))

  function buildProviders() {
    return [
      makeGeminiProvider(import.meta.env.VITE_GEMINI_API_KEY),
      makeGroqProvider(import.meta.env.VITE_GROQ_API_KEY),
      makeMistralProvider(import.meta.env.VITE_MISTRAL_API_KEY),
      makeOpenRouterProvider(import.meta.env.VITE_OPENROUTER_API_KEY),
    ].filter(Boolean)
  }

  async function sendMessage(userMessage, chapterContext = null) {
    if (!userMessage?.trim()) return null

    const providers = buildProviders()
    if (providers.length === 0) {
      error.value = 'No hay API key configurada. Añade VITE_GEMINI_API_KEY, VITE_GROQ_API_KEY, VITE_MISTRAL_API_KEY o VITE_OPENROUTER_API_KEY a tu .env'
      return null
    }

    loading.value = true
    error.value = null

    // Snapshot history before adding current message
    const historySnapshot = [...messages.value]
    messages.value.push({ role: 'user', text: userMessage, timestamp: new Date().toISOString() })

    let lastError = null

    for (const provider of providers) {
      try {
        activeProvider.value = provider.name
        const text = await provider.send(historySnapshot, userMessage, chapterContext)

        messages.value.push({
          role: 'assistant',
          text,
          timestamp: new Date().toISOString(),
          provider: provider.name
        })
        if (messages.value.length > 50) messages.value = messages.value.slice(-50)
        persistMessages()
        loading.value = false
        return text
      } catch (err) {
        const isRetryable = err.status === 429 || err.status === 503 || err.status === 500
        lastError = `${provider.name}: ${err.message || 'error desconocido'}`
        console.warn(`[AI] ${provider.name} falló (${err.status}), probando siguiente proveedor...`, err.message)
        if (!isRetryable) break // no reintentar en errores de configuración (401, 400, etc.)
      }
    }

    // All providers failed → remove the optimistic user message
    messages.value.pop()
    error.value = `Todos los proveedores de IA fallaron. Último error: ${lastError}`
    loading.value = false
    activeProvider.value = ''
    return null
  }

  function clearMessages() {
    messages.value = []
    error.value = null
    activeProvider.value = ''
    localStorage.removeItem('cr-ai-messages')
  }

  function persistMessages() {
    try { localStorage.setItem('cr-ai-messages', JSON.stringify(messages.value.slice(-50))) } catch {}
  }

  return { loading, error, messages, activeProvider, sendMessage, clearMessages }
}
