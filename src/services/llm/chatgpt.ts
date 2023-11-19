import {
    CallbackManager,
    ChatMessage,
    ChatResponse,
    LLM,
    MessageType,
    Tokenizers,
    globalsHelper
} from 'llamaindex';
import _isEqual from 'lodash/isEqual';
import OpenAI, { ClientOptions } from 'openai';
import type {
    ChatCompletionAssistantMessageParam,
    ChatCompletionMessageParam,
    ChatCompletionSystemMessageParam,
    ChatCompletionUserMessageParam
} from 'openai/resources/chat';

export const OPEN_AI_MODELS = {
    // GPT-3.5
    'gpt-3.5-turbo-1106': { contextWindow: 16384 } as const,
    // GPT-4
    'gpt-4-1106-preview': { contextWindow: 128000 } as const
} as const;

export type OpenAIModels = typeof OPEN_AI_MODELS;
export type OpenAIModelName = keyof OpenAIModels;

type SessionCacheEntry = {
    session: OpenAISession;
    options: ClientOptions;
};

// I'm not 100% sure this is necessary vs. just starting a new session
// every time we make a call. They say they try to reuse connections
// so in theory this is more efficient, but we should test it in the future.
const sessionCache: SessionCacheEntry[] = [];

type SupportedMessageParams =
    | ChatCompletionSystemMessageParam
    | ChatCompletionUserMessageParam
    | ChatCompletionAssistantMessageParam;

export class OpenAISession {
    openai: OpenAI;

    constructor(options: ClientOptions = {}) {
        if (!options.apiKey) {
            if (typeof process !== undefined) {
                options.apiKey = process.env.OPENAI_API_KEY;
            }
        }

        if (!options.apiKey) {
            // Overriding OpenAI package's error message
            throw new Error('Set OpenAI Key in OPENAI_API_KEY env variable');
        }

        this.openai = new OpenAI({
            ...options
            // defaultHeaders: { "OpenAI-Beta": "assistants=v1" },
        });
    }
}

/**
 * Get a session for the OpenAI API. If one already exists with the same options,
 * it will be returned. Otherwise, a new session will be created.
 */
export function getOpenAISession(options: ClientOptions = {}) {
    let session = sessionCache.find(session =>
        _isEqual(session.options, options)
    )?.session;

    if (!session) {
        session = new OpenAISession(options);
        sessionCache.push({ session, options });
    }

    return session;
}

/**
 * OpenAI LLM implementation
 */
export class ChatGptLlm {
    hasStreaming = false;

    // Per completion OpenAI params
    model: OpenAIModelName;
    temperature: number;
    topP: number;
    maxTokens?: number;
    additionalChatOptions?: Omit<
        Partial<OpenAI.Chat.ChatCompletionCreateParams>,
        | 'max_tokens'
        | 'messages'
        | 'model'
        | 'temperature'
        | 'top_p'
        | 'streaming'
    >;

    // OpenAI session params
    apiKey?: string = undefined;
    maxRetries: number;
    timeout?: number;
    session: OpenAISession;
    additionalSessionOptions?: Omit<
        Partial<ClientOptions>,
        'apiKey' | 'maxRetries' | 'timeout'
    >;

    callbackManager?: CallbackManager;

    constructor(options: Partial<ChatGptLlm> = {}) {
        const {
            // cheaper, faster than llamaindex's default
            model = 'gpt-3.5-turbo-1106',

            // more deterministic is better by default
            temperature = 0.1,

            // generate one completion choice by default
            topP = 1,

            // retry up to 10 times by default
            maxRetries = 10,

            // time out after 60 seconds by default
            timeout = 60_000,

            // these default to undefined
            maxTokens,
            apiKey,
            additionalChatOptions,
            additionalSessionOptions,
            callbackManager,
            session
        } = options;

        this.model = model;
        this.temperature = temperature;
        this.topP = topP;
        this.maxTokens = maxTokens;

        this.maxRetries = maxRetries;
        this.timeout = timeout;
        this.additionalChatOptions = additionalChatOptions;
        this.additionalSessionOptions = additionalSessionOptions;

        this.apiKey = apiKey;
        this.session =
            session ??
            getOpenAISession({
                apiKey: this.apiKey,
                maxRetries: this.maxRetries,
                timeout: this.timeout,
                ...this.additionalSessionOptions
            });

        this.callbackManager = callbackManager;
    }

    get metadata() {
        return {
            model: this.model,
            temperature: this.temperature,
            topP: this.topP,
            maxTokens: this.maxTokens,
            contextWindow: OPEN_AI_MODELS[this.model].contextWindow,
            tokenizer: Tokenizers.CL100K_BASE
        };
    }

    tokens(messages: ChatMessage[]): number {
        // for latest OpenAI models, see https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb
        const tokenizer = globalsHelper.tokenizer(this.metadata.tokenizer);
        const tokensPerMessage = 3;

        // every reply is primed with <|im_start|>assistant<|im_sep|>
        // so we start with 3 tokens
        let numTokens = tokensPerMessage;

        for (const message of messages) {
            numTokens += tokensPerMessage;
            for (const value of Object.values(message)) {
                numTokens += tokenizer(value).length;
            }
        }

        return numTokens;
    }

    mapMessageType(messageType: MessageType): SupportedMessageParams['role'] {
        switch (messageType) {
            case 'user':
            case 'assistant':
            case 'system':
                return messageType;
            case 'function':
            default:
                return 'user';
        }
    }

    async chat(messages: ChatMessage[]): Promise<ChatResponse> {
        const baseRequestParams: OpenAI.Chat.ChatCompletionCreateParams = {
            model: this.model,
            temperature: this.temperature,
            max_tokens: this.maxTokens,
            messages: messages.map(message => {
                const msg: SupportedMessageParams = {
                    role: this.mapMessageType(message.role),
                    content: message.content
                };
                return msg;
            }),
            top_p: this.topP,
            ...this.additionalChatOptions
        };

        // Non-streaming
        const response = await this.session.openai.chat.completions.create({
            ...baseRequestParams,
            stream: false
        });
        const content = response.choices[0].message?.content ?? '';

        const result: ChatResponse = {
            raw: response,
            message: {
                content,
                role: response.choices[0].message.role
            }
        };
        return result;
    }

    async complete(prompt: string) {
        return this.chat([
            {
                content: prompt,
                role: 'user'
            }
        ]);
    }
}
