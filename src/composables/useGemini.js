import { ref } from 'vue'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const SYSTEM_PROMPT = `Eres un experto en literatura latinoamericana del siglo XX, especializado en la obra de Julio Cortázar, particularmente en "Rayuela" (1963). Tu conocimiento abarca:

- La estructura experimental de la novela (Tablero de Dirección, los 155 capítulos, las tres partes)
- Los personajes: Horacio Oliveira, la Maga (Lucía), Gregorovius, Traveler, Talita, Gekrepten, Berthe Trépat, Morelli, Rocamadour, el Club de la Serpiente
- Los temas: la búsqueda metafísica, el azar, la anti-novela, el lector cómplice, París vs Buenos Aires, el jazz como lenguaje
- El contexto del Boom Latinoamericano y las influencias surrealistas
- Las referencias musicales (jazz, tango, música clásica) presentes en toda la obra
- La filosofía detrás de la novela: existencialismo, patafísica, el sentido del absurdo

Respondes siempre en español, con profundidad académica pero accesible. Usas citas textuales cuando es pertinente. Conectas los capítulos entre sí mostrando los hilos narrativos que Cortázar tejió deliberadamente.

Cuando analices un capítulo, menciona su posición en el Tablero de Dirección y cómo se conecta con los capítulos anterior y siguiente en la lectura salteada.`

export function useGemini() {
  const loading = ref(false)
  const error = ref(null)
  const messages = ref(JSON.parse(localStorage.getItem('cr-ai-messages') || '[]'))

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  async function sendMessage(userMessage, chapterContext = null) {
    if (!apiKey) {
      error.value = 'API key de Gemini no configurada'
      return null
    }

    loading.value = true
    error.value = null

    // Build the prompt with context
    let fullPrompt = ''
    if (chapterContext) {
      fullPrompt += `[Contexto: El lector está leyendo el Capítulo ${chapterContext.number}]\n`
      fullPrompt += `[Texto del capítulo (fragmento):\n${chapterContext.text?.substring(0, 2000) || ''}...]\n\n`
    }
    fullPrompt += userMessage

    // Add to messages
    messages.value.push({
      role: 'user',
      text: userMessage,
      timestamp: new Date().toISOString()
    })

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents: [
            ...messages.value.slice(-10).map(m => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.text }]
            })),
            ...(chapterContext ? [{
              role: 'user',
              parts: [{ text: fullPrompt }]
            }] : [])
          ].filter((v, i, a) => {
            // Deduplicate the last user message if chapterContext was used
            if (chapterContext && i === a.length - 2 && v.parts[0].text === userMessage) return false
            return true
          }),
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 2048
          }
        })
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error?.message || `Error ${response.status}`)
      }

      const data = await response.json()
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta'

      messages.value.push({
        role: 'assistant',
        text: aiText,
        timestamp: new Date().toISOString()
      })

      // Keep only last 50 messages
      if (messages.value.length > 50) {
        messages.value = messages.value.slice(-50)
      }

      persistMessages()
      return aiText
    } catch (err) {
      error.value = err.message
      // Remove the failed user message
      messages.value.pop()
      return null
    } finally {
      loading.value = false
    }
  }

  function clearMessages() {
    messages.value = []
    persistMessages()
  }

  function persistMessages() {
    localStorage.setItem('cr-ai-messages', JSON.stringify(messages.value))
  }

  return {
    loading,
    error,
    messages,
    sendMessage,
    clearMessages
  }
}
