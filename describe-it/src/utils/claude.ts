import type { Category } from '../types'
import { getFallbackWords } from './words'

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

interface ClaudeResponse {
  content: { text: string }[]
}

export async function generateWords(category: Category): Promise<string[]> {
  if (!CLAUDE_API_KEY) {
    console.warn('No Claude API key found, using fallback words')
    return getFallbackWords(category, 3)
  }

  const prompt = `Give me 3 unique, well-known ${category} names suitable for a word guessing party game. Difficulty: medium. Return ONLY a valid JSON array of 3 strings. No explanation, no markdown, no extra text.`

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 150,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`)
      }

      const data: ClaudeResponse = await response.json()
      const text = data.content[0].text.trim()
      const words: string[] = JSON.parse(text)

      if (!Array.isArray(words) || words.length !== 3 || !words.every(w => typeof w === 'string')) {
        throw new Error('Invalid response format')
      }

      return words
    } catch (err) {
      console.warn(`Claude API attempt ${attempt + 1} failed:`, err)
      if (attempt === 1) {
        return getFallbackWords(category, 3)
      }
    }
  }

  return getFallbackWords(category, 3)
}
