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

  const categoryHints: Record<string, string> = {
    'Countries': 'countries (e.g. Japan, Brazil, Egypt, Australia, France, Italy, Mexico, Thailand, Spain, Canada)',
    'Food & Drinks': 'food or drink items (e.g. Pizza, Sushi, Tacos, Pasta, Burger, Ice Cream, Chocolate, Pancakes)',
    'Celebrities': 'famous celebrity names (e.g. Taylor Swift, Leonardo DiCaprio, Beyonce, Dwayne Johnson, Tom Cruise)',
    'Objects / Household Items': 'household objects (e.g. Toothbrush, Microwave, Umbrella, Pillow, Candle, Backpack, Mirror)',
    'Animals': 'animals (e.g. Elephant, Penguin, Dolphin, Kangaroo, Octopus, Flamingo, Giraffe, Butterfly)',
    'Sports': 'sports (e.g. Basketball, Soccer, Tennis, Baseball, Swimming, Boxing, Cycling, Surfing)',
    'Music & Songs': 'songs or music artists (e.g. Bohemian Rhapsody, Billie Jean, Imagine, Shape of You, Thriller)',
    'Video Games': 'video game names (e.g. Minecraft, Fortnite, Super Mario, The Legend of Zelda, Among Us, Call of Duty)',
    'Nature & Places': 'natural landmarks or places (e.g. Grand Canyon, Amazon River, Mount Everest, Niagara Falls, Sahara Desert)',
  }
  const hint = categoryHints[category] || `${category} items`
  const prompt = `You are generating words for a party word-guessing game called Catkey.
Category: "${category}"

Generate 3 unique, well-known ${hint}. Difficulty: medium.
The words should be things that players know and can describe to others.

Return ONLY a valid JSON array of 3 strings (e.g. ["Word1", "Word2", "Word3"]).
No explanation, no markdown, no extra text.`

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
