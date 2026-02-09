import { Platform } from '../shared/interfaces/checkpoint.js';

/**
 * Configuration for each AI platform's DOM structure and behavior.
 */
export interface PlatformConfig {
    platform: Platform;
    hostnames: string[];
    urlPathPattern: RegExp;
    selectors: {
        mainContainer: string;
        userMessage: string;
        messageText: string;
        title?: string;
    };
}

/**
 * Centralized configurations for all supported AI platforms.
 */
export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
    chatgpt: {
        platform: 'chatgpt',
        hostnames: ['chat.openai.com', 'chatgpt.com'],
        urlPathPattern: /\/c\/([a-f0-9-]+)/,
        selectors: {
            mainContainer: 'main',
            userMessage: '[data-message-author-role="user"], .user-message-bubble-color',
            messageText: '.whitespace-pre-wrap, [data-message-content]',
            title: 'h1'
        }
    },
    claude: {
        platform: 'claude',
        hostnames: ['claude.ai'],
        urlPathPattern: /\/chat\/([a-f0-9-]+)/,
        selectors: {
            mainContainer: 'main',
            userMessage: '[data-is-user-message="true"], [data-testid="user-message"], .font-user-message',
            messageText: '.whitespace-pre-wrap',
            title: '[data-testid="conversation-title"]'
        }
    },
    gemini: {
        platform: 'gemini',
        hostnames: ['gemini.google.com'],
        urlPathPattern: /\/chat\/([a-zA-Z0-9_-]+)/,
        selectors: {
            mainContainer: 'main',
            userMessage: '[data-test-id*="user"], .user-message',
            messageText: '.user-message, [data-test-id*="user"]', // Adjust as needed for Gemini's structure
            title: 'h1, [role="heading"]'
        }
    }
};
