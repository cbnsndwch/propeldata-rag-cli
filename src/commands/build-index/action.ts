import fs from 'node:fs';
import path from 'node:path';

import {
    ContextChatEngine,
    Document,
    OpenAI,
    TextNode,
    VectorStoreIndex,
    serviceContextFromDefaults,
    storageContextFromDefaults
} from 'llamaindex';

import { multiLine, singleLine } from '../../utils';

import { ActionOptions } from './contracts';

export async function buildIndex({ inputDir }: ActionOptions) {
    // Split text and create embeddings. Store them in a VectorStoreIndex
    // persist the vector store automatically with the storage context
    const storageContext = await storageContextFromDefaults({
        persistDir: path.resolve(process.cwd(), 'data', 'storage')
    });

    // override the default node parser to use the entire text of each document as the node
    const serviceContext = serviceContextFromDefaults({
        nodeParser: {
            getNodesFromDocuments(documents: Document[]): TextNode[] {
                return documents.flatMap(
                    document =>
                        new TextNode({
                            text: document.text,
                            startCharIdx: document.startCharIdx,
                            endCharIdx: document.endCharIdx
                        })
                );
            }
        }
    });

    // load documents
    const documents = fs
        .readdirSync(inputDir)
        .filter(file => file.endsWith('.graphql') || file.endsWith('.gql'))
        .map(file => {
            const sdl = fs.readFileSync(path.resolve(inputDir, file), 'utf-8');
            return new Document({ text: sdl });
        });

    const index = await VectorStoreIndex.fromDocuments(documents, {
        storageContext,
        serviceContext
    });

    // build a chat engine:
    // - with the index as retriever
    // - with GPT-4 Turbo (128k token context length) as the language model
    // - keeping all other defaults
    const chatEngine = new ContextChatEngine({
        retriever: index.asRetriever(),
        chatModel: new OpenAI({
            model: 'gpt-4-1106-preview',
            temperature: 0
        })
    });

    // demo eval query
    const query = multiLine(
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
    const response = await chatEngine.chat(query);

    // Output response
    console.log(response.toString());
}
