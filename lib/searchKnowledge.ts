// /lib/searchKnowledge.ts
import { civicKnowledge, CivicChunk } from './civicKnowledge.ts';

export interface SearchResult extends CivicChunk {
  score: number;
}

/**
 * Searches the civic knowledge base using keyword matching.
 * @param query The user's search query.
 * @returns A sorted list of relevant civic knowledge chunks.
 */
export function searchCivicKnowledge(query: string): SearchResult[] {
  if (!query || query.trim().length === 0) return [];

  const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
  if (searchTerms.length === 0) return [];

  const results: SearchResult[] = [];

  for (const chunk of civicKnowledge) {
    let score = 0;
    const titleLower = chunk.title.toLowerCase();
    const contentLower = chunk.content.toLowerCase();
    const keywordsLower = chunk.keywords.map(k => k.toLowerCase());

    for (const term of searchTerms) {
      // 1. Exact match in title (highest weight)
      if (titleLower.includes(term)) {
        score += 10;
      }

      // 2. Exact match in keywords (medium weight)
      for (const keyword of keywordsLower) {
        if (keyword.includes(term)) {
          score += 5;
          // If the term is exactly a keyword, give extra points
          if (keyword === term) score += 5;
        }
      }

      // 3. Match in content (low weight)
      if (contentLower.includes(term)) {
        score += 1;
      }
    }

    if (score > 0) {
      results.push({ ...chunk, score });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}
