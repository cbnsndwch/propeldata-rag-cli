import {
    Event as RagEvent,
    Response as RagResponse,
    BaseRetriever,
    ChatEngine,
    ChatMessage,
    ContextGenerator,
    ContextSystemPrompt,
    DefaultContextGenerator,
    LLM,
    OpenAI
} from 'llamaindex';
import { v4 as uuidv4 } from 'uuid';

export type ContextChatEngineOptions = {
    retriever: BaseRetriever;
    chatModel?: LLM;
    chatHistory?: ChatMessage[];
    contextSystemPrompt?: ContextSystemPrompt;
};

/**
 * ContextChatEngine uses the Index to get the appropriate context for each query.
 * The context is stored in the system prompt, and the chat history is preserved,
 * ideally allowing the appropriate context to be surfaced for each query.
 */
export class ContextChatEngine implements ChatEngine {
    chatModel: LLM;
    chatHistory: ChatMessage[];
    contextGenerator: ContextGenerator;

    constructor(options: ContextChatEngineOptions) {
        const {
            retriever,
            chatModel = new OpenAI({ model: 'gpt-4-1106-preview' }),
            chatHistory = [],
            contextSystemPrompt
        } = options;

        this.chatModel = chatModel;
        this.chatHistory = chatHistory;
        this.contextGenerator = new DefaultContextGenerator({
            retriever,
            contextSystemPrompt
        });
    }

    reset() {
        this.chatHistory = [];
    }

    async chat<
        T extends boolean | undefined = undefined,
        R = T extends true ? AsyncGenerator<string, void, unknown> : RagResponse
    >(
        message: string,
        chatHistory: ChatMessage[] = this.chatHistory,
        streaming?: T
    ): Promise<R> {
        if (streaming) {
            throw new Error('Streaming not supported');
        }

        const response = await this.generateChatCompletion(
            message,
            chatHistory
        );
        return response as R;
    }

    protected async generateChatCompletion(
        message: string,
        chatHistory: ChatMessage[]
    ): Promise<RagResponse> {
        const parentEvent: RagEvent = {
            id: uuidv4(),
            type: 'wrapper',
            tags: ['final']
        };

        const context = await this.contextGenerator.generate(
            message,
            parentEvent
        );

        chatHistory.push({ content: message, role: 'user' });

        const response = await this.chatModel.chat(
            [context.message, ...chatHistory],
            parentEvent
        );
        chatHistory.push(response.message);

        this.chatHistory = chatHistory;

        return new RagResponse(
            response.message.content,
            context.nodes.map(r => r.node)
        );
    }
}
