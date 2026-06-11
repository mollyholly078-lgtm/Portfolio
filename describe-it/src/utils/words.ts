import type { Category } from '../types'

export const HARDCODED_WORDS: Record<Category, string[]> = {
  'Countries': ['Japan', 'Brazil', 'Egypt', 'Canada', 'Australia', 'India', 'France', 'Italy', 'Mexico', 'Thailand', 'Spain', 'Argentina'],
  'Food & Drinks': ['Pizza', 'Sushi', 'Tacos', 'Pasta', 'Burger', 'Ice Cream', 'Chocolate', 'Salad', 'Coffee', 'Pancakes', 'Curry', 'Bacon'],
  'Celebrities': ['Taylor Swift', 'Leonardo DiCaprio', 'Beyonce', 'Dwayne Johnson', 'Ariana Grande', 'Tom Cruise', 'Lady Gaga', 'Will Smith', 'Emma Watson', 'Elon Musk'],
  'Objects / Household Items': ['Toothbrush', 'Microwave', 'Umbrella', 'Pillow', 'Candle', 'Backpack', 'Mirror', 'Scissors', 'Clock', 'Blanket'],
  'Animals': ['Elephant', 'Penguin', 'Dolphin', 'Kangaroo', 'Octopus', 'Flamingo', 'Giraffe', 'Butterfly', 'Hamster', 'Chameleon'],
  'Sports': ['Basketball', 'Soccer', 'Tennis', 'Baseball', 'Swimming', 'Boxing', 'Cycling', 'Surfing', 'Skiing', 'Golf'],
  'Music & Songs': ['Bohemian Rhapsody', 'Billie Jean', 'Imagine', 'Shape of You', 'Like a Rolling Stone', 'Smells Like Teen Spirit', 'Hotel California', 'Thriller', 'Yesterday'],
  'Video Games': ['Minecraft', 'Fortnite', 'Super Mario', 'The Legend of Zelda', 'Among Us', 'Call of Duty', 'Grand Theft Auto', 'Tetris', 'Pokemon', 'Skyrim'],
  'Nature & Places': ['Grand Canyon', 'Amazon River', 'Mount Everest', 'Niagara Falls', 'Sahara Desert', 'Great Barrier Reef', 'Northern Lights', 'Stonehenge', 'Victoria Falls'],
}

export function getFallbackWords(category: Category, count: number = 3): string[] {
  const pool = HARDCODED_WORDS[category]
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

export function getLetterBlanks(word: string): string {
  return word.replace(/[a-zA-Z0-9]/g, '_').replace(/[^a-zA-Z0-9_]/g, ' ')
}
