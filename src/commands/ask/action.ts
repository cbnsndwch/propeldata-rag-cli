import path from 'node:path';

import { LLM, VectorStoreIndex, storageContextFromDefaults } from 'llamaindex';

import { ChatGptLlm, ContextChatEngine } from '../../services';
import { multiLine, singleLine } from '../../utils';

import { ActionOptions } from './contracts';

const DESIRED_RESPONSE_SCHEMA = `{"$schema": "http://json-schema.org/draft-07/schema#","type":"object","properties":{"gql":{"type":"object","properties":{"query":{"type":"string"},"variables":{"type":"object","additionalProperties":true},"operationName":{"type":"string"}},"required":["query","variables","operationName"]},"remarks":{"type":"string","maxLength":255},"extras":{"type":"object","additionalProperties":true}},"required":["gql","remarks"]}`;

export async function ask(options: ActionOptions) {
    let { question } = options;
    if (!question) {
        // fallback demo eval query
        question = multiLine(
            singleLine(
                'Given the provided GraphQL schema, list the metrics in the account',
                "to determine which metric you'll need to query, then write a query",
                'that answers the following user question:'
            ),
            '',
            singleLine(
                'How many unique visits did the widget with the most visits during',
                'october 2023 receive? Use the token field as visitor identifier.'
            )
        );

        console.log('no question provided, using fallback demo question:');
        console.log(question);
    }

    console.log('loading index from disk...');

    // Split text and create embeddings. Store them in a VectorStoreIndex
    // persist the vector store automatically with the storage context
    const storageContext = await storageContextFromDefaults({
        persistDir: path.resolve(process.cwd(), 'data', 'storage')
    });

    const index = await VectorStoreIndex.init({
        storageContext
    });

    // build a chat engine:
    // - with the index as retriever
    // - with GPT-4 Turbo (128k token context length) as the language model
    // - keeping all other defaults
    const chatEngine = new ContextChatEngine({
        retriever: index.asRetriever(),
        contextSystemPrompt({ context = '' }) {
            return multiLine(
				singleLine(
                    `You are an AI assistant uses knowledge about PropelData's`,
                    `GraphQL API schema and GraphQL in general to generate`,
                    `GraphQL queries that can be run against the API. You should`,
                    `always respond exclusively with a single JSON that matches`,
                    `the following schema:`
                ),
                '```json',
                DESIRED_RESPONSE_SCHEMA,
                '```',
                'Use the context below to inform your response:',
                '<START OF CONTEXT>',
                context,
                '<END OF CONTEXT>'
            );
        },
        chatModel: new ChatGptLlm({
            model: 'gpt-4-1106-preview',
            temperature: 0,
            additionalChatOptions: {
                response_format: {
                    type: 'json_object'
                }
            }
        }) as LLM
    });

    console.log('retrieving context and sending question to chat LLM...');
    const response = await chatEngine.chat(question);

    // Output response
    console.log('LLM response received:');
    console.log(response.toString());
}
