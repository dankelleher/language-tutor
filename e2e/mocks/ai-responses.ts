import type { TutorResponse } from '../../lib/types.js';

/** Template for initial greeting response */
export const greetingResponse: TutorResponse = {
  chatMessage: "Welcome! I'm your German tutor. Let's start learning!",
  englishSentence: '',
  submittedSentence: '',
  correctedResponse: '',
  explanations: [],
  nextExercise: {
    fullSentence: 'The cat is small.',
    parts: [
      {
        text: 'The cat',
        translation: 'Die Katze',
        notes: 'Feminine noun with definite article',
      },
      {
        text: 'is',
        translation: 'ist',
        notes: "Third person singular of 'sein'",
      },
      {
        text: 'small',
        translation: 'klein',
        notes: 'Adjective in predicate position',
      },
    ],
  },
  progress: {
    overallLevel: 'A1',
    categoryLevels: [
      { category: 'vocabulary', level: 'A1' },
      { category: 'grammar', level: 'A1' },
      { category: 'tenses', level: 'A1' },
      { category: 'conversation', level: 'A1' },
    ],
    stepsToNextLevel: 5,
  },
};

/** Template for correct answer response */
export const correctAnswerResponse: TutorResponse = {
  chatMessage: "Excellent work! That's exactly right!",
  englishSentence: 'The cat is small.',
  submittedSentence: 'Die Katze ist klein.',
  correctedResponse: 'Die Katze ist klein.',
  explanations: [],
  nextExercise: {
    fullSentence: 'I drink water.',
    parts: [
      {
        text: 'I',
        translation: 'Ich',
        notes: 'First person singular pronoun',
      },
      {
        text: 'drink',
        translation: 'trinke',
        notes: 'First person singular present tense',
      },
      {
        text: 'water',
        translation: 'Wasser',
        notes: 'Neuter noun (das Wasser)',
      },
    ],
  },
  progress: {
    overallLevel: 'A1',
    categoryLevels: [
      { category: 'vocabulary', level: 'A1' },
      { category: 'grammar', level: 'A1' },
      { category: 'tenses', level: 'A1' },
      { category: 'conversation', level: 'A1' },
    ],
    stepsToNextLevel: 4,
  },
};

/** Template for incorrect answer with corrections */
export const incorrectAnswerResponse: TutorResponse = {
  chatMessage: 'Good try! Let me help you with a few things.',
  englishSentence: 'The cat is small.',
  submittedSentence: 'Die Katze ist gross.',
  correctedResponse: 'Die Katze ist klein.',
  explanations: [
    "'klein' means small, while 'gross' means big/large. Check the meaning of adjectives.",
    'The word order and grammar were correct though!',
  ],
  nextExercise: {
    fullSentence: 'The dog is big.',
    parts: [
      {
        text: 'The dog',
        translation: 'Der Hund',
        notes: 'Masculine noun with definite article',
      },
      {
        text: 'is',
        translation: 'ist',
        notes: "Third person singular of 'sein'",
      },
      {
        text: 'big',
        translation: 'gross',
        notes: 'Now using the correct adjective',
      },
    ],
  },
  progress: {
    overallLevel: 'A1',
    categoryLevels: [
      { category: 'vocabulary', level: 'A1' },
      { category: 'grammar', level: 'A1' },
      { category: 'tenses', level: 'A1' },
      { category: 'conversation', level: 'A1' },
    ],
    stepsToNextLevel: 5,
  },
};

/** Template for level-up response */
export const levelUpResponse: TutorResponse = {
  chatMessage: "Congratulations! You've leveled up to A2!",
  englishSentence: 'I have a red car.',
  submittedSentence: 'Ich habe ein rotes Auto.',
  correctedResponse: 'Ich habe ein rotes Auto.',
  explanations: [],
  nextExercise: {
    fullSentence: 'She went to the store yesterday.',
    parts: [
      {
        text: 'She',
        translation: 'Sie',
        notes: 'Third person feminine pronoun',
      },
      {
        text: 'went',
        translation: 'ging',
        notes: "Simple past of 'gehen'",
      },
      {
        text: 'to the store',
        translation: 'zum Laden',
        notes: 'Contraction: zu + dem = zum',
      },
      {
        text: 'yesterday',
        translation: 'gestern',
        notes: 'Time adverb',
      },
    ],
  },
  progress: {
    overallLevel: 'A2',
    categoryLevels: [
      { category: 'vocabulary', level: 'A2' },
      { category: 'grammar', level: 'A2' },
      { category: 'tenses', level: 'A1' },
      { category: 'conversation', level: 'A2' },
    ],
    stepsToNextLevel: 5,
  },
};

/** Template for French greeting (for language selection tests) */
export const frenchGreetingResponse: TutorResponse = {
  chatMessage: "Bienvenue! Je suis votre tuteur de francais. Commençons!",
  englishSentence: '',
  submittedSentence: '',
  correctedResponse: '',
  explanations: [],
  nextExercise: {
    fullSentence: 'The cat is small.',
    parts: [
      {
        text: 'The cat',
        translation: 'Le chat',
        notes: 'Masculine noun with definite article',
      },
      {
        text: 'is',
        translation: 'est',
        notes: "Third person singular of 'être'",
      },
      {
        text: 'small',
        translation: 'petit',
        notes: 'Adjective (masculine singular)',
      },
    ],
  },
  progress: {
    overallLevel: 'A1',
    categoryLevels: [
      { category: 'vocabulary', level: 'A1' },
      { category: 'grammar', level: 'A1' },
      { category: 'tenses', level: 'A1' },
      { category: 'conversation', level: 'A1' },
    ],
    stepsToNextLevel: 5,
  },
};
