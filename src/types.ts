export interface AlphabetLetter {
  char: string;
  wordExample: string;
  emoji: string;
  category: 'vokal' | 'konsonan';
  color: string;
  textColor: string;
  borderColor: string;
  accentColor: string;
}

export interface SyllableWord {
  word: string;
  syllables: string[];
  emoji: string;
  category: string;
  color: string;
}

export interface GameWord {
  word: string;
  hint: string;
  emoji: string;
  category: string;
  difficulty: 'mudah' | 'sedang' | 'menantang';
}

export interface UserStats {
  stars: number;
  unlockedLettersCount: number;
  completedSyllablesCount: number;
  solvedGamesCount: number;
  completedSentencesCount: number;
  streak: number;
  kidName?: string;
}

export interface SimpleSentence {
  id: string;
  text: string;
  words: string[];
  emoji: string;
  color: string;
  textColor: string;
  borderColor: string;
  bgGradient: string;
}
