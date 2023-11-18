import { BaseEmbedding } from 'llamaindex';

const mockEmbeddingPromise = Promise.resolve([1]);

/**
 * A mock embedding model that returns a fixed embedding for any text.
 */
export class MockEmbeddingModel extends BaseEmbedding {
    getTextEmbedding(_text: string): Promise<number[]> {
        return mockEmbeddingPromise;
    }

    getQueryEmbedding(_query: string): Promise<number[]> {
        return mockEmbeddingPromise;
    }
}
