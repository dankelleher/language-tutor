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
  evaluatedLevel: z.string().describe('The evaluated language level of the student (A1-C2).'),
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
  evaluatedLevel?: string;
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
