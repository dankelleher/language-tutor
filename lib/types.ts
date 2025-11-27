import { z } from 'zod';

export const tutorResponseSchema = z.object({
  chatMessage: z.string()
      .max(100)
      .describe('A brief message from the tutor to the student, e.g., encouraging them to keep going, giving them context on the corrections, or greeting them.'),
  englishSentence: z.string().describe('The original input text in English.'),
  submittedSentence: z.string().describe('The submitted input text in the target language.'),
  correctedResponse: z.string().describe('The correct translation of the input text. Only provide this if the user made an attempt at a translation.'),
  explanations: z.array(z
      .string()
      .max(200)
  ).describe('An array of explanations for any mistakes made in the submitted translation.'),
  nextExercise: z.object({
      fullSentence: z.string().describe('The next sentence to translate to the target language, adapted to the student\'s level.'),
      parts: z.array(z.object({
          text: z.string().describe('A part of the sentence, e.g., a word or phrase. Must be contiguous ie "the cat" is valid but "the ... cat" is not.'),
          translation: z.string().describe('The translation of this part into the target language.'),
          notes: z.string().describe('Any notes or explanations about this part, e.g., grammar points, vocabulary tips, etc.'),
      })),
  }),
  progress: z.object({
      evaluatedLevel: z.string().describe('The evaluated language level of the student (A1-C2).'),
      stepsToNextLevel: z.number().describe('The number of exercises or steps the student needs to complete to reach the next language level. Keep this small at first, e.g., 3-5 steps, depending on how the student does.'),
  }),
});

export type TutorResponse = z.infer<typeof tutorResponseSchema>;

type ExercisePart = TutorResponse['nextExercise']['parts'][number];

/** Streaming partial type - handles nested objects and arrays with undefined during streaming */
export type StreamingTutorResponse = {
  chatMessage?: string;
  englishSentence?: string;
  submittedSentence?: string;
  correctedResponse?: string;
  explanations?: (string | undefined)[];
  nextExercise?: {
    fullSentence?: string;
    parts?: (Partial<ExercisePart> | undefined)[];
  };
  progress?: {
    evaluatedLevel?: string;
    stepsToNextLevel?: number;
  };
};

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type CEFRLevel = typeof CEFR_LEVELS[number];

/**
 * Get the index of a CEFR level (0-5), or -1 if not found
 */
export const getLevelIndex = (level: string): number => {
  const normalized = level.toUpperCase().trim();
  return CEFR_LEVELS.indexOf(normalized as CEFRLevel);
};

export const languages = [
  'German',
  'French',
  'Spanish',
  'Italian',
  'Portuguese',
  'Japanese',
  'Chinese',
  'Korean',
  'Irish',
  'Danish',
] as const;

export type Language = typeof languages[number];
