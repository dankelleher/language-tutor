import 'dotenv/config';
import {streamObject, ModelMessage, generateText} from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

const language = "German" // "French"

const messages: ModelMessage[] = [
    {
        role: 'system',
        content: 'You are a language tutor that corrects translations from English to ' + language + '.' +
            'Start by greeting them, and by creating a random sentence to ask the student to translate. Afterwards, for each translation the student provides,' +
            'correct their translation, explain any mistakes they made, and provide the next sentence.' +
            'Also, adapt your evaluation of their french level (A1-C2) and adapt the difficulty of the next sentence accordingly to meet their level.' +
            'Start easy.'
    }, {
        role: 'user',
        content: `Greet me and give me the first sentence to translate to ${language}.`
    }
]

const firstSentence = await generateText({
    model: anthropic('claude-sonnet-4-5-20250929'),
    messages
});

console.log(firstSentence.text)

messages.push({
    role: 'assistant',
    content: firstSentence.text
})

while(true) {
    // read in next input, terminated on EOL
    const input = await new Promise<string>((resolve) => {
        let inputData = '';
        process.stdin.on('data', (chunk) => {
            inputData += chunk;
            if (inputData.endsWith('\n')) {
                resolve(inputData.trim());
            }

        })
    })

    messages.push({
        role: 'user',
        content: input
    })

    const request = streamObject({
        model: anthropic('claude-sonnet-4-5-20250929'),
        messages,
        schema: z.object({
            chatMessage: z.string().describe('A brief message from the tutor to the student, e.g., encouraging them to keep going, giving them context on the corrections, or greeting them.'),
            englishSentence: z.string().describe('The original input text in English.'),
            submittedSentence: z.string().describe('The submitted input text in ' + language + '.'),
            correctedResponse: z.string().describe('The correct translation of the input text.'),
            explanations: z.string().array().describe('An array of explanations for any mistakes made in the submitted translation.'),
            nextSentence: z.string().describe('The next sentence to translate to ' + language + ', adapted to the student\'s level.'),
            evaluatedLevel: z.string().describe('The evaluated ' + language + ' level of the student (A1-C2).'),
        }),
    });

    for await (const partialObject of request.partialObjectStream) {
        console.clear();
        console.log(partialObject);
    }

    messages.push({
        role: 'assistant',
        content: JSON.stringify(await request.object)
    })
};


