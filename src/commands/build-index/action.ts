import fs from 'node:fs';
import path from 'node:path';

import {
    Document,
    TextNode,
    VectorStoreIndex,
    serviceContextFromDefaults,
    storageContextFromDefaults
} from 'llamaindex';

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
            return new Document({
                id_: file,
                text: sdl
            });
        });

    // build the index, the storage context take care of automatically persisting to disk
    await VectorStoreIndex.fromDocuments(documents, {
        storageContext,
        serviceContext
    });
}
